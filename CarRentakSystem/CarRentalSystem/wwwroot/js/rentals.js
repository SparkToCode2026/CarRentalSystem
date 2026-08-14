const RENTAL_API = "/Rental";

let rentals = [];

let viewRentalModal;
let statusModal;
let deleteRentalModal;

let pendingDeleteRentalId = null;


// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        viewRentalModal =
            new bootstrap.Modal(
                document.getElementById(
                    "viewRentalModal"
                )
            );

        statusModal =
            new bootstrap.Modal(
                document.getElementById(
                    "statusModal"
                )
            );

        deleteRentalModal =
            new bootstrap.Modal(
                document.getElementById(
                    "deleteRentalModal"
                )
            );


        document
            .getElementById("filterBtn")
            .addEventListener(
                "click",
                filterRentals
            );


        document
            .getElementById("sortDaysBtn")
            .addEventListener(
                "click",
                sortByDays
            );


        document
            .getElementById("refreshBtn")
            .addEventListener(
                "click",
                loadRentals
            );


        document
            .getElementById("saveStatusBtn")
            .addEventListener(
                "click",
                saveRentalStatus
            );


        document
            .getElementById(
                "confirmDeleteRentalBtn"
            )
            .addEventListener(
                "click",
                confirmDeleteRental
            );


        document
            .getElementById("customerSearch")
            .addEventListener(
                "input",
                searchByCustomer
            );


        loadRentals();
    }
);


// ========================================
// GET ALL RENTALS
// GET /Rental/GetAllRentals
// ========================================

async function loadRentals() {

    try {

        const response =
            await fetch(
                `${RENTAL_API}/GetAllRentals`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Get rentals API error:",
                errorText
            );

            throw new Error(
                "Failed to load rentals."
            );
        }


        rentals =
            await response.json();


        displayRentals(rentals);

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
// DISPLAY RENTALS
// ========================================

function displayRentals(records) {

    const tableBody =
        document.getElementById(
            "rentalsTableBody"
        );


    const recordCount =
        document.getElementById(
            "recordCount"
        );


    recordCount.textContent =
        `${records.length} ${records.length === 1
            ? "rental"
            : "rentals"
        }`;


    if (records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center py-5">

                    <div class="state-empty">

                        <i class="bi bi-inbox"></i>

                        <div>
                            No rentals found
                        </div>

                    </div>

                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        records
            .map(
                function (rental) {

                    return `
                        <tr>

                            <td>

                                <span class="plate">
                                    RNT-${rental.rental_ID}
                                </span>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHtml(
                        rental.carName ?? "—"
                    )}
                                </strong>

                                <div class="small text-muted">
                                    ${escapeHtml(
                        rental.plateNumber ?? ""
                    )}
                                </div>

                            </td>


                            <td>

                                ${escapeHtml(
                        rental.customerName ?? "—"
                    )}

                            </td>


                            <td>

                                ${formatDate(
                        rental.startDate
                    )}

                            </td>


                            <td>

                                ${formatDate(
                        rental.dueDate
                    )}

                            </td>


                            <td>

                                ${rental.totalDays ?? 0}

                            </td>


                            <td>

                                ${getStatusBadge(
                        rental.status
                    )}

                            </td>


                            <td>

                                <div class="row-actions">


                                    <!-- VIEW -->

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        title="View"
                                        onclick="viewRental(${rental.rental_ID})">

                                        <i class="bi bi-eye"></i>

                                    </button>


                                    <!-- STATUS -->

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        title="Update Status"
                                        onclick="openStatusModal(
                                            ${rental.rental_ID},
                                            '${escapeForJs(rental.status)}'
                                        )">

                                        <i class="bi bi-arrow-repeat"></i>

                                    </button>


                                    <!-- DELETE -->

                                    <button
                                        type="button"
                                        class="btn btn-outline-danger"
                                        title="Delete"
                                        onclick="openDeleteRentalModal(
                                            ${rental.rental_ID}
                                        )">

                                        <i class="bi bi-trash"></i>

                                    </button>


                                </div>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


// ========================================
// VIEW RENTAL
// GET /Rental/GetRentalById?id=1
// ========================================

async function viewRental(id) {

    try {

        const response =
            await fetch(
                `${RENTAL_API}/GetRentalById?id=${id}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Get rental API error:",
                errorText
            );

            throw new Error(
                errorText ||
                "Failed to load rental."
            );
        }


        const rental =
            await response.json();


        const details =
            document.getElementById(
                "rentalDetails"
            );


        details.innerHTML = `

            <div class="row g-3">


                <div class="col-md-6">

                    <div class="small text-muted">
                        Rental ID
                    </div>

                    <div>
                        <span class="plate">
                            RNT-${rental.rental_ID}
                        </span>
                    </div>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Status
                    </div>

                    <div class="mt-1">

                        ${getStatusBadge(
            rental.status
        )}

                    </div>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Customer
                    </div>

                    <strong>

                        ${escapeHtml(
            rental.customerName ?? "—"
        )}

                    </strong>

                    <div class="small text-muted">

                        User ID:
                        ${rental.userId}

                    </div>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Car
                    </div>

                    <strong>

                        ${escapeHtml(
            rental.carName ?? "—"
        )}

                    </strong>

                    <div class="small text-muted">

                        ${escapeHtml(
            rental.plateNumber ?? ""
        )}

                    </div>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Pickup Branch
                    </div>

                    <strong>

                        ${escapeHtml(
            rental.branchName ?? "—"
        )}

                    </strong>

                </div>


                <div class="col-md-6">

                    <div class="small text-muted">
                        Driver Profile
                    </div>

                    <strong>

                        ${rental.driverLicenseNumber ?? "—"}

                    </strong>

                    <div class="small text-muted">

                        Driver Profile ID:
                        ${rental.driverProfile_ID}

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="small text-muted">
                        Start Date
                    </div>

                    <strong>

                        ${formatDate(
            rental.startDate
        )}

                    </strong>

                </div>


                <div class="col-md-4">

                    <div class="small text-muted">
                        Due Date
                    </div>

                    <strong>

                        ${formatDate(
            rental.dueDate
        )}

                    </strong>

                </div>


                <div class="col-md-4">

                    <div class="small text-muted">
                        Total Days
                    </div>

                    <strong>

                        ${rental.totalDays}

                    </strong>

                </div>


            </div>
        `;


        viewRentalModal.show();

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
// OPEN STATUS MODAL
// ========================================

function openStatusModal(
    id,
    currentStatus
) {

    document
        .getElementById(
            "statusRentalId"
        )
        .value =
        id;


    document
        .getElementById(
            "newStatus"
        )
        .value =
        currentStatus;


    statusModal.show();
}


// ========================================
// UPDATE STATUS
// PATCH
// /Rental/UpdateRentalStatus?id=1&status=Completed
// ========================================

async function saveRentalStatus() {

    const id =
        document
            .getElementById(
                "statusRentalId"
            )
            .value;


    const status =
        document
            .getElementById(
                "newStatus"
            )
            .value;


    if (!id || !status) {

        showMessage(
            "Rental and status are required.",
            "danger"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${RENTAL_API}/UpdateRentalStatus?id=${id}&status=${encodeURIComponent(status)}`,
                {
                    method: "PATCH"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to update rental status."
            );
        }


        statusModal.hide();


        await loadRentals();


        showMessage(
            "Rental status updated successfully.",
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
// FILTER RENTALS
// GET /Rental/FilterRentals
// ========================================

async function filterRentals() {

    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const carId =
        document
            .getElementById(
                "carFilter"
            )
            .value;


    const userId =
        document
            .getElementById(
                "userFilter"
            )
            .value;


    const params =
        new URLSearchParams();


    if (status) {
        params.append(
            "status",
            status
        );
    }


    if (carId) {
        params.append(
            "carId",
            carId
        );
    }


    if (userId) {
        params.append(
            "userId",
            userId
        );
    }


    // No filters
    if (
        !status &&
        !carId &&
        !userId
    ) {

        await loadRentals();

        return;
    }


    try {

        const response =
            await fetch(
                `${RENTAL_API}/FilterRentals?${params.toString()}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to filter rentals."
            );
        }


        const results =
            await response.json();


        displayRentals(results);

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
// SEARCH CUSTOMER
// Frontend search
// ========================================

function searchByCustomer() {

    const search =
        document
            .getElementById(
                "customerSearch"
            )
            .value
            .trim()
            .toLowerCase();


    if (!search) {

        displayRentals(
            rentals
        );

        return;
    }


    const filtered =
        rentals.filter(
            function (rental) {

                return String(
                    rental.customerName ?? ""
                )
                    .toLowerCase()
                    .includes(search);

            }
        );


    displayRentals(
        filtered
    );
}


// ========================================
// SORT BY DAYS
// GET /Rental/RentalAnalytics
// ========================================

async function sortByDays() {

    try {

        const response =
            await fetch(
                `${RENTAL_API}/RentalAnalytics`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to sort rentals."
            );
        }


        const result =
            await response.json();


        // RentalAnalytics returns:
        // {
        //   totalRentals,
        //   totalDaysRented,
        //   averageDaysPerRental,
        //   rentals
        // }

        displayRentals(
            result.rentals ?? []
        );


        showMessage(
            `Total rentals: ${result.totalRentals} | Average days: ${Number(
                result.averageDaysPerRental ?? 0
            ).toFixed(1)}`,
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

function openDeleteRentalModal(id) {

    pendingDeleteRentalId =
        id;


    document
        .getElementById(
            "deleteRentalLabel"
        )
        .textContent =
        `RNT-${id}`;


    deleteRentalModal.show();
}


// ========================================
// DELETE RENTAL
// DELETE /Rental/DeleteRental?id=1
// ========================================

async function confirmDeleteRental() {

    if (
        pendingDeleteRentalId === null
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${RENTAL_API}/DeleteRental?id=${pendingDeleteRentalId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Delete rental API error:",
                errorText
            );


            deleteRentalModal.hide();


            showMessage(
                errorText ||
                "Failed to delete rental.",
                "danger"
            );


            return;
        }


        deleteRentalModal.hide();


        pendingDeleteRentalId =
            null;


        await loadRentals();


        showMessage(
            "Rental deleted successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to delete rental.",
            "danger"
        );
    }
}


// ========================================
// STATUS BADGE
// ========================================

function getStatusBadge(status) {

    const value =
        String(
            status ?? ""
        );


    let badgeClass =
        "badge-neutral";


    switch (
    value.toLowerCase()
    ) {

        case "active":

            badgeClass =
                "badge-success";

            break;


        case "completed":

            badgeClass =
                "badge-neutral";

            break;


        case "overdue":

            badgeClass =
                "badge-danger";

            break;


        case "cancelled":

            badgeClass =
                "badge-danger";

            break;


        default:

            badgeClass =
                "badge-info";

    }


    return `
        <span class="badge-status ${badgeClass}">
            ${escapeHtml(value || "Unknown")}
        </span>
    `;
}


// ========================================
// DATE FORMATTER
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";
    }


    return date.toLocaleDateString();
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


    setTimeout(
        function () {

            messageBox.classList.add(
                "d-none"
            );

        },
        4000
    );
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


// ========================================
// SAFE TEXT FOR INLINE ONCLICK
// ========================================

function escapeForJs(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        );
}