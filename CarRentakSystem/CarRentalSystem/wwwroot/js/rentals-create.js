// ========================================
// API URLS
// ========================================

const RENTAL_API = "/Rental";
const CAR_API = "/Car";
const USER_API = "/User";
const BRANCH_API = "/api/Branch";
const DRIVER_API = "/DriverProfile";


// ========================================
// PAGE START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Load dropdown data
        await Promise.all([
            loadCustomers(),
            loadCars(),
            loadBranches(),
            loadDriverProfiles()
        ]);


        // Form submit
        document
            .getElementById("rentalForm")
            .addEventListener(
                "submit",
                createRental
            );


        // Calculate days
        document
            .getElementById("startDate")
            .addEventListener(
                "change",
                calculateTotalDays
            );


        document
            .getElementById("dueDate")
            .addEventListener(
                "change",
                calculateTotalDays
            );


        // Update summary
        document
            .getElementById("userId")
            .addEventListener(
                "change",
                updateSummary
            );


        document
            .getElementById("carId")
            .addEventListener(
                "change",
                updateSummary
            );


        document
            .getElementById("branchId")
            .addEventListener(
                "change",
                updateSummary
            );

    }
);



// ========================================
// LOAD CUSTOMERS
// GET /User/GetAllUser
// ========================================

async function loadCustomers() {

    const select =
        document.getElementById("userId");

    try {

        const response =
            await authorizedFetch("/User/GetCustomers");

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Customers API error:",
                response.status,
                errorText
            );

            throw new Error(
                "Failed to load customers."
            );
        }

        const customers =
            await response.json();

        console.log(
            "CUSTOMERS LOADED:",
            customers
        );

        select.innerHTML = `
            <option value="" disabled selected>
                Select customer...
            </option>
        `;

        customers.forEach(customer => {

            const option =
                document.createElement("option");

            option.value =
                customer.userId;

            option.textContent =
                customer.name;

            select.appendChild(option);
        });

    }
    catch (error) {

        console.error(error);

        select.innerHTML = `
            <option value="" disabled selected>
                Could not load customers
            </option>
        `;

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ========================================
// LOAD CARS
// GET /Car/GetAllCars
// ========================================

async function loadCars() {

    const select =
        document.getElementById(
            "carId"
        );


    try {

        const response =
            await authorizedFetch(
                `${CAR_API}/GetAllCars`
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Cars API error:",
                errorText
            );


            throw new Error(
                "Failed to load cars."
            );

        }


        const cars =
            await response.json();


        select.innerHTML = `
            <option
                value=""
                disabled
                selected>
                Select available car...
            </option>
        `;


        // Only available cars
        const availableCars =
            cars.filter(
                function (car) {

                    return (
                        car.isAvailable === true
                    );

                }
            );


        availableCars.forEach(
            function (car) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    car.carId;


                option.textContent =
                    `${car.make} ${car.model} — ${car.plateNumber}`;


                select.appendChild(
                    option
                );

            }
        );


        if (availableCars.length === 0) {

            select.innerHTML = `
                <option
                    value=""
                    disabled
                    selected>
                    No available cars
                </option>
            `;

        }

    }
    catch (error) {

        console.error(error);


        select.innerHTML = `
            <option
                value=""
                disabled
                selected>
                Could not load cars
            </option>
        `;


        showMessage(
            error.message,
            "danger"
        );

    }

}


// ========================================
// LOAD BRANCHES
// GET /api/Branch
// ========================================

async function loadBranches() {

    const select =
        document.getElementById(
            "branchId"
        );


    try {

        const response =
            await authorizedFetch(
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


        const branches =
            await response.json();


        select.innerHTML = `
            <option
                value=""
                disabled
                selected>
                Select branch...
            </option>
        `;


        branches.forEach(
            function (branch) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    branch.id;


                option.textContent =
                    branch.name;


                select.appendChild(
                    option
                );

            }
        );


        if (branches.length === 0) {

            select.innerHTML = `
                <option
                    value=""
                    disabled
                    selected>
                    No branches found
                </option>
            `;

        }

    }
    catch (error) {

        console.error(error);


        select.innerHTML = `
            <option
                value=""
                disabled
                selected>
                Could not load branches
            </option>
        `;


        showMessage(
            error.message,
            "danger"
        );

    }

}


// ========================================
// LOAD DRIVER PROFILES
// GET /DriverProfile/GetAllDriverProfiles
// ========================================

async function loadDriverProfiles() {

    const select =
        document.getElementById(
            "driverProfileId"
        );


    try {

        const response =
            await authorizedFetch(
                `${DRIVER_API}/GetAllDriverProfiles`
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Driver Profiles API error:",
                errorText
            );


            throw new Error(
                "Failed to load driver profiles."
            );

        }


        const drivers =
            await response.json();


        select.innerHTML = `
            <option
                value=""
                disabled
                selected>
                Select driver profile...
            </option>
        `;


        drivers.forEach(
            function (driver) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    driver.driverProfile_ID;


                option.textContent =
                    `License ${driver.licenseNumber} — User ${driver.userId}`;


                select.appendChild(
                    option
                );

            }
        );


        if (drivers.length === 0) {

            select.innerHTML = `
                <option
                    value=""
                    disabled
                    selected>
                    No driver profiles found
                </option>
            `;

        }

    }
    catch (error) {

        console.error(error);


        select.innerHTML = `
            <option
                value=""
                disabled
                selected>
                Could not load driver profiles
            </option>
        `;


        showMessage(
            error.message,
            "danger"
        );

    }

}


// ========================================
// CALCULATE TOTAL DAYS
// ========================================

function calculateTotalDays() {

    const startDateValue =
        document
            .getElementById(
                "startDate"
            )
            .value;


    const dueDateValue =
        document
            .getElementById(
                "dueDate"
            )
            .value;


    const preview =
        document.getElementById(
            "totalDaysPreview"
        );


    if (
        !startDateValue ||
        !dueDateValue
    ) {

        preview.value =
            "0 days";


        document
            .getElementById(
                "summaryDays"
            )
            .textContent =
            "0 days";


        return 0;

    }


    const start =
        new Date(
            `${startDateValue}T00:00:00`
        );


    const due =
        new Date(
            `${dueDateValue}T00:00:00`
        );


    const difference =
        due - start;


    const days =
        Math.round(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (days <= 0) {

        preview.value =
            "Invalid dates";


        document
            .getElementById(
                "summaryDays"
            )
            .textContent =
            "Invalid";


        return 0;

    }


    preview.value =
        `${days} ${days === 1
            ? "day"
            : "days"
        }`;


    document
        .getElementById(
            "summaryDays"
        )
        .textContent =
        `${days} ${days === 1
            ? "day"
            : "days"
        }`;


    return days;

}


// ========================================
// UPDATE SUMMARY
// ========================================

function updateSummary() {

    updateSelectedText(
        "userId",
        "summaryCustomer"
    );


    updateSelectedText(
        "carId",
        "summaryCar"
    );


    updateSelectedText(
        "branchId",
        "summaryBranch"
    );


    calculateTotalDays();

}


// ========================================
// HELPER FOR SUMMARY
// ========================================

function updateSelectedText(
    selectId,
    summaryId
) {

    const select =
        document.getElementById(
            selectId
        );


    const summary =
        document.getElementById(
            summaryId
        );


    if (
        !select.value ||
        select.selectedIndex < 0
    ) {

        summary.textContent =
            "—";

        return;

    }


    summary.textContent =
        select.options[
            select.selectedIndex
        ].textContent;

}


// ========================================
// CREATE RENTAL
// POST /Rental/AddRental
// ========================================

async function createRental(event) {

    event.preventDefault();


    // Hide previous success
    document
        .getElementById(
            "rentalSuccessAlert"
        )
        .classList
        .add("d-none");


    const userId =
        document
            .getElementById(
                "userId"
            )
            .value;


    const carId =
        document
            .getElementById(
                "carId"
            )
            .value;


    const branchId =
        document
            .getElementById(
                "branchId"
            )
            .value;


    const driverProfileId =
        document
            .getElementById(
                "driverProfileId"
            )
            .value;


    const startDate =
        document
            .getElementById(
                "startDate"
            )
            .value;


    const dueDate =
        document
            .getElementById(
                "dueDate"
            )
            .value;


    const status =
        document
            .getElementById(
                "rentalStatus"
            )
            .value;


    // ====================================
    // VALIDATION
    // ====================================

    if (
        !userId ||
        !carId ||
        !branchId ||
        !driverProfileId ||
        !startDate ||
        !dueDate
    ) {

        showMessage(
            "Please fill in all rental fields.",
            "danger"
        );

        return;

    }


    const totalDays =
        calculateTotalDays();


    if (totalDays <= 0) {

        showMessage(
            "Due date must be after start date.",
            "danger"
        );

        return;

    }


    // ====================================
    // PAYLOAD
    // Matches Rental.cs
    // ====================================

    const rental = {

        startDate:
            `${startDate}T00:00:00`,

        dueDate:
            `${dueDate}T00:00:00`,

        status:
            status,

        carId:
            Number(carId),

        userId:
            Number(userId),

        branchId:
            Number(branchId),

        driverProfile_ID:
            Number(driverProfileId)

    };


    console.log(
        "Rental being sent:",
        rental
    );


    const button =
        document.getElementById(
            "createRentalBtn"
        );


    const originalButtonText =
        button.innerHTML;


    button.disabled =
        true;


    button.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-1">
        </span>

        Creating Rental...
    `;


    try {

        const response =
            await authorizedFetch(
                `${RENTAL_API}/AddRental`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            rental
                        )
                }
            );


        // ====================================
        // API ERROR
        // ====================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Create Rental API error:",
                errorText
            );


            throw new Error(
                errorText ||
                "Failed to create rental."
            );

        }


        // ====================================
        // SUCCESS
        // ====================================

        const result =
            await response.json();


        console.log(
            "Rental created:",
            result
        );


        document
            .getElementById(
                "messageBox"
            )
            .classList
            .add("d-none");


        document
            .getElementById(
                "rentalSuccessAlert"
            )
            .classList
            .remove("d-none");


        // Reset form

        document
            .getElementById(
                "rentalForm"
            )
            .reset();


        document
            .getElementById(
                "totalDaysPreview"
            )
            .value =
            "0 days";


        document
            .getElementById(
                "summaryCustomer"
            )
            .textContent =
            "—";


        document
            .getElementById(
                "summaryCar"
            )
            .textContent =
            "—";


        document
            .getElementById(
                "summaryBranch"
            )
            .textContent =
            "—";


        document
            .getElementById(
                "summaryDays"
            )
            .textContent =
            "0 days";


        // Scroll to success message

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        // Reload cars because availability
        // may change elsewhere in the system.

        await loadCars();

    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message,
            "danger"
        );

    }
    finally {

        button.disabled =
            false;


        button.innerHTML =
            originalButtonText;

    }

}


// ========================================
// SHOW MESSAGE
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
        cleanApiError(
            message
        );


    box.classList.remove(
        "d-none"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// CLEAN ASP.NET ERROR RESPONSE
// ========================================

function cleanApiError(message) {

    if (!message) {

        return "Something went wrong.";

    }


    // Sometimes ASP.NET sends plain text.
    // Sometimes it sends JSON.

    try {

        const parsed =
            JSON.parse(message);


        if (parsed.title) {

            return parsed.title;

        }


        if (parsed.message) {

            return parsed.message;

        }

    }
    catch {

        // Not JSON.
        // Just use original message.

    }


    return message;

}