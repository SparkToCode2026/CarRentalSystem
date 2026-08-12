// ==========================================================
// USERS PAGE - RoadKey
// ==========================================================

const USER_API = {
    register: "/User/Register",
    getAll: "/User/GetAllUser",
    getById: "/User/GetUserById",
    getRelated: "/User/GetUserWithRelatedData",
    update: "/User/UpdateUser",
    updateRole: "/User/UpdateUserRole",
    delete: "/User/DeleteUser",
    search: "/User/GetByName",
    sort: "/User/SortUsersByName"
};


let userIdToDelete = null;


// ==========================================================
// PAGE START
// ==========================================================

document.addEventListener("DOMContentLoaded", async function () {

    // Must be logged in
    if (!requireLogin()) {
        return;
    }

    setupEvents();

    // Try loading all users
    await loadUsers();
});


// ==========================================================
// EVENTS
// ==========================================================

function setupEvents() {

    document
        .getElementById("searchButton")
        ?.addEventListener("click", searchUsers);


    document
        .getElementById("showAllButton")
        ?.addEventListener("click", loadUsers);


    document
        .getElementById("sortUsersButton")
        ?.addEventListener("click", sortUsers);


    document
        .getElementById("addUserForm")
        ?.addEventListener("submit", addUser);


    document
        .getElementById("editUserForm")
        ?.addEventListener("submit", updateUser);


    document
        .getElementById("saveRoleButton")
        ?.addEventListener("click", updateUserRole);


    document
        .getElementById("confirmDeleteUserButton")
        ?.addEventListener("click", deleteUser);


    // Search when pressing Enter
    document
        .getElementById("searchName")
        ?.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                searchUsers();
            }

        });
}


// ==========================================================
// 1. GET ALL USERS
// ==========================================================

async function loadUsers() {

    showLoading();

    try {

        const response =
            await authorizedFetch(USER_API.getAll);


        if (!response) {
            return;
        }


        // Logged in but not Admin
        if (response.status === 403) {

            showAccessDenied();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Could not load users."
            );
        }


        const users =
            await response.json();


        renderUsers(users);

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );

        hideLoading();
    }
}


// ==========================================================
// RENDER USERS TABLE
// ==========================================================

function renderUsers(users) {

    const table =
        document.getElementById("usersTableBody");

    const empty =
        document.getElementById("emptyUsers");


    hideLoading();

    table.innerHTML = "";


    if (!users || users.length === 0) {

        empty.classList.remove("d-none");

        return;
    }


    empty.classList.add("d-none");


    users.forEach(user => {

        const row =
            document.createElement("tr");


        const createdDate =
            user.createdAtUtc
                ? new Date(
                    user.createdAtUtc
                ).toLocaleDateString()
                : "-";


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHtml(user.name ?? "")}
                </strong>
            </td>


            <td>
                ${escapeHtml(user.email ?? "")}
            </td>


            <td>
                <span class="badge-status badge-neutral">
                    ${formatRole(user.role)}
                </span>
            </td>


            <td>
                ${createdDate}
            </td>


            <td>

                <div class="row-actions">

                    <!-- VIEW RELATED DATA -->

                    <button
                        class="btn btn-outline-secondary"
                        title="View"
                        onclick="viewUser(${user.userId})">

                        <i class="bi bi-eye"></i>

                    </button>


                    <!-- EDIT USER -->

                    <button
                        class="btn btn-outline-secondary"
                        title="Edit"
                        onclick="openEditUser(${user.userId})">

                        <i class="bi bi-pencil"></i>

                    </button>


                    <!-- CHANGE ROLE -->

                    <button
                        class="btn btn-outline-secondary"
                        title="Change Role"
                        onclick="openRoleModal(${user.userId}, '${formatRole(user.role)}')">

                        <i class="bi bi-person-gear"></i>

                    </button>


                    <!-- DELETE -->

                    <button
                        class="btn btn-outline-danger"
                        title="Delete"
                        onclick="openDeleteUser(
                            ${user.userId},
                            '${escapeForAttribute(user.name ?? "")}'
                        )">

                        <i class="bi bi-trash"></i>

                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);
    });
}


// ==========================================================
// 2. SEARCH USERS BY NAME
// ==========================================================

async function searchUsers() {

    const name =
        document
            .getElementById("searchName")
            .value
            .trim();


    if (name === "") {

        await loadUsers();

        return;
    }


    showLoading();


    try {

        const response =
            await authorizedFetch(
                `${USER_API.search}?name=${encodeURIComponent(name)}`
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            showAccessDenied();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Could not search users."
            );
        }


        const users =
            await response.json();


        renderUsers(users);

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );

        hideLoading();
    }
}


// ==========================================================
// 3. SORT USERS A-Z
// ==========================================================

async function sortUsers() {

    showLoading();


    try {

        const response =
            await authorizedFetch(
                USER_API.sort
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            showAccessDenied();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Could not sort users."
            );
        }


        const users =
            await response.json();


        renderUsers(users);

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );

        hideLoading();
    }
}


// ==========================================================
// 4. VIEW USER WITH RELATED DATA
// ==========================================================

async function viewUser(id) {

    const content =
        document.getElementById(
            "viewUserContent"
        );


    content.innerHTML =
        "Loading user details...";


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "viewUserModal"
            )
        );


    modal.show();


    try {

        const response =
            await authorizedFetch(
                `${USER_API.getRelated}?id=${id}`
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            content.innerHTML = `
                <div class="alert alert-danger">
                    You do not have permission
                    to view this user.
                </div>
            `;

            return;
        }


        if (response.status === 404) {

            content.innerHTML = `
                <div class="alert alert-warning">
                    User not found.
                </div>
            `;

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Could not load user details."
            );
        }


        const user =
            await response.json();


        content.innerHTML = `

            <div class="row g-3">

                <div class="col-md-6">

                    <div class="small text-muted">
                        Name
                    </div>

                    <strong>
                        ${escapeHtml(user.name ?? "-")}
                    </strong>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Email
                    </div>

                    <strong>
                        ${escapeHtml(user.email ?? "-")}
                    </strong>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Role
                    </div>

                    <span class="badge-status badge-neutral">
                        ${formatRole(user.role)}
                    </span>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Created
                    </div>

                    <strong>
                        ${user.createdAtUtc
                ? new Date(
                    user.createdAtUtc
                ).toLocaleString()
                : "-"
            }
                    </strong>

                </div>


                <div class="col-12">
                    <hr>
                </div>


                <div class="col-md-4">

                    <div class="small text-muted">
                        Rentals
                    </div>

                    <strong>
                        ${user.rentals?.length ?? 0}
                    </strong>

                </div>


                <div class="col-md-4">

                    <div class="small text-muted">
                        Reviews
                    </div>

                    <strong>
                        ${user.reviews?.length ?? 0}
                    </strong>

                </div>


                <div class="col-md-4">

                    <div class="small text-muted">
                        Driver Profile
                    </div>

                    <strong>
                        ${user.driverProfile ? "Yes" : "No"}
                    </strong>

                </div>

            </div>

        `;

    }
    catch (error) {

        console.error(error);

        content.innerHTML = `

            <div class="alert alert-danger">
                ${escapeHtml(error.message)}
            </div>

        `;
    }
}


// ==========================================================
// 5. GET USER BY ID + OPEN EDIT
// ==========================================================

async function openEditUser(id) {

    try {

        const response =
            await authorizedFetch(
                `${USER_API.getById}?id=${id}`
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            showMessage(
                "You do not have permission to edit users.",
                "danger"
            );

            return;
        }


        if (response.status === 404) {

            showMessage(
                "User not found.",
                "warning"
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Could not load the user."
            );
        }


        const user =
            await response.json();


        // Save full original user temporarily.
        // Needed because your current UpdateUser
        // endpoint expects the complete User object.

        sessionStorage.setItem(
            "editingUser",
            JSON.stringify(user)
        );


        document
            .getElementById("editUserId")
            .value = user.userId;


        document
            .getElementById("editUserName")
            .value = user.name ?? "";


        document
            .getElementById("editUserEmail")
            .value = user.email ?? "";


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById(
                    "editUserModal"
                )
            );


        modal.show();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ==========================================================
// 6. UPDATE USER
// ==========================================================

async function updateUser(event) {

    event.preventDefault();


    const id =
        Number(
            document
                .getElementById(
                    "editUserId"
                )
                .value
        );


    const stored =
        sessionStorage.getItem(
            "editingUser"
        );


    if (!stored) {

        showMessage(
            "Could not find the original user data.",
            "danger"
        );

        return;
    }


    const original =
        JSON.parse(stored);


    // Your CURRENT backend UpdateUser
    // expects a full User object.
    //
    // We preserve passwordHash, role and CreatedAtUtc
    // instead of changing them here.

    const updatedUser = {

        ...original,

        name:
            document
                .getElementById(
                    "editUserName"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "editUserEmail"
                )
                .value
                .trim()
    };


    try {

        const response =
            await authorizedFetch(
                `${USER_API.update}?id=${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedUser
                        )
                }
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            showMessage(
                "You do not have permission to update users.",
                "danger"
            );

            return;
        }


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "Could not update user."
            );
        }


        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "editUserModal"
                )
            )
            ?.hide();


        sessionStorage.removeItem(
            "editingUser"
        );


        showMessage(
            "User updated successfully.",
            "success"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ==========================================================
// 7. OPEN ROLE MODAL
// ==========================================================

function openRoleModal(id, role) {

    document
        .getElementById("roleUserId")
        .value = id;


    const select =
        document.getElementById("newRole");


    // Only assign if the option exists
    const optionExists =
        [...select.options]
            .some(
                option =>
                    option.value === role
            );


    if (optionExists) {
        select.value = role;
    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "roleModal"
            )
        );


    modal.show();
}


// ==========================================================
// 8. UPDATE USER ROLE
// ==========================================================

async function updateUserRole() {

    const id =
        document
            .getElementById(
                "roleUserId"
            )
            .value;


    const role =
        document
            .getElementById(
                "newRole"
            )
            .value;


    try {

        const response =
            await authorizedFetch(
                `${USER_API.updateRole}?id=${id}&newRole=${encodeURIComponent(role)}`,
                {
                    method: "PUT"
                }
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            showMessage(
                "You do not have permission to change user roles.",
                "danger"
            );

            return;
        }


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "Could not update role."
            );
        }


        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "roleModal"
                )
            )
            ?.hide();


        showMessage(
            "User role updated successfully.",
            "success"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ==========================================================
// 9. OPEN DELETE MODAL
// ==========================================================

function openDeleteUser(id, name) {

    userIdToDelete = id;


    document
        .getElementById(
            "deleteUserName"
        )
        .textContent = name;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "deleteUserModal"
            )
        );


    modal.show();
}


// ==========================================================
// 10. DELETE USER
// ==========================================================

async function deleteUser() {

    if (userIdToDelete === null) {
        return;
    }


    try {

        const response =
            await authorizedFetch(
                `${USER_API.delete}?id=${userIdToDelete}`,
                {
                    method: "DELETE"
                }
            );


        if (!response) {
            return;
        }


        if (response.status === 403) {

            showMessage(
                "You do not have permission to delete users.",
                "danger"
            );

            return;
        }


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "Could not delete user."
            );
        }


        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "deleteUserModal"
                )
            )
            ?.hide();


        userIdToDelete = null;


        showMessage(
            "User deleted successfully.",
            "success"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ==========================================================
// 11. ADD USER / REGISTER
// ==========================================================

async function addUser(event) {

    event.preventDefault();


    const user = {

        name:
            document
                .getElementById(
                    "addUserName"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "addUserEmail"
                )
                .value
                .trim(),

        password:
            document
                .getElementById(
                    "addUserPassword"
                )
                .value
    };


    try {

        // Register is AllowAnonymous,
        // so normal fetch is enough.

        const response =
            await fetch(
                USER_API.register,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(user)
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text || "Could not create user."
            );
        }


        const result =
            await response.json();


        document
            .getElementById(
                "addUserForm"
            )
            .reset();


        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "addUserModal"
                )
            )
            ?.hide();


        showMessage(
            `User created successfully. User ID: ${result.userId ?? ""}`,
            "success"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ==========================================================
// UI HELPERS
// ==========================================================

function showLoading() {

    document
        .getElementById(
            "loadingUsers"
        )
        .classList.remove(
            "d-none"
        );


    document
        .getElementById(
            "emptyUsers"
        )
        .classList.add(
            "d-none"
        );


    document
        .getElementById(
            "usersTableBody"
        )
        .innerHTML = "";
}


function hideLoading() {

    document
        .getElementById(
            "loadingUsers"
        )
        .classList.add(
            "d-none"
        );
}


function showAccessDenied() {

    const loading =
        document.getElementById(
            "loadingUsers"
        );


    loading.classList.remove(
        "d-none"
    );


    loading.innerHTML = `

        <i class="bi bi-shield-lock"></i>

        <div style="
            color:var(--ink);
            font-weight:600;">

            Access denied

        </div>

        <p class="mb-0">

            This page requires
            Admin permissions.

        </p>

    `;
}


function showMessage(
    text,
    type = "success"
) {

    const box =
        document.getElementById(
            "userMessage"
        );


    box.innerHTML = `

        <div
            class="alert alert-${type}
                   alert-dismissible fade show">

            ${escapeHtml(text)}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>

    `;


    setTimeout(() => {

        box.innerHTML = "";

    }, 4000);
}


// ==========================================================
// ROLE DISPLAY
// ==========================================================

function formatRole(role) {

    // If backend sends role as a string:
    if (typeof role === "string") {
        return role;
    }

    // If backend sends numeric enum values,
    // leave the number visible until we confirm
    // the exact UserRole enum order.
    return role ?? "-";
}


// ==========================================================
// SAFE HTML HELPERS
// ==========================================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeForAttribute(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}