const API_BASE = "http://localhost:5092";

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

    const response =
        await fetch(
            `${API_BASE}/DamageReport/GetAllDamageReports`
        );

    damageReports =
        await response.json();

    displayDamageReports(damageReports);

}

function displayDamageReports(records) {

    const tbody =
        document.getElementById("damageTableBody");

    document.getElementById("recordCount").textContent =
        `${records.length} records`;

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

            <td>${d.description}</td>

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

    const response =
        await fetch(
            `${API_BASE}/DamageReport/GetDamageReport?id=${id}`
        );

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
        document.getElementById("description").value,

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

    const url = id
        ? `${API_BASE}/DamageReport/UpdateDamageReport?id=${id}`
        : `${API_BASE}/DamageReport/AddDamageReport`;

    const method =
        id ? "PUT" : "POST";

    await fetch(url, {

        method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(report)

    });

    damageModal.hide();

    loadDamageReports();

}

async function deleteDamageReport(id) {

    if (!confirm("Delete this report?")) {
        return;
    }

    await fetch(

        `${API_BASE}/DamageReport/RemoveDamageReport?id=${id}`,

        {
            method: "DELETE"
        }

    );

    loadDamageReports();

}

async function filterDamageReports() {

    const carId =
        document.getElementById("carFilter").value;

    if (!carId) {

        loadDamageReports();

        return;

    }

    const response =
        await fetch(
            `${API_BASE}/DamageReport/GetByCar?carId=${carId}`
        );

    const data =
        await response.json();

    displayDamageReports(data);

}

async function sortDamageReports() {

    const response =
        await fetch(
            `${API_BASE}/DamageReport/GetSortedByRepairCost`
        );

    const data =
        await response.json();

    displayDamageReports(data);

}