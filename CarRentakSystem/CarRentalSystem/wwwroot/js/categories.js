const API_BASE = " ";
 
let categoryRecords = [];
let categoryModal;
let deleteCategoryModal;
let categoryPendingDeleteId = null;
 
 
// Load when page opens
document.addEventListener("DOMContentLoaded", function () {
 
    categoryModal =
        new bootstrap.Modal(
            document.getElementById("categoryModal")
        );
 
    deleteCategoryModal =
        new bootstrap.Modal(
            document.getElementById("deleteCategoryModal")
        );
 
    loadCategories();
 
    document.getElementById("categoryForm")
        .addEventListener("submit", handleCategorySubmit);
 
    document.getElementById("confirmDeleteCategoryBtn")
        .addEventListener("click", confirmDeleteCategory);
 
});
 
 
// ===============================
// GET ALL
// ===============================
async function loadCategories() {
 
    try {
 
        const response = await fetch(
            `${API_BASE}/CarCategory/GetALLCarCategories`
        );
 
        if (!response.ok) {
            throw new Error("Failed to load categories.");
        }
 
        categoryRecords = await response.json();
 
        displayCategories(categoryRecords);
 
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
function displayCategories(records) {
 
    const tbody =
        document.getElementById("categoriesTableBody");
 
    const count =
        document.getElementById("recordCount");
 
    count.textContent =
        `${records.length} categor${records.length === 1 ? "y" : "ies"}`;
 
 
    if (records.length === 0) {
 
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-5">
                    <div class="state-empty">
                        <i class="bi bi-inbox"></i>
                        <div>No categories found</div>
                    </div>
                </td>
            </tr>
        `;
 
        return;
 
    }
 
 
    tbody.innerHTML = records.map(function (category) {
 
        return `
            <tr>
                <td><strong>${category.name}</strong></td>
                <td>$${category.defaultDailyRate ?? category.dailyRate ?? "—"}/day</td>
                <td>${category.carsCount ?? "—"}</td>
                <td>
                    <div class="row-actions">
                        <button class="btn btn-outline-secondary"
                                title="Edit"
                                onclick="openCategoryModal(${category.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger"
                                title="Delete"
                                onclick="openDeleteCategoryModal(${category.id}, '${category.name}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
 
    }).join("");
 
}
 
 
// ===============================
// ADD / EDIT MODAL
// ===============================
function openCategoryModal(id) {
 
    const form = document.getElementById("categoryForm");
    form.reset();
 
    setInvalid("categoryName", false);
    setInvalid("categoryRate", false);
 
    if (id) {
 
        const category = categoryRecords.find(function (c) {
            return c.id === id;
        });
 
        document.getElementById("categoryModalTitle").textContent = "Edit Category";
        document.getElementById("categoryId").value = category.id;
        document.getElementById("categoryName").value = category.name;
        document.getElementById("categoryRate").value =
            category.defaultDailyRate ?? category.dailyRate ?? "";
 
    }
    else {
 
        document.getElementById("categoryModalTitle").textContent = "Add Category";
        document.getElementById("categoryId").value = "";
 
    }
 
    categoryModal.show();
 
}
 
 
function setInvalid(id, isInvalid) {
 
    document.getElementById(id).classList.toggle("is-invalid", isInvalid);
 
}
 
 
// ===============================
// SUBMIT (Add or Update)
// ===============================
async function handleCategorySubmit(event) {
 
    event.preventDefault();
 
    const name = document.getElementById("categoryName").value.trim();
    const rate = document.getElementById("categoryRate").value;
 
    setInvalid("categoryName", !name);
    setInvalid("categoryRate", !rate || rate < 0);
 
    if (!name || !rate || rate < 0) {
        return;
    }
 
    const id = document.getElementById("categoryId").value;
 
    const payload = {
        name: name,
        defaultDailyRate: Number(rate)
    };
 
    const submitBtn = document.getElementById("categorySubmitBtn");
    submitBtn.disabled = true;
 
    try {
 
        let response;
 
        if (id) {
 
            response = await fetch(
                `${API_BASE}/CarCategory/UpdateCarCategory/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );
 
        }
        else {
 
            response = await fetch(
                `${API_BASE}/CarCategory/AddCarCategory`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );
 
        }
 
        if (!response.ok) {
            throw new Error("Failed to save this category.");
        }
 
        showMessage(
            id ? "Category updated successfully." : "Category added successfully.",
            "success"
        );
 
        categoryModal.hide();
 
        await loadCategories();
 
    }
    catch (error) {
 
        showMessage(
            error.message,
            "danger"
        );
 
        console.error(error);
 
    }
    finally {
 
        submitBtn.disabled = false;
 
    }
 
}
 
 
// ===============================
// DELETE
// ===============================
function openDeleteCategoryModal(id, label) {
 
    categoryPendingDeleteId = id;
 
    document.getElementById("deleteCategoryLabel").textContent = label;
 
    deleteCategoryModal.show();
 
}
 
 
async function confirmDeleteCategory() {
 
    if (categoryPendingDeleteId === null) {
        return;
    }
 
    try {
 
        const response = await fetch(
            `${API_BASE}/CarCategory/DeleteCarCategory/${categoryPendingDeleteId}`,
            { method: "DELETE" }
        );
 
        if (!response.ok) {
            throw new Error("Failed to delete category.");
        }
 
        showMessage(
            "Category deleted successfully.",
            "success"
        );
 
        categoryPendingDeleteId = null;
 
        deleteCategoryModal.hide();
 
        await loadCategories();
 
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
 