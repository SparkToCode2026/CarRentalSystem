// ========================================
// ROADKEY DASHBOARD
// main.js
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Dashboard JS loaded");

        loadDashboard();
        setupNavigation();

    }
);


// ========================================
// LOAD EVERYTHING
// ========================================

async function loadDashboard() {

    await Promise.all([
        loadAvailableCars(),
        loadRentals(),
        loadCustomers(),
        loadBranches()
    ]);

}


// ========================================
// 1. AVAILABLE CARS
// GET /Car/GetAllCars
// ========================================

async function loadAvailableCars() {

    try {

        const response =
            await authorizedFetch(
                "/Car/GetAllCars"
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Cars API:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to load cars"
            );
        }


        const cars =
            await response.json();


        console.log(
            "Cars:",
            cars
        );


        const availableCars =
            cars.filter(
                car =>
                    car.isAvailable === true
            );


        document
            .getElementById(
                "availableCars"
            )
            .textContent =
            availableCars.length;

    }
    catch (error) {

        console.error(
            "Available cars error:",
            error
        );


        document
            .getElementById(
                "availableCars"
            )
            .textContent =
            "—";
    }

}


// ========================================
// 2. RENTALS
// GET /Rental/GetAllRentals
// ========================================

async function loadRentals() {

    try {

        const response =
            await authorizedFetch(
                "/Rental/GetAllRentals"
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Rentals API:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to load rentals"
            );
        }


        const rentals =
            await response.json();


        console.log(
            "Rentals:",
            rentals
        );


        // Active rentals
        const activeRentals =
            rentals.filter(
                rental =>
                    String(
                        rental.status ?? ""
                    )
                        .toLowerCase() ===
                    "active"
            );


        document
            .getElementById(
                "activeRentals"
            )
            .textContent =
            activeRentals.length;


        // Recent rentals
        displayRecentRentals(
            rentals
        );

    }
    catch (error) {

        console.error(
            "Rentals error:",
            error
        );


        document
            .getElementById(
                "activeRentals"
            )
            .textContent =
            "—";
    }

}


// ========================================
// 3. CUSTOMERS
// GET /User/GetCustomers
// ========================================

async function loadCustomers() {

    try {

        const response =
            await authorizedFetch(
                "/User/GetCustomers"
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Customers API:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to load customers"
            );
        }


        const customers =
            await response.json();


        console.log(
            "Customers:",
            customers
        );


        document
            .getElementById(
                "totalCustomers"
            )
            .textContent =
            customers.length;

    }
    catch (error) {

        console.error(
            "Customers error:",
            error
        );


        document
            .getElementById(
                "totalCustomers"
            )
            .textContent =
            "—";
    }

}


// ========================================
// 4. BRANCHES
// GET /api/Branch
// ========================================

async function loadBranches() {

    try {

        const response =
            await authorizedFetch(
                "/api/Branch"
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Branches API:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to load branches"
            );
        }


        const branches =
            await response.json();


        console.log(
            "Branches:",
            branches
        );


        document
            .getElementById(
                "totalBranches"
            )
            .textContent =
            branches.length;

    }
    catch (error) {

        console.error(
            "Branches error:",
            error
        );


        document
            .getElementById(
                "totalBranches"
            )
            .textContent =
            "—";
    }

}


// ========================================
// RECENT RENTALS
// ========================================

function displayRecentRentals(
    rentals
) {

    const container =
        document.getElementById(
            "recentRentals"
        );


    if (!container) {

        console.error(
            "recentRentals element not found"
        );

        return;
    }


    if (
        !rentals ||
        rentals.length === 0
    ) {

        container.innerHTML = `

            <div class="state-empty">

                <i class="bi bi-inbox"></i>

                <div>
                    No rentals found
                </div>

            </div>

        `;

        return;
    }


    // Newest Rental_ID first

    const recent =
        [...rentals]

            .sort(
                (a, b) =>
                    b.rental_ID -
                    a.rental_ID
            )

            .slice(
                0,
                5
            );


    container.innerHTML = `

        <div class="table-responsive">

            <table class="table align-middle mb-0">

                <thead>

                    <tr>

                        <th>
                            Rental
                        </th>

                        <th>
                            Car
                        </th>

                        <th>
                            Customer
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Days
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${recent.map(
        rental => `

                            <tr>

                                <td>

                                    <strong>
                                        RNT-${rental.rental_ID}
                                    </strong>

                                </td>


                                <td>

                                    ${escapeHtml(
            rental.carName ??
            `Car #${rental.carId}`
        )}

                                </td>


                                <td>

                                    ${escapeHtml(
            rental.customerName ??
            `User #${rental.userId}`
        )}

                                </td>


                                <td>

                                    ${statusBadge(
            rental.status
        )}

                                </td>


                                <td>

                                    ${rental.totalDays ?? 0}

                                </td>

                            </tr>

                        `
    ).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// ========================================
// STATUS BADGE
// ========================================

function statusBadge(
    status
) {

    const value =
        String(
            status ?? ""
        );


    let cssClass =
        "badge-neutral";


    switch (
    value.toLowerCase()
    ) {

        case "active":

            cssClass =
                "badge-success";

            break;


        case "overdue":

            cssClass =
                "badge-danger";

            break;


        case "cancelled":

            cssClass =
                "badge-danger";

            break;


        case "completed":

            cssClass =
                "badge-neutral";

            break;

    }


    return `

        <span class="badge-status ${cssClass}">

            ${escapeHtml(
        value || "Unknown"
    )}

        </span>

    `;

}


// ========================================
// BUTTON / SIDEBAR NAVIGATION
// ========================================

function setupNavigation() {

    // ------------------------------------
    // Top New Rental button
    // ------------------------------------

    const newRentalButtons =
        document.querySelectorAll(
            ".btn-primary"
        );


    newRentalButtons.forEach(
        button => {

            if (
                button.textContent
                    .includes(
                        "New Rental"
                    ) ||

                button.textContent
                    .includes(
                        "Create Rental"
                    )
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        location.href =
                            "pages/rentals-create.html";

                    }
                );

            }

        }
    );


    // ------------------------------------
    // Quick Action buttons
    // ------------------------------------

    const buttons =
        document.querySelectorAll(
            "button"
        );


    buttons.forEach(
        button => {

            const text =
                button.textContent
                    .trim();


            if (
                text.includes(
                    "View Cars"
                )
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        location.href =
                            "pages/cars.html";

                    }
                );

            }


            if (
                text.includes(
                    "View Rentals"
                )
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        location.href =
                            "pages/rentals.html";

                    }
                );

            }

        }
    );

}


// ========================================
// HTML SAFETY
// ========================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}
