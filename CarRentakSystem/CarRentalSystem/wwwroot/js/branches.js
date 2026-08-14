// ========================================
// API
// ========================================

const BRANCH_API = "/api/Branch";


// ========================================
// VARIABLES
// ========================================

let branches = [];

let branchModal;
let deleteBranchModal;

let pendingDeleteBranchId = null;


// ========================================
// PAGE START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        branchModal =
            new bootstrap.Modal(
                document.getElementById(
                    "branchModal"
                )
            );


        deleteBranchModal =
            new bootstrap.Modal(
                document.getElementById(
                    "deleteBranchModal"
                )
            );


        // Add
        document
            .getElementById("addBranchBtn")
            .addEventListener(
                "click",
                openAddBranchModal
            );


        // Form
        document
            .getElementById("branchForm")
            .addEventListener(
                "submit",
                saveBranch
            );


        // Delete
        document
            .getElementById(
                "confirmDeleteBranchBtn"
            )
            .addEventListener(
                "click",
                confirmDeleteBranch
            );


        // Search
        document
            .getElementById("citySearch")
            .addEventListener(
                "input",
                searchBranches
            );


        // Sort name
        document
            .getElementById("sortNameBtn")
            .addEventListener(
                "click",
                function () {

                    sortBranches("name");

                }
            );


        // Sort city
        document
            .getElementById("sortCityBtn")
            .addEventListener(
                "click",
                function () {

                    sortBranches("city");

                }
            );


        // Refresh
        document
            .getElementById("refreshBtn")
            .addEventListener(
                "click",
                loadBranches
            );


        loadBranches();

    }
);


// ========================================
// GET ALL
// GET /api/Branch
// ========================================

async function loadBranches() {

    try {

        const response =
            await fetch(
                BRANCH_API
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Branches API error:",
                errorText
            );

            throw new Error(
                "Failed to load branches."
            );
        }


        branches =
            await response.json();


        displayBranches(
            branches
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
// DISPLAY
// ========================================

function displayBranches(records) {

    const tableBody =
        document.getElementById(
            "branchesTableBody"
        );


    const count =
        document.getElementById(
            "recordCount"
        );


    count.textContent =
        `${records.length} ${records.length === 1
            ? "branch"
            : "branches"
        }`;


    if (records.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center py-5">

                    <div class="state-empty">

                        <i class="bi bi-geo-alt"></i>

                        <div>
                            No branches found
                        </div>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    tableBody.innerHTML =
        records.map(
            function (branch) {

                return `

                    <tr>


                        <td>

                            <strong>
                                ${escapeHtml(
                    branch.name
                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHtml(
                    branch.city
                )}

                        </td>


                        <td>

                            ${escapeHtml(
                    branch.address
                )}

                        </td>


                        <td>

                            ${branch.carsCount ?? 0}

                        </td>


                        <td>

                            ${branch.rentalsCount ?? 0}

                        </td>


                        <td>

                            <div class="row-actions">


                                <button
                                    type="button"
                                    class="btn btn-outline-secondary"
                                    title="Edit"
                                    onclick="openEditBranchModal(${branch.id})">

                                    <i class="bi bi-pencil"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn btn-outline-danger"
                                    title="Delete"
                                    onclick="openDeleteBranchModal(${branch.id})">

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
// OPEN ADD MODAL
// ========================================

function openAddBranchModal() {

    document
        .getElementById(
            "branchForm"
        )
        .reset();


    document
        .getElementById(
            "branchId"
        )
        .value =
        "";


    document
        .getElementById(
            "branchModalTitle"
        )
        .textContent =
        "Add Branch";


    document
        .getElementById(
            "saveBranchBtn"
        )
        .textContent =
        "Save Branch";


    branchModal.show();

}


// ========================================
// EDIT
// GET /api/Branch/{id}
// ========================================

async function openEditBranchModal(id) {

    try {

        const response =
            await fetch(
                `${BRANCH_API}/${id}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to load branch."
            );
        }


        const branch =
            await response.json();


        document
            .getElementById(
                "branchId"
            )
            .value =
            branch.id;


        document
            .getElementById(
                "branchName"
            )
            .value =
            branch.name;


        document
            .getElementById(
                "branchCity"
            )
            .value =
            branch.city;


        document
            .getElementById(
                "branchAddress"
            )
            .value =
            branch.address;


        document
            .getElementById(
                "branchModalTitle"
            )
            .textContent =
            "Edit Branch";


        document
            .getElementById(
                "saveBranchBtn"
            )
            .textContent =
            "Update Branch";


        branchModal.show();

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
// SAVE
// POST OR PUT
// ========================================

async function saveBranch(event) {

    event.preventDefault();


    const id =
        document
            .getElementById(
                "branchId"
            )
            .value;


    const name =
        document
            .getElementById(
                "branchName"
            )
            .value
            .trim();


    const city =
        document
            .getElementById(
                "branchCity"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "branchAddress"
            )
            .value
            .trim();


    if (
        !name ||
        !city ||
        !address
    ) {

        showMessage(
            "Please fill in all branch fields.",
            "danger"
        );

        return;
    }


    const branch = {

        name:
            name,

        city:
            city,

        address:
            address

    };


    try {

        let response;


        // UPDATE
        if (id) {

            response =
                await fetch(
                    `${BRANCH_API}/${id}`,
                    {
                        method:
                            "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                branch
                            )
                    }
                );

        }


        // ADD
        else {

            response =
                await fetch(
                    BRANCH_API,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                branch
                            )
                    }
                );

        }


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to save branch."
            );
        }


        branchModal.hide();


        await loadBranches();


        showMessage(
            id
                ? "Branch updated successfully."
                : "Branch added successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(error);


        showMessage(
            cleanApiError(
                error.message
            ),
            "danger"
        );

    }

}


// ========================================
// OPEN DELETE MODAL
// ========================================

function openDeleteBranchModal(id) {

    const branch =
        branches.find(
            b => b.id === id
        );


    if (!branch) {

        showMessage(
            "Branch not found.",
            "danger"
        );

        return;
    }


    pendingDeleteBranchId =
        id;


    document
        .getElementById(
            "deleteBranchLabel"
        )
        .textContent =
        branch.name;


    deleteBranchModal.show();

}


// ========================================
// DELETE
// DELETE /api/Branch/{id}
// ========================================

async function confirmDeleteBranch() {

    if (
        pendingDeleteBranchId === null
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${BRANCH_API}/${pendingDeleteBranchId}`,
                {
                    method:
                        "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            deleteBranchModal.hide();


            showMessage(
                cleanApiError(
                    errorText
                ),
                "danger"
            );


            return;

        }


        deleteBranchModal.hide();


        pendingDeleteBranchId =
            null;


        await loadBranches();


        showMessage(
            "Branch deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(error);


        showMessage(
            "Unable to delete branch.",
            "danger"
        );

    }

}


// ========================================
// FILTER BY CITY
// GET /api/Branch/filter?city=Muscat
// ========================================

async function searchBranches() {

    const city =
        document
            .getElementById(
                "citySearch"
            )
            .value
            .trim();


    if (!city) {

        await loadBranches();

        return;

    }


    try {

        const response =
            await fetch(

                `${BRANCH_API}/filter?city=${encodeURIComponent(
                    city
                )}`

            );


        if (!response.ok) {

            throw new Error(
                "Failed to search branches."
            );

        }


        const results =
            await response.json();


        displayBranches(
            results
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
// SORT
// ========================================

async function sortBranches(sortBy) {

    try {

        const response =
            await fetch(

                `${BRANCH_API}/sort?sortBy=${sortBy}&descending=false`

            );


        if (!response.ok) {

            throw new Error(
                "Failed to sort branches."
            );

        }


        const results =
            await response.json();


        branches =
            results;


        displayBranches(
            results
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
// MESSAGE
// ========================================

function showMessage(
    message,
    type
) {

    const box =
        document.getElementById(
            "messageBox"
        );


    box.className =
        `alert alert-${type}`;


    box.textContent =
        message;


    box.classList.remove(
        "d-none"
    );


    setTimeout(
        function () {

            box.classList.add(
                "d-none"
            );

        },
        4000
    );

}


// ========================================
// CLEAN ASP.NET ERROR
// ========================================

function cleanApiError(message) {

    if (!message) {

        return "Something went wrong.";

    }


    try {

        const parsed =
            JSON.parse(
                message
            );


        return (
            parsed.message ||
            parsed.title ||
            message
        );

    }
    catch {

        // ASP.NET sometimes returns
        // a JSON encoded string like:
        // "Branch not found."

        if (
            message.startsWith('"') &&
            message.endsWith('"')
        ) {

            return message.slice(
                1,
                -1
            );

        }


        return message;

    }

}


// ========================================
// HTML SAFETY
// ========================================

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}