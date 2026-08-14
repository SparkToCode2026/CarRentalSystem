/* ============================================================
   RoadKey — Rental workflow shared JS
   Used by BOTH pages/rentals.html (list) and
   pages/rental-create.html (create / edit / details).
   Talks to the real RentalController (CarRentalSystemContext).
   ============================================================

   ASSUMPTIONS TO VERIFY / ADJUST:
   - Pages are assumed to be served from the same origin as the
     API (e.g. this "pages" folder lives in the API project's
     wwwroot), so requests use relative paths like "/Rental/...".
     If the frontend is hosted separately, set API_BASE to the
     API's base URL, e.g. "https://localhost:7071".
   - RELATED_ENDPOINTS below are best-guess routes for Car / User /
     Branch / DriverProfile, based on the naming pattern used
     elsewhere in this project. If your controllers use different
     route names, update the four entries below — everything else
     keeps working unchanged.
   - Rental.Car / Rental.User / Rental.Branch / Rental.DriverProfile
     are [JsonIgnore] in the model, so the API only returns the
     scalar fields + foreign keys (CarId, userId, BranchId,
     DriverProfile_ID). This file fetches Cars/Users/Branches/
     DriverProfiles separately and joins them client-side by ID.

   HOW rental-create.html DECIDES WHAT TO SHOW (via URL query string):
   - no "id"                 -> Create form
   - "id" present, no "edit"  -> Details view for that rental
   - "id" present + "edit=1"  -> Edit form, pre-filled

   HOW THIS FILE DECIDES WHICH PAGE IT'S ON:
   - If #rentalsTableContainer exists in the DOM -> initializes the
     rentals.html list page.
   - If #rentalForm exists in the DOM -> initializes the
     rental-create.html create/edit/details page.
   Each page only wires up the elements it actually has, so loading
   this one shared script never throws "element not found" errors
   on either page.
*/

const API_BASE = ''; // e.g. 'https://localhost:7071' if hosted separately

const RENTAL_ENDPOINTS = {
    add: `${API_BASE}/Rental/AddRental`,
    update: id => `${API_BASE}/Rental/UpdateRental?id=${id}`,
    updateStatus: (id, status) => `${API_BASE}/Rental/UpdateRentalStatus?id=${id}&status=${encodeURIComponent(status)}`,
    remove: id => `${API_BASE}/Rental/DeleteRental?id=${id}`,
    getAll: `${API_BASE}/Rental/GetAllRentals`,
    getById: id => `${API_BASE}/Rental/GetRentalById?id=${id}`,
    filter: params => `${API_BASE}/Rental/FilterRentals?${new URLSearchParams(params).toString()}`,
};

// Best-guess routes for related entities — adjust if your controllers differ.
const RELATED_ENDPOINTS = {
    cars: `${API_BASE}/Car/GetALLCars`,
    users: `${API_BASE}/User/GetAllUsers`,
    branches: `${API_BASE}/Branch/GetALLBranches`,
    driverProfiles: `${API_BASE}/DriverProfile/GetAllDriverProfiles`,
};

/* ============ generic fetch wrapper ============ */
async function apiRequest(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        const text = await res.text();
        let data = null;
        if (text) {
            try { data = JSON.parse(text); } catch { data = text; }
        }
        if (!res.ok) {
            const message = typeof data === 'string' ? data : (data?.title || data?.message || `Request failed (${res.status})`);
            return { ok: false, status: res.status, data, error: message };
        }
        return { ok: true, status: res.status, data, error: null };
    } catch (err) {
        return { ok: false, status: 0, data: null, error: 'Could not reach the server. Check your connection and try again.' };
    }
}

const RentalAPI = {
    getAll: () => apiRequest(RENTAL_ENDPOINTS.getAll),
    getById: id => apiRequest(RENTAL_ENDPOINTS.getById(id)),
    filter: params => apiRequest(RENTAL_ENDPOINTS.filter(params)),
    add: payload => apiRequest(RENTAL_ENDPOINTS.add, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => apiRequest(RENTAL_ENDPOINTS.update(id), { method: 'PUT', body: JSON.stringify(payload) }),
    updateStatus: (id, status) => apiRequest(RENTAL_ENDPOINTS.updateStatus(id, status), { method: 'PATCH' }),
    remove: id => apiRequest(RENTAL_ENDPOINTS.remove(id), { method: 'DELETE' }),
};

/* ============ related entity lookups (best effort) ============ */
async function fetchRelatedLookups() {
    const [carsRes, usersRes, branchesRes, driversRes] = await Promise.all([
        apiRequest(RELATED_ENDPOINTS.cars),
        apiRequest(RELATED_ENDPOINTS.users),
        apiRequest(RELATED_ENDPOINTS.branches),
        apiRequest(RELATED_ENDPOINTS.driverProfiles),
    ]);

    return {
        cars: carsRes.ok && Array.isArray(carsRes.data) ? carsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        branches: branchesRes.ok && Array.isArray(branchesRes.data) ? branchesRes.data : [],
        driverProfiles: driversRes.ok && Array.isArray(driversRes.data) ? driversRes.data : [],
        warnings: [
            !carsRes.ok ? 'Cars' : null,
            !usersRes.ok ? 'Customers' : null,
            !branchesRes.ok ? 'Branches' : null,
            !driversRes.ok ? 'Driver profiles' : null,
        ].filter(Boolean),
    };
}

function findById(list, idFields, id) {
    if (!id && id !== 0) return null;
    return list.find(item => idFields.some(f => item[f] === id)) || null;
}

function labelCar(car) {
    if (!car) return null;
    const make = car.Make || car.make;
    const model = car.Model || car.model;
    const plate = car.PlateNumber || car.Plate || car.plateNumber || car.LicensePlate;
    const namePart = [make, model].filter(Boolean).join(' ') || car.Name || car.name;
    return namePart ? (plate ? `${namePart} — ${plate}` : namePart) : (plate || null);
}
function labelUser(user) {
    if (!user) return null;
    return user.name || user.Name || user.FullName || user.fullName || user.email || user.Email || null;
}
function labelBranch(branch) {
    if (!branch) return null;
    return branch.Name || branch.name || branch.City || branch.city || null;
}
function labelDriver(driver) {
    if (!driver) return null;
    const licence = driver.LicenseNumber || driver.LicenceNumber || driver.licenseNumber || driver.LicenseNo;
    const name = driver.Name || driver.name;
    return [licence, name].filter(Boolean).join(' · ') || licence || name || null;
}

/* ============ display helpers ============ */
function badge(text, kind) { return `<span class="badge-status badge-${kind}">${escapeHtml(text)}</span>`; }
function statusKind(s) {
    s = (s || '').toLowerCase();
    if (['active', 'approved', 'confirmed'].includes(s)) return 'success';
    if (['overdue', 'rejected', 'cancelled', 'canceled'].includes(s)) return 'danger';
    if (['pending', 'in progress', 'reserved'].includes(s)) return 'warning';
    if (['completed', 'closed', 'returned'].includes(s)) return 'neutral';
    return 'info';
}
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}
function toDateInputValue(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}
function daysBetween(startStr, dueStr) {
    const start = new Date(startStr);
    const due = new Date(dueStr);
    if (isNaN(start.getTime()) || isNaN(due.getTime())) return 0;
    return Math.max(0, Math.round((due - start) / 86400000));
}
function showAlert(containerId, message, type = 'success') {
    const el = document.getElementById(containerId);
    if (!el) return;
    const cls = type === 'success' ? 'alert-success-soft' : 'alert-danger-soft';
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
    el.innerHTML = `<div class="alert ${cls} d-flex align-items-start gap-2" role="alert">
      <i class="bi ${icon} fs-5"></i><div>${escapeHtml(message)}</div>
    </div>`;
    el.classList.remove('d-none');
    if (type === 'success') window.scrollTo({ top: 0, behavior: 'smooth' });
}
function hideAlert(containerId) {
    const el = document.getElementById(containerId);
    if (el) { el.innerHTML = ''; el.classList.add('d-none'); }
}

/* ============================================================
   Shared state
   ============================================================ */
let lookups = { cars: [], users: [], branches: [], driverProfiles: [] };

/* ============================================================
   Page bootstrap — detects which page loaded this script and
   only wires up the elements that actually exist on it.
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
    const isListPage = !!document.getElementById('rentalsTableContainer');
    const isFormPage = !!document.getElementById('rentalForm');

    if (isListPage) {
        initRentalsListPage();
    } else if (isFormPage) {
        initRentalFormPage();
    }
});

/* ============================================================
   RENTALS LIST PAGE (pages/rentals.html)
   ============================================================ */
let pendingDeleteId = null;
let deleteModal;

async function initRentalsListPage() {
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    lookups = await fetchRelatedLookups();
    await loadRentals();
}

async function loadRentals(filters = null) {
    const container = document.getElementById('rentalsTableContainer');
    container.innerHTML = `<div class="table-card p-3">
      <div class="skeleton mb-2" style="height:14px;width:60%;"></div>
      <div class="skeleton mb-2" style="height:14px;width:90%;"></div>
      <div class="skeleton" style="height:14px;width:75%;"></div>
    </div>`;

    const res = filters ? await RentalAPI.filter(filters) : await RentalAPI.getAll();

    if (!res.ok) {
        document.getElementById('pageSub').textContent = 'Could not load rentals.';
        container.innerHTML = `<div class="state-empty">
        <i class="bi bi-exclamation-triangle"></i>
        <div style="color:var(--ink); font-weight:600;">Couldn't load rentals</div>
        <p class="mb-3">${escapeHtml(res.error)}</p>
        <button class="btn btn-primary btn-sm" onclick="loadRentals()">Try again</button>
      </div>`;
        return;
    }

    const rentals = Array.isArray(res.data) ? res.data : [];
    const active = rentals.filter(r => (r.Status || '').toLowerCase() === 'active').length;
    const overdue = rentals.filter(r => (r.Status || '').toLowerCase() === 'overdue').length;
    document.getElementById('pageSub').textContent = `${active} active, ${overdue} overdue · ${rentals.length} total`;

    if (rentals.length === 0) {
        container.innerHTML = `<div class="state-empty">
        <i class="bi bi-inbox"></i>
        <div style="color:var(--ink); font-weight:600;">No rentals yet</div>
        <p class="mb-3">Once you create one, it will show up here.</p>
        <a href="rental-create.html" class="btn btn-primary btn-sm">Create rental</a>
      </div>`;
        return;
    }

    renderRentalsTable(rentals);
}

function renderRentalsTable(rentals) {
    const rows = rentals.map(r => {
        const car = findById(lookups.cars, ['CarId', 'Id'], r.CarId);
        const user = findById(lookups.users, ['UserId', 'Id', 'userId'], r.userId);
        const carLabel = labelCar(car) || `Car #${r.CarId}`;
        const userLabel = labelUser(user) || `Customer #${r.userId}`;

        return `<tr>
      <td><span class="plate">RNT-${r.Rental_ID}</span></td>
      <td>${escapeHtml(carLabel)}</td>
      <td>${escapeHtml(userLabel)}</td>
      <td>${formatDate(r.StartDate)}</td>
      <td>${formatDate(r.DueDate)}</td>
      <td>${r.TotalDays ?? '—'}</td>
      <td>${badge(r.Status || 'Unknown', statusKind(r.Status))}</td>
      <td>
        <div class="row-actions">
          <a class="btn btn-outline-secondary" title="View" href="rental-create.html?id=${r.Rental_ID}"><i class="bi bi-eye"></i></a>
          <a class="btn btn-outline-secondary" title="Edit" href="rental-create.html?id=${r.Rental_ID}&edit=1"><i class="bi bi-pencil"></i></a>
          <button class="btn btn-outline-danger" title="Delete" onclick="openDeleteModal(${r.Rental_ID})"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`;
    }).join('');

    document.getElementById('rentalsTableContainer').innerHTML = `
    <div class="table-card">
      <table class="mgmt">
        <thead><tr>
          <th>Rental</th><th>Car</th><th>Customer</th><th>Start</th><th>Due</th><th>Days</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function applyFilters() {
    const status = document.getElementById('filterStatus').value;
    const carId = document.getElementById('filterCarId').value;
    const userId = document.getElementById('filterUserId').value;
    const params = {};
    if (status) params.status = status;
    if (carId) params.carId = carId;
    if (userId) params.userId = userId;
    loadRentals(Object.keys(params).length ? params : null);
}

function clearFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterCarId').value = '';
    document.getElementById('filterUserId').value = '';
    loadRentals();
}

function openDeleteModal(id) {
    pendingDeleteId = id;
    deleteModal.show();
}

async function confirmDelete() {
    if (!pendingDeleteId) return;
    const btn = document.getElementById('confirmDeleteBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting…';

    const res = await RentalAPI.remove(pendingDeleteId);

    btn.disabled = false;
    btn.textContent = 'Delete';
    deleteModal.hide();

    if (res.ok) {
        showAlert('alertArea', `Rental RNT-${pendingDeleteId} was deleted.`, 'success');
        loadRentals();
    } else {
        showAlert('alertArea', `Couldn't delete rental: ${res.error}`, 'danger');
    }
    pendingDeleteId = null;
}

/* ============================================================
   CREATE / EDIT / DETAILS PAGE (pages/rental-create.html)
   ============================================================ */
let currentId = null;   // rental id from the URL, if any
let editMode = false;   // true when the form view should behave as "edit"
let formDeleteModal;

function switchView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + name).classList.add('active');
}

async function initRentalFormPage() {
    const params = new URLSearchParams(window.location.search);
    currentId = params.get('id');
    editMode = params.get('edit') === '1';

    formDeleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    document.getElementById('deleteBtn').addEventListener('click', () => formDeleteModal.show());
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmFormDelete);
    document.getElementById('editBtn').addEventListener('click', () => {
        window.location.href = `rental-create.html?id=${currentId}&edit=1`;
    });
    document.getElementById('startDate').addEventListener('change', updateTotalDaysPreview);
    document.getElementById('dueDate').addEventListener('change', updateTotalDaysPreview);
    document.getElementById('rentalForm').addEventListener('submit', handleFormSubmit);

    lookups = await fetchRelatedLookups();

    if (!currentId) {
        // ---- CREATE ----
        switchView('form');
        populateDropdowns();
    } else if (editMode) {
        // ---- EDIT ----
        switchView('form');
        populateDropdowns();
        document.getElementById('formTitle').textContent = 'Edit rental';
        document.getElementById('formSub').textContent = 'Update the rental details below.';
        document.getElementById('submitBtn').textContent = 'Save changes';
        document.getElementById('emailNote').textContent = 'Editing an existing rental does not trigger a new confirmation email.';
        await loadExistingRental(currentId);
    } else {
        // ---- DETAILS ----
        switchView('details');
        await loadRentalDetails(currentId);
    }
}

function populateDropdowns() {
    const userSel = document.getElementById('userId');
    lookups.users.forEach(u => {
        const id = u.UserId ?? u.Id ?? u.userId;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = labelUser(u) || `Customer #${id}`;
        userSel.appendChild(opt);
    });

    const carSel = document.getElementById('carId');
    lookups.cars.forEach(c => {
        const id = c.CarId ?? c.Id;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = labelCar(c) || `Car #${id}`;
        carSel.appendChild(opt);
    });

    const branchSel = document.getElementById('branchId');
    lookups.branches.forEach(b => {
        const id = b.BranchId ?? b.Id;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = labelBranch(b) || `Branch #${id}`;
        branchSel.appendChild(opt);
    });

    const driverSel = document.getElementById('driverProfileId');
    lookups.driverProfiles.forEach(d => {
        const id = d.DriverProfile_ID ?? d.Id;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = labelDriver(d) || `Driver #${id}`;
        driverSel.appendChild(opt);
    });

    if (lookups.warnings && lookups.warnings.length) {
        showAlert('formAlertArea', `Couldn't load: ${lookups.warnings.join(', ')}. You can still submit using the correct IDs if the dropdown is missing options.`, 'danger');
    }
}

async function loadExistingRental(id) {
    const res = await RentalAPI.getById(id);
    if (!res.ok) {
        showAlert('formAlertArea', `Couldn't load rental #${id}: ${res.error}`, 'danger');
        return;
    }
    const r = res.data;
    document.getElementById('userId').value = r.userId ?? '';
    document.getElementById('carId').value = r.CarId ?? '';
    document.getElementById('branchId').value = r.BranchId ?? '';
    document.getElementById('driverProfileId').value = r.DriverProfile_ID ?? '';
    document.getElementById('startDate').value = toDateInputValue(r.StartDate);
    document.getElementById('dueDate').value = toDateInputValue(r.DueDate);
    document.getElementById('status').value = r.Status || 'Reserved';
    updateTotalDaysPreview();
}

function updateTotalDaysPreview() {
    const start = document.getElementById('startDate').value;
    const due = document.getElementById('dueDate').value;
    const display = document.getElementById('totalDaysDisplay');
    if (start && due) {
        const days = daysBetween(start, due);
        display.value = days > 0 ? `${days} day${days === 1 ? '' : 's'}` : 'Due date must be after start date';
    } else {
        display.value = '';
    }
}

function clearFormValidation() {
    document.querySelectorAll('#rentalForm .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.getElementById('dueDateError').style.display = 'none';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    hideAlert('formAlertArea');
    clearFormValidation();

    const userId = document.getElementById('userId').value;
    const carId = document.getElementById('carId').value;
    const branchId = document.getElementById('branchId').value;
    const driverProfileId = document.getElementById('driverProfileId').value;
    const startDate = document.getElementById('startDate').value;
    const dueDate = document.getElementById('dueDate').value;
    const status = document.getElementById('status').value;

    let valid = true;
    [['userId', userId], ['carId', carId], ['branchId', branchId], ['driverProfileId', driverProfileId], ['startDate', startDate], ['dueDate', dueDate]]
        .forEach(([id, val]) => {
            if (!val) { document.getElementById(id).classList.add('is-invalid'); valid = false; }
        });

    if (startDate && dueDate && new Date(dueDate) <= new Date(startDate)) {
        document.getElementById('dueDate').classList.add('is-invalid');
        document.getElementById('dueDateError').style.display = 'block';
        valid = false;
    }

    if (!valid) {
        showAlert('formAlertArea', 'Please fix the highlighted fields before saving.', 'danger');
        return;
    }

    const totalDays = daysBetween(startDate, dueDate);

    const payload = {
        StartDate: startDate,
        DueDate: dueDate,
        // The model requires a non-null ReturnAtUtc even though the car
        // hasn't been returned yet at creation time — defaulting it to the
        // start date as a placeholder. Consider making this field nullable
        // in the backend model so a real return timestamp can be recorded later.
        ReturnAtUtc: editMode ? undefined : startDate,
        Status: status,
        TotalDays: totalDays,
        CarId: Number(carId),
        userId: Number(userId),
        BranchId: Number(branchId),
        DriverProfile_ID: Number(driverProfileId),
    };

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving…';

    const res = editMode
        ? await RentalAPI.update(currentId, payload)
        : await RentalAPI.add(payload);

    btn.disabled = false;
    btn.textContent = originalText;

    if (res.ok) {
        const newId = editMode ? currentId : res.data;
        const message = editMode
            ? `Rental RNT-${currentId} was updated successfully.`
            : `Rental created successfully. A confirmation email was sent to the customer.`;
        showAlert('formAlertArea', message, 'success');

        // Move to the details view for this rental, in place — no full page reload.
        currentId = newId;
        editMode = false;
        history.replaceState(null, '', `rental-create.html?id=${newId}`);
        setTimeout(async () => {
            hideAlert('formAlertArea');
            switchView('details');
            await loadRentalDetails(newId);
        }, 900);
    } else {
        showAlert('formAlertArea', `Couldn't save rental: ${res.error}`, 'danger');
    }
}

async function loadRentalDetails(id) {
    const res = await RentalAPI.getById(id);

    if (!res.ok) {
        document.getElementById('detailsSub').textContent = 'Could not load this rental.';
        document.getElementById('detailsContent').innerHTML = `<div class="card"><div class="state-empty">
        <i class="bi bi-exclamation-triangle"></i>
        <div style="color:var(--ink); font-weight:600;">Rental not found</div>
        <p class="mb-3">${escapeHtml(res.error)}</p>
        <a class="btn btn-primary btn-sm" href="rentals.html">Back to rentals</a>
      </div></div>`;
        return;
    }

    renderDetails(res.data);
}

function renderDetails(r) {
    const car = findById(lookups.cars, ['CarId', 'Id'], r.CarId);
    const user = findById(lookups.users, ['UserId', 'Id', 'userId'], r.userId);
    const branch = findById(lookups.branches, ['BranchId', 'Id'], r.BranchId);
    const driver = findById(lookups.driverProfiles, ['DriverProfile_ID', 'Id'], r.DriverProfile_ID);

    document.getElementById('detailsTitle').innerHTML = `<span class="plate">RNT-${r.Rental_ID}</span>`;
    document.getElementById('detailsSub').textContent = `${labelCar(car) || 'Car #' + r.CarId} · ${labelUser(user) || 'Customer #' + r.userId}`;

    document.getElementById('detailsContent').innerHTML = `
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card p-4 mb-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 style="font-size:16px;font-weight:700;margin:0;">Rental information</h2>
            ${badge(r.Status || 'Unknown', statusKind(r.Status))}
          </div>
          <div class="info-row"><div class="info-label">Rental ID</div><div class="info-value">RNT-${r.Rental_ID}</div></div>
          <div class="info-row"><div class="info-label">Car</div><div class="info-value">${escapeHtml(labelCar(car) || `Car #${r.CarId}`)}</div></div>
          <div class="info-row"><div class="info-label">Customer</div><div class="info-value">${escapeHtml(labelUser(user) || `Customer #${r.userId}`)}</div></div>
          <div class="info-row"><div class="info-label">Pickup branch</div><div class="info-value">${escapeHtml(labelBranch(branch) || `Branch #${r.BranchId}`)}</div></div>
          <div class="info-row"><div class="info-label">Driver profile</div><div class="info-value">${escapeHtml(labelDriver(driver) || `Driver #${r.DriverProfile_ID}`)}</div></div>
          <div class="info-row"><div class="info-label">Start date</div><div class="info-value">${formatDate(r.StartDate)}</div></div>
          <div class="info-row"><div class="info-label">Due date</div><div class="info-value">${formatDate(r.DueDate)}</div></div>
          <div class="info-row"><div class="info-label">Total days</div><div class="info-value">${r.TotalDays ?? '—'}</div></div>
          <div class="info-row"><div class="info-label">Returned at</div><div class="info-value">${r.ReturnAtUtc ? formatDate(r.ReturnAtUtc) : '—'}</div></div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="card p-4">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;">Update status</h2>
          <p class="small text-muted">Change just the rental status without editing the rest of the record.</p>
          <div class="d-flex gap-2">
            <select class="form-select" id="statusSelect">
              ${['Reserved', 'Pending', 'Active', 'Completed', 'Overdue', 'Cancelled'].map(s =>
        `<option value="${s}" ${s === r.Status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            <button class="btn btn-primary" id="statusUpdateBtn" style="white-space:nowrap;">Update</button>
          </div>
        </div>
      </div>
    </div>`;

    document.getElementById('statusUpdateBtn').addEventListener('click', () => updateStatus(r.Rental_ID));
}

async function updateStatus(id) {
    const select = document.getElementById('statusSelect');
    const newStatus = select.value;
    const btn = document.getElementById('statusUpdateBtn');
    btn.disabled = true;
    const original = btn.textContent;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    const res = await RentalAPI.updateStatus(id, newStatus);

    btn.disabled = false;
    btn.textContent = original;

    if (res.ok) {
        showAlert('detailsAlertArea', `Status updated to "${newStatus}".`, 'success');
        loadRentalDetails(id);
    } else {
        showAlert('detailsAlertArea', `Couldn't update status: ${res.error}`, 'danger');
    }
}

async function confirmFormDelete() {
    const btn = document.getElementById('confirmDeleteBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting…';

    const res = await RentalAPI.remove(currentId);

    btn.disabled = false;
    btn.textContent = 'Delete';
    formDeleteModal.hide();

    if (res.ok) {
        window.location.href = 'rentals.html';
    } else {
        showAlert('detailsAlertArea', `Couldn't delete rental: ${res.error}`, 'danger');
    }
}