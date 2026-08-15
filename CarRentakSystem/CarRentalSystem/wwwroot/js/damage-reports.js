const API_BASE = "";

let damageReports = [];
let damageModal;

document.addEventListener("DOMContentLoaded", function () {

    damageModal =
        new bootstrap.Modal(
            document.getElementById("damageModal")
        );

    loadDamageReports();

});

async function loadDamageReports() {

    try {

        const response =
            await authorizedFetch(
                `${API_BASE}/DamageReport/GetAllDamageReports`
            );

        if (!response.ok) {
            throw new Error("Failed to load damage reports.");
        }

        damageReports =
            await response.json();

        displayDamageReports(damageReports);

    }
    catch (error) {

        showMessage(error.message, "danger");
        console.error(error);

    }

}

function displayDamageReports(records) {

    const tbody =
        document.getElementById("damageTableBody");

    document.getElementById("recordCount").textContent =
        `${records.length} records`;

    if (records.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    No damage reports found
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML =
        records.map(d => `

        <tr>

            <td>${d.damageReport_ID}</td>

            <td>${d.carId}</td>

            <td>${d.rental_ID}</td>

            <td>
                ${new Date(
            d.reportedAtUtc
        ).toLocaleDateString()}
            </td>

            <td>${escapeHtml(d.description)}</td>

            <td>
                OMR ${Number(
            d.repairCost
        ).toFixed(2)}
            </td>

            <td>

                <button class="btn btn-sm btn-outline-primary"
                        onclick="editDamageReport(${d.damageReport_ID})">

                    <i class="bi bi-pencil"></i>

                </button>

                <button class="btn btn-sm btn-outline-danger"
                        onclick="deleteDamageReport(${d.damageReport_ID})">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        </tr>

    `).join("");

}

function openAddModal() {

    document.getElementById("damageForm").reset();

    document.getElementById("damageId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Damage Report";

}

async function editDamageReport(id) {

    try {

        const response =
            await authorizedFetch(
                `${API_BASE}/DamageReport/GetDamageReport?id=${id}`
            );

        if (!response.ok) {
            throw new Error("Damage report not found.");
        }

        const d =
            await response.json();

        document.getElementById("damageId").value =
            d.damageReport_ID;

        document.getElementById("carId").value =
            d.carId;

        document.getElementById("rentalId").value =
            d.rental_ID;

        document.getElementById("reportDate").value =
            d.reportedAtUtc.substring(0, 10);

        document.getElementById("description").value =
            d.description;

        document.getElementById("repairCost").value =
            d.repairCost;

        document.getElementById("modalTitle").textContent =
            "Edit Damage Report";

        damageModal.show();

    }
    catch (error) {

        showMessage(error.message, "danger");
        console.error(error);

    }

}

async function saveDamageReport() {

    const form =
        document.getElementById("damageForm");

    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }

    const id =
        document.getElementById("damageId").value;

    const report = {

        description:
            document.getElementById("description").value.trim(),

        reportedAtUtc:
            document.getElementById("reportDate").value,

        repairCost:
            Number(
                document.getElementById("repairCost").value
            ),

        carId:
            Number(
                document.getElementById("carId").value
            ),

        rental_ID:
            Number(
                document.getElementById("rentalId").value
            )

    };

    try {

        const url = id
            ? `${API_BASE}/DamageReport/UpdateDamageReport?id=${id}`
            : `${API_BASE}/DamageReport/AddDamageReport`;

        const method =
            id ? "PUT" : "POST";

        const response = await authorizedFetch(url, {

            method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(report)

        });

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                errorText ||
                (id ? "Failed to update damage report." : "Failed to add damage report.")
            );

        }

        damageModal.hide();

        showMessage(
            id
                ? "Damage report updated successfully."
                : "Damage report added successfully.",
            "success"
        );

        await loadDamageReports();

    }
    catch (error) {

        showMessage(error.message, "danger");
        console.error(error);

    }

}

async function deleteDamageReport(id) {

    if (!confirm("Delete this report?")) {
        return;
    }

    try {

        const response = await authorizedFetch(

            `${API_BASE}/DamageReport/RemoveDamageReport?id=${id}`,

            {
                method: "DELETE"
            }

        );

        if (!response.ok) {
            throw new Error("Failed to delete damage report.");
        }

        showMessage("Damage report deleted successfully.", "success");

        await loadDamageReports();

    }
    catch (error) {

        showMessage(error.message, "danger");
        console.error(error);

    }

}

async function filterDamageReports() {

    const carId =
        document.getElementById("carFilter").value;

    if (!carId) {

        await loadDamageReports();

        return;

    }

    try {

        const response =
            await authorizedFetch(
                `${API_BASE}/DamageReport/GetByCar?carId=${carId}`
            );

        if (!response.ok) {
            throw new Error("Failed to filter damage reports.");
        }

        const data =
            await response.json();

        displayDamageReports(data);

    }
    catch (error) {

        showMessage(error.message, "danger");
        console.error(error);

    }

}

async function sortDamageReports() {

    try {

        const response =
            await authorizedFetch(
                `${API_BASE}/DamageReport/GetSortedByRepairCost`
            );

        if (!response.ok) {
            throw new Error("Failed to sort damage reports.");
        }

        const data =
            await response.json();

        displayDamageReports(data);

    }
    catch (error) {

        showMessage(error.message, "danger");
        console.error(error);

    }

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