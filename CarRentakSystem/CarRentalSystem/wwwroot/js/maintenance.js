const API_BASE = " ";

let maintenanceRecords = [];
let maintenanceModal;


// Load when page opens
document.addEventListener("DOMContentLoaded", function () {

    maintenanceModal =
        new bootstrap.Modal(
            document.getElementById("maintenanceModal")
        );

    loadMaintenance();

});


// ===============================
// GET ALL
// ===============================
async function loadMaintenance() {

    try {

        const response = await authorizedFetch(
            `${API_BASE}/Maintenance/GetALLMaintenances`
        );

        if (!response.ok) {
            throw new Error("Failed to load maintenance records.");
        }

        maintenanceRecords = await response.json();

        displayMaintenance(maintenanceRecords);

    }
    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

        console.error(error);

    }

}


// ===============================
// DISPLAY TABLE
// ===============================
function displayMaintenance(records) {

    const tbody =
        document.getElementById("maintenanceTableBody");

    const count =
        document.getElementById("recordCount");

    count.textContent =
        `${records.length} record${records.length === 1 ? "" : "s"}`;


    if (records.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="state-empty">
                        <i class="bi bi-inbox"></i>
                        <div>No maintenance records found</div>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = records.map(m => {

        const carName =
            m.car
                ? `${m.car.make || ""} ${m.car.model || ""}`.trim()
                : `Car #${m.carid}`;

        const carPlate = m.car ? (m.car.plateNumber || "") : "";


        return `
            <tr>

                <td>
                    <span class="font-monospace">
                        ${m.maintenane_ID}
                    </span>
                </td>

                <td>
                    <strong>${escapeHtml(carName)}</strong>
                    ${carPlate ? `<div class="small text-muted">${escapeHtml(carPlate)}</div>` : ""}
                </td>

                <td>
                    ${formatDate(m.serviceDate)}
                </td>

                <td>
                    ${escapeHtml(m.description)}
                </td>

                <td>
                    OMR ${Number(m.cost).toFixed(2)}
                </td>

                <td data-role="staff">
                    ${getStatusBadge(m.status)}
                </td>

                <td data-role="staff">

                    <div class="btn-group btn-group-sm">

                        <button class="btn btn-outline-primary"
                                onclick="editMaintenance(${m.maintenane_ID})">

                            <i class="bi bi-pencil"></i>

                        </button>

                        <button class="btn btn-outline-danger" data-role="admin"
                                onclick="deleteMaintenance(${m.maintenane_ID})">

                            <i class="bi bi-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


// ===============================
// ADD MODAL
// ===============================
function openAddModal() {

    document.getElementById("modalTitle").textContent =
        "Add Maintenance";

    document.getElementById("maintenanceForm").reset();

    document.getElementById("maintenanceId").value = "";

}


// ===============================
// EDIT
// ===============================
async function editMaintenance(id) {

    try {

        const response = await authorizedFetch(
            `${API_BASE}/Maintenance/GetMaintenance?id=${id}`
        );

        if (!response.ok) {
            throw new Error("Maintenance record not found.");
        }

        const m = await response.json();


        document.getElementById("modalTitle").textContent =
            "Edit Maintenance";

        document.getElementById("maintenanceId").value =
            m.maintenane_ID;

        document.getElementById("carId").value =
            m.carid;

        document.getElementById("serviceDate").value =
            m.serviceDate.substring(0, 10);

        document.getElementById("description").value =
            m.description;

        document.getElementById("cost").value =
            m.cost;

        document.getElementById("status").value =
            m.status;


        maintenanceModal.show();

    }
    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}


// ===============================
// SAVE ADD / EDIT
// ===============================
async function saveMaintenance() {

    const form =
        document.getElementById("maintenanceForm");


    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }


    const id =
        document.getElementById("maintenanceId").value;


    const maintenance = {

        serviceDate:
            document.getElementById("serviceDate").value,

        description:
            document.getElementById("description").value.trim(),

        cost:
            Number(document.getElementById("cost").value),

        status:
            document.getElementById("status").value,

        carid:
            Number(document.getElementById("carId").value)

    };


    try {

        let url;
        let method;


        if (id) {

            url =
                `${API_BASE}/Maintenance/UpdateMaintenance?id=${id}`;

            method = "PUT";

        }
        else {

            url =
                `${API_BASE}/Maintenance/AddMaintenance`;

            method = "POST";

        }


        const response = await authorizedFetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(maintenance)

        });


        if (!response.ok) {

            throw new Error(
                id
                    ? "Failed to update maintenance."
                    : "Failed to add maintenance."
            );

        }


        maintenanceModal.hide();

        showMessage(
            id
                ? "Maintenance updated successfully."
                : "Maintenance added successfully.",
            "success"
        );


        await loadMaintenance();

    }
    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

        console.error(error);

    }

}


// ===============================
// DELETE
// ===============================
async function deleteMaintenance(id) {

    if (!confirm(
        "Are you sure you want to delete this maintenance record?"
    )) {

        return;

    }


    try {

        const response = await authorizedFetch(
            `${API_BASE}/Maintenance/RemoveMaintenance?id=${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to delete maintenance record.");
        }


        showMessage(
            "Maintenance record deleted successfully.",
            "success"
        );


        await loadMaintenance();

    }
    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}


// ===============================
// FILTER
// ===============================
async function filterMaintenance() {

    const status =
        document.getElementById("statusFilter").value;


    if (!status) {

        await loadMaintenance();

        return;

    }


    try {

        const response = await authorizedFetch(
            `${API_BASE}/Maintenance/GetByStatus?status=${encodeURIComponent(status)}`
        );


        if (!response.ok) {
            throw new Error("Failed to filter maintenance records.");
        }


        const records = await response.json();

        maintenanceRecords = records;

        displayMaintenance(records);

    }
    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}


// ===============================
// SORT
// ===============================
async function sortMaintenance() {

    try {

        const response = await authorizedFetch(
            `${API_BASE}/Maintenance/GetSortedByCost`
        );


        if (!response.ok) {
            throw new Error("Failed to sort maintenance records.");
        }


        const records = await response.json();

        maintenanceRecords = records;

        displayMaintenance(records);

    }
    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}


// ===============================
// STATUS BADGE
// ===============================
function getStatusBadge(status) {

    if (!status) {
        return "";
    }


    let className = "text-bg-secondary";


    if (status === "Completed") {
        className = "text-bg-success";
    }

    else if (status === "Pending") {
        className = "text-bg-warning";
    }

    else if (status === "In Progress") {
        className = "text-bg-info";
    }


    return `
        <span class="badge ${className}">
            ${escapeHtml(status)}
        </span>
    `;

}


// ===============================
// DATE FORMAT
// ===============================
function formatDate(date) {

    if (!date) {
        return "-";
    }


    return new Date(date).toLocaleDateString();

}


// ===============================
// MESSAGE
// ===============================
function showMessage(message, type) {

    const container =
        document.getElementById("messageContainer");


    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show"
             role="alert">

            ${escapeHtml(message)}

            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
            </button>

        </div>
    `;


    setTimeout(() => {

        const alert =
            container.querySelector(".alert");

        if (alert) {
            alert.remove();
        }

    }, 4000);

}


// ===============================
// SEARCH
// ===============================
document
    .getElementById("searchInput")
    .addEventListener("input", function () {

        const search =
            this.value.toLowerCase().trim();


        if (!search) {

            displayMaintenance(maintenanceRecords);

            return;

        }


        const filtered =
            maintenanceRecords.filter(m =>

                String(m.maintenane_ID)
                    .includes(search) ||

                String(m.description || "")
                    .toLowerCase()
                    .includes(search) ||

                String(m.status || "")
                    .toLowerCase()
                    .includes(search) ||

                String(m.carid)
                    .includes(search)

            );


        displayMaintenance(filtered);

    });


// ===============================
// HTML SAFETY
// ===============================
function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}