// ========================================
// API URL
// ========================================

const API_URL = "/api/CarCategory";


// ========================================
// VARIABLES
// ========================================

let categories = [];

let categoryModal;
let deleteCategoryModal;

let categoryPendingDeleteId = null;


// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Create Bootstrap modals

        categoryModal =
            new bootstrap.Modal(
                document.getElementById(
                    "categoryModal"
                )
            );


        deleteCategoryModal =
            new bootstrap.Modal(
                document.getElementById(
                    "deleteCategoryModal"
                )
            );


        // Load categories when page opens

        loadCategories();


        // Add Category button

        document
            .getElementById("addCategoryBtn")
            .addEventListener(
                "click",
                openAddCategoryModal
            );


        // Category form

        document
            .getElementById("categoryForm")
            .addEventListener(
                "submit",
                saveCategory
            );


        // Delete confirmation

        document
            .getElementById(
                "confirmDeleteCategoryBtn"
            )
            .addEventListener(
                "click",
                confirmDeleteCategory
            );


        // Search

        document
            .getElementById("categorySearch")
            .addEventListener(
                "input",
                searchCategories
            );


        // Sort by name

        document
            .getElementById("sortNameBtn")
            .addEventListener(
                "click",
                function () {

                    sortCategories("name");

                }
            );


        // Sort by rate

        document
            .getElementById("sortRateBtn")
            .addEventListener(
                "click",
                function () {

                    sortCategories("rate");

                }
            );


        // Refresh

        document
            .getElementById("refreshBtn")
            .addEventListener(
                "click",
                loadCategories
            );

    }
);


// ========================================
// GET ALL CATEGORIES
// GET /api/CarCategory
// ========================================

async function loadCategories() {

    try {

        const response =
            await authorizedFetch(API_URL);


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Get categories API error:",
                errorText
            );


            throw new Error(
                "Failed to load categories."
            );

        }


        categories =
            await response.json();


        displayCategories(categories);

    }
    catch (error) {

        console.error(error);


        showMessage(
            "Unable to load categories.",
            "danger"
        );

    }

}


// ========================================
// DISPLAY CATEGORIES
// ========================================

function displayCategories(records) {

    const tableBody =
        document.getElementById(
            "categoriesTableBody"
        );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    recordCount.textContent =
        `${records.length} ${records.length === 1
            ? "category"
            : "categories"
        }`;


    // No categories

    if (records.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center py-5">

                    <div class="state-empty">

                        <i class="bi bi-inbox"></i>

                        <div>
                            No categories found
                        </div>

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    // Display categories

    tableBody.innerHTML =
        records.map(
            function (category) {

                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHtml(category.name)}
                            </strong>

                        </td>


                        <td>

                            OMR ${Number(
                    category.defaultDailyRate
                ).toFixed(2)}

                        </td>


                        <td>

                            ${category.carsCount}

                        </td>


                        <td data-role="admin">

                            <div class="row-actions">


                                <button
                                    type="button"
                                    class="btn btn-outline-secondary"
                                    title="Edit"
                                    onclick="openEditCategoryModal(${category.id})">

                                    <i class="bi bi-pencil"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn btn-outline-danger"
                                    title="Delete"
                                    onclick="openDeleteCategoryModal(${category.id})">

                                    <i class="bi bi-trash"></i>

                                </button>


                            </div>

                        </td>

                    </tr>

                `;

            }

        ).join("");

}


// ========================================
// OPEN ADD CATEGORY MODAL
// ========================================

function openAddCategoryModal() {

    // Clear form

    document
        .getElementById("categoryForm")
        .reset();


    // Clear hidden ID

    document
        .getElementById("categoryId")
        .value = "";


    // Change title

    document
        .getElementById(
            "categoryModalTitle"
        )
        .textContent =
        "Add Category";


    // Change button text

    document
        .getElementById(
            "saveCategoryBtn"
        )
        .textContent =
        "Save Category";


    // Show modal

    categoryModal.show();

}


// ========================================
// OPEN EDIT CATEGORY MODAL
// ========================================

async function openEditCategoryModal(id) {

    try {

        // GET category by ID

        const response =
            await authorizedFetch(
                `${API_URL}/${id}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Get category API error:",
                errorText
            );


            throw new Error(
                "Failed to load category."
            );

        }


        const category =
            await response.json();


        // Put values in form

        document
            .getElementById(
                "categoryId"
            )
            .value =
            category.id;


        document
            .getElementById(
                "categoryName"
            )
            .value =
            category.name;


        document
            .getElementById(
                "categoryRate"
            )
            .value =
            category.defaultDailyRate;


        // Change title

        document
            .getElementById(
                "categoryModalTitle"
            )
            .textContent =
            "Edit Category";


        // Change button text

        document
            .getElementById(
                "saveCategoryBtn"
            )
            .textContent =
            "Update Category";


        // Show modal

        categoryModal.show();

    }
    catch (error) {

        console.error(error);


        showMessage(
            "Unable to load category.",
            "danger"
        );

    }

}


// ========================================
// SAVE CATEGORY
// POST = ADD
// PUT = UPDATE
// ========================================

async function saveCategory(event) {

    event.preventDefault();


    const id =
        document
            .getElementById(
                "categoryId"
            )
            .value;


    const name =
        document
            .getElementById(
                "categoryName"
            )
            .value
            .trim();


    const rate =
        document
            .getElementById(
                "categoryRate"
            )
            .value;


    // ====================================
    // VALIDATION
    // ====================================

    if (!name) {

        showMessage(
            "Category name is required.",
            "danger"
        );

        return;

    }


    if (
        rate === "" ||
        Number(rate) < 0
    ) {

        showMessage(
            "Please enter a valid daily rate.",
            "danger"
        );

        return;

    }


    // Object sent to C# API

    const category = {

        name: name,

        defaultDailyRate:
            Number(rate)

    };


    try {

        let response;


        // ====================================
        // UPDATE
        // ====================================

        if (id) {

            response =
                await authorizedFetch(
                    `${API_URL}/${id}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                category
                            )

                    }
                );

        }


        // ====================================
        // ADD
        // ====================================

        else {

            response =
                await authorizedFetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                category
                            )

                    }
                );

        }


        // ====================================
        // CHECK RESPONSE
        // ====================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Save category API error:",
                errorText
            );


            throw new Error(
                errorText ||
                "Failed to save category."
            );

        }


        // Close modal

        categoryModal.hide();


        // Reload table

        await loadCategories();


        // Success message

        showMessage(

            id
                ? "Category updated successfully."
                : "Category added successfully.",

            "success"

        );

    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message,
            "danger"
        );

    }

}


// ========================================
// OPEN DELETE MODAL
// ========================================

function openDeleteCategoryModal(id) {

    // Find category

    const category =
        categories.find(
            function (category) {

                return category.id === id;

            }
        );


    if (!category) {

        showMessage(
            "Category not found.",
            "danger"
        );

        return;

    }


    // Save ID temporarily

    categoryPendingDeleteId =
        id;


    // Show category name

    document
        .getElementById(
            "deleteCategoryLabel"
        )
        .textContent =
        category.name;


    // Show modal

    deleteCategoryModal.show();

}


// ========================================
// DELETE CATEGORY
// DELETE /api/CarCategory/{id}
// ========================================

async function confirmDeleteCategory() {

    if (
        categoryPendingDeleteId === null
    ) {

        return;

    }


    try {

        const response =
            await authorizedFetch(

                `${API_URL}/${categoryPendingDeleteId}`,

                {

                    method: "DELETE"

                }

            );


        // ====================================
        // DELETE FAILED
        // ====================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Delete category API error:",
                errorText
            );


            // Show backend message
            // Example:
            // cars are using this category

            showMessage(
                errorText ||
                "Failed to delete category.",
                "danger"
            );


            deleteCategoryModal.hide();


            return;

        }


        // ====================================
        // DELETE SUCCESS
        // ====================================

        deleteCategoryModal.hide();


        categoryPendingDeleteId =
            null;


        await loadCategories();


        showMessage(
            "Category deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(error);


        showMessage(
            "Unable to delete category.",
            "danger"
        );

    }

}


// ========================================
// SEARCH / FILTER
// GET /api/CarCategory/filter?name=...
// ========================================

async function searchCategories() {

    const searchText =
        document
            .getElementById(
                "categorySearch"
            )
            .value
            .trim();


    // If empty, load everything

    if (!searchText) {

        await loadCategories();

        return;

    }


    try {

        const response =
            await authorizedFetch(

                `${API_URL}/filter?name=${encodeURIComponent(
                    searchText
                )}`

            );


        if (!response.ok) {

            throw new Error(
                "Failed to search categories."
            );

        }


        const results =
            await response.json();


        displayCategories(results);

    }
    catch (error) {

        console.error(error);


        showMessage(
            "Unable to search categories.",
            "danger"
        );

    }

}


// ========================================
// SORT
// GET /api/CarCategory/sort
// ========================================

async function sortCategories(sortBy) {

    try {

        const response =
            await authorizedFetch(

                `${API_URL}/sort?sortBy=${sortBy}&descending=false`

            );


        if (!response.ok) {

            throw new Error(
                "Failed to sort categories."
            );

        }


        const results =
            await response.json();


        // Keep current displayed data

        categories =
            results;


        displayCategories(results);

    }
    catch (error) {

        console.error(error);


        showMessage(
            "Unable to sort categories.",
            "danger"
        );

    }

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
// SHOW MESSAGE
// ========================================

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "messageBox"
        );


    messageBox.className =
        `alert alert-${type}`;


    messageBox.textContent =
        message;


    messageBox.classList.remove(
        "d-none"
    );


    // Hide after 4 seconds

    setTimeout(
        function () {

            messageBox.classList.add(
                "d-none"
            );

        },

        4000
    );

}