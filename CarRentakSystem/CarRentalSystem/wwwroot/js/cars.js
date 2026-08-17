const CAR_API = "/Car";

let carRecords = [];
let categoryRecords = [];
let branchRecords = [];
let carModal;
let deleteCarModal;

let editingCarId = null;
let pendingDeleteCarId = null;


document.addEventListener("DOMContentLoaded", function () {
    carModal = new bootstrap.Modal(document.getElementById("carModal"));
    deleteCarModal = new bootstrap.Modal(document.getElementById("deleteCarModal"));

    const addCarBtn = document.getElementById("addCarBtn");
    if (addCarBtn) {
        addCarBtn.addEventListener("click", openAddCarModal);
    }

    document.getElementById("carForm").addEventListener("submit", saveCar);
    document.getElementById("confirmDeleteCarBtn").addEventListener("click", confirmDeleteCar);
    document.getElementById("makeFilter").addEventListener("input", applyFilters);
    document.getElementById("availabilityFilter").addEventListener("change", applyFilters);
    document.getElementById("sortRateBtn").addEventListener("click", sortCarsByRate);
    document.getElementById("refreshBtn").addEventListener("click", loadCars);

    loadCategories();
    loadBranches();
    loadCars();
});

// ========================================
// ROLE CHECKER
// ========================================
function canManageCars() {
    // Checks common storage keys for the role and normalizes to lowercase
    const role = localStorage.getItem("userRole") || localStorage.getItem("role") || sessionStorage.getItem("userRole") || "";
    const normalizedRole = role.toLowerCase();
    return normalizedRole === "admin" || normalizedRole === "staff";
}

// ========================================
// GET ALL
// ========================================
async function loadCars() {
    try {
        const response = await authorizedFetch(`${CAR_API}/GetAllCars`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to load cars.");
        }
        carRecords = await response.json();
        displayCars(carRecords);
    }
    catch (error) {
        console.error(error);
        showMessage(error.message, "danger");
    }
}

// ========================================
// CATEGORY / BRANCH NAME LOOKUP
// ========================================
function getCategoryName(id) {
    const category = categoryRecords.find(function (c) {
        return c.id === id;
    });
    return category ? category.name : id;
}

function getBranchName(id) {
    const branch = branchRecords.find(function (b) {
        return b.id === id;
    });
    return branch ? branch.name : id;
}

// ========================================
// DISPLAY CARS
// ========================================
function displayCars(cars) {
    const tbody = document.getElementById("carsTableBody");
    const count = document.getElementById("recordCount");
    const isStaffOrAdmin = canManageCars();

    // Toggle "+ Add Car" button visibility
    const addCarBtn = document.getElementById("addCarBtn");
    if (addCarBtn) {
        if (isStaffOrAdmin) {
            addCarBtn.classList.remove("d-none");
        } else {
            addCarBtn.classList.add("d-none");
        }
    }

    // Toggle table header visibility for Actions
    const actionsHeader = document.getElementById("actionsHeader");
    if (actionsHeader) {
        actionsHeader.style.display = isStaffOrAdmin ? "" : "none";
    }

    count.textContent = `${cars.length} ${cars.length === 1 ? "car" : "cars"}`;

    if (cars.length === 0) {
        const totalColumns = isStaffOrAdmin ? 8 : 7;
        tbody.innerHTML = `
            <tr>
                <td colspan="${totalColumns}" class="text-center py-5">
                    <div class="state-empty">
                        <i class="bi bi-inbox"></i>
                        <div>No cars found</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = cars.map(function (car) {
        const availability = car.isAvailable
            ? `<span class="badge-status badge-success">Available</span>`
            : `<span class="badge-status badge-danger">Unavailable</span>`;

        // Render actions column only for Admin/Staff
        const actionsCell = isStaffOrAdmin ? `
            <td>
                <div class="row-actions">
                    <button class="btn btn-outline-secondary" title="Edit" onclick="openEditCarModal(${car.carId})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-secondary" title="Change Availability" onclick="toggleAvailability(${car.carId}, ${car.isAvailable})">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-outline-danger" title="Delete" onclick="openDeleteCarModal(${car.carId}, '${escapeForJs(car.make)} ${escapeForJs(car.model)}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        ` : "";

        return `
            <tr>
                <td><span class="plate">${escapeHtml(car.plateNumber)}</span></td>
                <td><strong>${escapeHtml(car.make)} ${escapeHtml(car.model)}</strong></td>
                <td>${car.year}</td>
                <td>${escapeHtml(getCategoryName(car.carCategoryId))}</td>
                <td>${escapeHtml(getBranchName(car.branchId))}</td>
                <td>OMR ${Number(car.dailyRate).toFixed(2)}</td>
                <td>${availability}</td>
                ${actionsCell}
            </tr>
        `;
    }).join("");
}

// ========================================
// OPEN ADD CAR
// ========================================
function openAddCarModal() {
    editingCarId = null;
    document.getElementById("carForm").reset();
    document.getElementById("carId").value = "";
    document.getElementById("carModalTitle").textContent = "Add Car";
    document.getElementById("saveCarBtn").textContent = "Save Car";
    document.getElementById("isAvailable").value = "true";
    carModal.show();
}

// ========================================
// GET CAR BY ID
// ========================================
async function openEditCarModal(id) {
    try {
        const response = await authorizedFetch(`${CAR_API}/GetCar?id=${id}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to load car.");
        }
        const car = await response.json();

        editingCarId = car.carId;
        document.getElementById("carId").value = car.carId;
        document.getElementById("plateNumber").value = car.plateNumber ?? "";
        document.getElementById("make").value = car.make ?? "";
        document.getElementById("model").value = car.model ?? "";
        document.getElementById("year").value = car.year;
        document.getElementById("dailyRate").value = car.dailyRate;
        document.getElementById("carCategoryId").value = car.carCategoryId;
        document.getElementById("branchId").value = car.branchId;
        document.getElementById("isAvailable").value = String(car.isAvailable);
        document.getElementById("carModalTitle").textContent = "Edit Car";
        document.getElementById("saveCarBtn").textContent = "Update Car";

        carModal.show();
    }
    catch (error) {
        console.error(error);
        showMessage(error.message, "danger");
    }
}

// ========================================
// ADD / UPDATE CAR
// ========================================
async function saveCar(event) {
    event.preventDefault();

    const payload = {
        plateNumber: document.getElementById("plateNumber").value.trim(),
        make: document.getElementById("make").value.trim(),
        model: document.getElementById("model").value.trim(),
        year: Number(document.getElementById("year").value),
        dailyRate: Number(document.getElementById("dailyRate").value),
        isAvailable: document.getElementById("isAvailable").value === "true",
        carCategoryId: Number(document.getElementById("carCategoryId").value),
        branchId: Number(document.getElementById("branchId").value)
    };

    if (
        !payload.plateNumber ||
        !payload.make ||
        !payload.model ||
        !payload.year ||
        payload.dailyRate < 0 ||
        !payload.carCategoryId ||
        !payload.branchId
    ) {
        showMessage("Please fill in all car fields correctly.", "danger");
        return;
    }

    const saveButton = document.getElementById("saveCarBtn");
    saveButton.disabled = true;

    try {
        let response;

        if (editingCarId !== null) {
            response = await authorizedFetch(`${CAR_API}/UpdateCar?id=${editingCarId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }
        else {
            response = await authorizedFetch(`${CAR_API}/AddCar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to save car.");
        }

        carModal.hide();
        showMessage(editingCarId !== null ? "Car updated successfully." : "Car added successfully.", "success");
        editingCarId = null;
        await loadCars();
    }
    catch (error) {
        console.error(error);
        showMessage(error.message, "danger");
    }
    finally {
        saveButton.disabled = false;
    }
}

// ========================================
// UPDATE AVAILABILITY
// ========================================
async function toggleAvailability(id, currentAvailability) {
    const newAvailability = !currentAvailability;

    try {
        const response = await authorizedFetch(`${CAR_API}/UpdateCarAvailability?id=${id}&isAvailable=${newAvailability}`, {
            method: "PATCH"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to update availability.");
        }

        showMessage("Car availability updated successfully.", "success");
        await loadCars();
    }
    catch (error) {
        console.error(error);
        showMessage(error.message, "danger");
    }
}

// ========================================
// OPEN DELETE
// ========================================
function openDeleteCarModal(id, label) {
    pendingDeleteCarId = id;
    document.getElementById("deleteCarLabel").textContent = label;
    deleteCarModal.show();
}

// ========================================
// DELETE
// ========================================
async function confirmDeleteCar() {
    if (pendingDeleteCarId === null) {
        return;
    }

    try {
        const response = await authorizedFetch(`${CAR_API}/RemoveCar?id=${pendingDeleteCarId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to delete car.");
        }

        deleteCarModal.hide();
        pendingDeleteCarId = null;
        showMessage("Car deleted successfully.", "success");
        await loadCars();
    }
    catch (error) {
        console.error(error);
        showMessage(error.message, "danger");
    }
}

// ========================================
// FILTER
// ========================================
function applyFilters() {
    const make = document.getElementById("makeFilter").value.trim().toLowerCase();
    const availability = document.getElementById("availabilityFilter").value;

    const filtered = carRecords.filter(function (car) {
        const matchesMake = make === "" || String(car.make ?? "").toLowerCase().includes(make);

        let matchesAvailability = true;
        if (availability === "true") {
            matchesAvailability = car.isAvailable === true;
        }
        if (availability === "false") {
            matchesAvailability = car.isAvailable === false;
        }

        return matchesMake && matchesAvailability;
    });

    displayCars(filtered);
}

// ========================================
// SORT BY DAILY RATE
// ========================================
async function sortCarsByRate() {
    try {
        const response = await authorizedFetch(`${CAR_API}/SortByDailyRate`);
        if (!response.ok) {
            throw new Error("Failed to sort cars.");
        }
        const cars = await response.json();
        carRecords = cars;
        displayCars(cars);
    }
    catch (error) {
        console.error(error);
        showMessage(error.message, "danger");
    }
}

// ========================================
// MESSAGE
// ========================================
function showMessage(text, type) {
    const box = document.getElementById("messageBox");
    box.className = `alert alert-${type}`;
    box.textContent = text;
    box.classList.remove("d-none");
}

// ========================================
// SAFE HTML
// ========================================
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ========================================
// SAFE ONCLICK TEXT
// ========================================
function escapeForJs(value) {
    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}

// ========================================
// LOAD CATEGORIES
// ========================================
async function loadCategories() {
    try {
        const response = await authorizedFetch("/api/CarCategory");
        if (!response.ok) {
            throw new Error("Failed to load categories.");
        }
        categoryRecords = await response.json();

        const select = document.getElementById("carCategoryId");
        select.innerHTML = `<option value="">Select category</option>`;

        categoryRecords.forEach(category => {
            select.innerHTML += `
                <option value="${category.id}">
                    ${escapeHtml(category.name)}
                </option>
            `;
        });
    }
    catch (error) {
        console.error(error);
        showMessage("Failed to load car categories.", "danger");
    }
}

// ========================================
// LOAD BRANCHES
// ========================================
async function loadBranches() {
    try {
        const response = await authorizedFetch("/api/Branch");
        if (!response.ok) {
            throw new Error("Failed to load branches.");
        }
        branchRecords = await response.json();

        const select = document.getElementById("branchId");
        select.innerHTML = `<option value="">Select branch</option>`;

        branchRecords.forEach(branch => {
            select.innerHTML += `
                <option value="${branch.id}">
                    ${escapeHtml(branch.name)}
                </option>
            `;
        });
    }
    catch (error) {
        console.error(error);
        showMessage("Failed to load branches.", "danger");
    }
}