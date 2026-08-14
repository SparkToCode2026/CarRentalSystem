
 
const API_BASE = " ";
 
let carRecords = [];
let categoryRecords = [];
let deleteCarModal;
let carPendingDeleteId = null;
 
 
// Load when page opens
document.addEventListener("DOMContentLoaded", function () {
 
    deleteCarModal =
        new bootstrap.Modal(
            document.getElementById("deleteCarModal")
        );
 
    loadCategoriesForFilter();
    loadCars();
 
    document.getElementById("searchInput")
        .addEventListener("input", applyFilters);
 
    document.getElementById("categoryFilter")
        .addEventListener("change", applyFilters);
 
    document.getElementById("availabilityFilter")
        .addEventListener("change", applyFilters);
 
    document.getElementById("confirmDeleteCarBtn")
        .addEventListener("click", confirmDeleteCar);
 
});
 
 
// ===============================
// GET ALL CARS
// ===============================
async function loadCars() {
 
    try {
 
        const response = await fetch(
            `${API_BASE}/Car/GetALLCars`
        );
 
        if (!response.ok) {
            throw new Error("Failed to load cars.");
        }
 
        carRecords = await response.json();
 
        displayCars(carRecords);
 
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
// GET ALL CATEGORIES (for filter dropdown)
// ===============================
async function loadCategoriesForFilter() {
 
    try {
 
        const response = await fetch(
            `${API_BASE}/CarCategory/GetALLCarCategories`
        );
 
        if (!response.ok) {
            throw new Error("Failed to load categories.");
        }
 
        categoryRecords = await response.json();
 
        const select = document.getElementById("categoryFilter");
 
        categoryRecords.forEach(function (category) {
 
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
 
            select.appendChild(option);
 
        });
 
    }
    catch (error) {
 
        console.error(error);
 
    }
 
}
 
 
// ===============================
// DISPLAY TABLE
// ===============================
function displayCars(records) {
 
    const tbody =
        document.getElementById("carsTableBody");
 
    const count =
        document.getElementById("recordCount");
 
    count.textContent =
        `${records.length} car${records.length === 1 ? "" : "s"}`;
 
 
    if (records.length === 0) {
 
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="state-empty">
                        <i class="bi bi-inbox"></i>
                        <div>No cars found</div>
                    </div>
                </td>
            </tr>
        `;
 
        return;
 
    }
 
 
    tbody.innerHTML = records.map(function (car) {
 
        const categoryName = getCategoryName(car);
 
        const availabilityBadge = car.isAvailable
            ? `<span class="badge-status badge-success">Available</span>`
            : `<span class="badge-status badge-danger">Unavailable</span>`;
 
        return `
            <tr>
                <td><strong>${car.make} ${car.model}</strong></td>
                <td>${car.year}</td>
                <td>${categoryName}</td>
                <td>$${car.dailyRate}/day</td>
                <td>${availabilityBadge}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-outline-secondary"
                                title="Edit"
                                onclick="location.href='car-form.html?id=${car.id}'">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger"
                                title="Delete"
                                onclick="openDeleteCarModal(${car.id}, '${car.make} ${car.model}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
 
    }).join("");
 
}
 
 
function getCategoryName(car) {
 
    if (car.category && car.category.name) {
        return car.category.name;
    }
 
    if (car.categoryName) {
        return car.categoryName;
    }
 
    const match = categoryRecords.find(function (c) {
        return c.id === car.categoryId;
    });
 
    return match ? match.name : "—";
 
}
 
 
// ===============================
// FILTERING (client-side)
// ===============================
function applyFilters() {
 
    const query =
        document.getElementById("searchInput").value.trim().toLowerCase();
 
    const categoryId =
        document.getElementById("categoryFilter").value;
 
    const availability =
        document.getElementById("availabilityFilter").value;
 
    const filtered = carRecords.filter(function (car) {
 
        const matchesSearch =
            !query || `${car.make} ${car.model}`.toLowerCase().includes(query);
 
        const matchesCategory =
            !categoryId || String(car.categoryId) === String(categoryId);
 
        const matchesAvailability =
            availability === "" || String(car.isAvailable) === availability;
 
        return matchesSearch && matchesCategory && matchesAvailability;
 
    });
 
    displayCars(filtered);
 
}
 
 
// ===============================
// DELETE
// ===============================
function openDeleteCarModal(id, label) {
 
    carPendingDeleteId = id;
 
    document.getElementById("deleteCarLabel").textContent = label;
 
    deleteCarModal.show();
 
}
 
 
async function confirmDeleteCar() {
 
    if (carPendingDeleteId === null) {
        return;
    }
 
    try {
 
        const response = await fetch(
            `${API_BASE}/Car/DeleteCar/${carPendingDeleteId}`,
            { method: "DELETE" }
        );
 
        if (!response.ok) {
            throw new Error("Failed to delete car.");
        }
 
        showMessage(
            "Car deleted successfully.",
            "success"
        );
 
        carPendingDeleteId = null;
 
        deleteCarModal.hide();
 
        await loadCars();
 
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
// MESSAGE HELPER
// ===============================
function showMessage(text, type) {
 
    const box = document.getElementById("messageBox");
 
    box.className = `alert alert-${type}`;
    box.textContent = text;
    box.classList.remove("d-none");
 
}
 Const API_BASE = " ";
 
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get("id");
 
 
// Load when page opens
document.addEventListener("DOMContentLoaded", function () {
 
    if (editId) {
        loadCarForEdit(editId);
    }
    else {
        loadCategoriesIntoSelect();
    }
 
    document.getElementById("carForm")
        .addEventListener("submit", handleSubmit);
 
});
 
 
// ===============================
// GET CATEGORIES (for select)
// ===============================
async function loadCategoriesIntoSelect(selectedId) {
 
    const select = document.getElementById("categoryId");
 
    try {
 
        const response = await fetch(
            `${API_BASE}/CarCategory/GetALLCarCategories`
        );
 
        if (!response.ok) {
            throw new Error("Failed to load categories.");
        }
 
        const categories = await response.json();
 
        select.innerHTML =
            '<option value="" disabled selected>Choose a category...</option>' +
            categories.map(function (category) {
                return `<option value="${category.id}">${category.name}</option>`;
            }).join("");
 
        if (selectedId) {
            select.value = selectedId;
        }
 
    }
    catch (error) {
 
        select.innerHTML =
            '<option value="" disabled selected>Could not load categories</option>';
 
        showMessage(
            error.message,
            "danger"
        );
 
        console.error(error);
 
    }
 
}
 
 
// ===============================
// GET CAR (edit mode)
// ===============================
async function loadCarForEdit(id) {
 
    document.getElementById("formTitle").textContent = "Edit Car";
    document.getElementById("submitBtn").innerHTML =
        '<i class="bi bi-check-lg"></i> Update Car';
 
    try {
 
        const response = await fetch(
            `${API_BASE}/Car/GetCarById/${id}`
        );
 
        if (!response.ok) {
            throw new Error("Failed to load this car.");
        }
 
        const car = await response.json();
 
        document.getElementById("carId").value = car.id;
        document.getElementById("make").value = car.make || "";
        document.getElementById("model").value = car.model || "";
        document.getElementById("year").value = car.year || "";
        document.getElementById("dailyRate").value = car.dailyRate || "";
        document.getElementById("isAvailable").value = String(car.isAvailable);
        document.getElementById("plateNumber").value = car.plateNumber || "";
 
        await loadCategoriesIntoSelect(car.categoryId);
 
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
// VALIDATE
// ===============================
function validateForm() {
 
    let valid = true;
 
    const make = document.getElementById("make").value.trim();
    const model = document.getElementById("model").value.trim();
    const year = document.getElementById("year").value;
    const dailyRate = document.getElementById("dailyRate").value;
    const categoryId = document.getElementById("categoryId").value;
 
    setInvalid("make", !make);
    setInvalid("model", !model);
    setInvalid("year", !year || year < 1980 || year > 2100);
    setInvalid("dailyRate", !dailyRate || dailyRate < 0);
    setInvalid("categoryId", !categoryId);
 
    if (!make || !model || !categoryId) valid = false;
    if (!year || year < 1980 || year > 2100) valid = false;
    if (!dailyRate || dailyRate < 0) valid = false;
 
    return valid;
 
}
 
 
function setInvalid(id, isInvalid) {
 
    document.getElementById(id).classList.toggle("is-invalid", isInvalid);
 
}
 
 
// ===============================
// SUBMIT (Add or Update)
// ===============================
async function handleSubmit(event) {
 
    event.preventDefault();
 
    if (!validateForm()) {
        return;
    }
 
    const payload = {
        make: document.getElementById("make").value.trim(),
        model: document.getElementById("model").value.trim(),
        year: Number(document.getElementById("year").value),
        dailyRate: Number(document.getElementById("dailyRate").value),
        categoryId: Number(document.getElementById("categoryId").value),
        isAvailable: document.getElementById("isAvailable").value === "true",
        plateNumber: document.getElementById("plateNumber").value.trim() || null
    };
 
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
 
    try {
 
        let response;
 
        if (editId) {
 
            response = await fetch(
                `${API_BASE}/Car/UpdateCar/${editId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );
 
        }
        else {
 
            response = await fetch(
                `${API_BASE}/Car/AddCar`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );
 
        }
 
        if (!response.ok) {
            throw new Error("Failed to save this car.");
        }
 
        window.location.href = "cars.html";
 
    }
    catch (error) {
 
        showMessage(
            error.message,
            "danger"
        );
 
        console.error(error);
 
        submitBtn.disabled = false;
 
    }
 
}
 
 
// ===============================
// MESSAGE HELPER
// ===============================
function showMessage(text, type) {
 
    const box = document.getElementById("messageBox");
 
    box.className = `alert alert-${type}`;
    box.textContent = text;
    box.classList.remove("d-none");
 
}