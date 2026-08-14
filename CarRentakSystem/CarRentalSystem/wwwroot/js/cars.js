const CAR_API = "/Car";

let carRecords = [];

let carModal;
let deleteCarModal;

let editingCarId = null;
let pendingDeleteCarId = null;


// ========================================
// PAGE START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carModal =
            new bootstrap.Modal(
                document.getElementById("carModal")
            );


        deleteCarModal =
            new bootstrap.Modal(
                document.getElementById("deleteCarModal")
            );


        // Add Car
        document
            .getElementById("addCarBtn")
            .addEventListener(
                "click",
                openAddCarModal
            );


        // Save Add/Edit
        document
            .getElementById("carForm")
            .addEventListener(
                "submit",
                saveCar
            );


        // Delete confirmation
        document
            .getElementById("confirmDeleteCarBtn")
            .addEventListener(
                "click",
                confirmDeleteCar
            );


        // Search by make
        document
            .getElementById("makeFilter")
            .addEventListener(
                "input",
                applyFilters
            );


        // Availability filter
        document
            .getElementById("availabilityFilter")
            .addEventListener(
                "change",
                applyFilters
            );


        // Sort
        document
            .getElementById("sortRateBtn")
            .addEventListener(
                "click",
                sortCarsByRate
            );


        // Refresh
        document
            .getElementById("refreshBtn")
            .addEventListener(
                "click",
                loadCars
            );


        loadCars();
    }
);


// ========================================
// GET ALL
// GET /Car/GetAllCars
// ========================================

async function loadCars() {

    try {

        const response =
            await fetch(
                `${CAR_API}/GetAllCars`
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to load cars."
            );
        }


        carRecords =
            await response.json();


        displayCars(
            carRecords
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
// DISPLAY CARS
// ========================================

function displayCars(cars) {

    const tbody =
        document.getElementById(
            "carsTableBody"
        );


    const count =
        document.getElementById(
            "recordCount"
        );


    count.textContent =
        `${cars.length} ${cars.length === 1 ? "car" : "cars"}`;


    if (cars.length === 0) {

        tbody.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    class="text-center py-5">

                    <div class="state-empty">

                        <i class="bi bi-inbox"></i>

                        <div>
                            No cars found
                        </div>

                    </div>

                </td>

            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        cars.map(
            function (car) {

                const availability =
                    car.isAvailable

                        ? `
                            <span class="badge-status badge-success">
                                Available
                            </span>
                          `

                        : `
                            <span class="badge-status badge-danger">
                                Unavailable
                            </span>
                          `;


                return `
                    <tr>


                        <td>

                            <span class="plate">
                                ${escapeHtml(car.plateNumber)}
                            </span>

                        </td>


                        <td>

                            <strong>
                                ${escapeHtml(car.make)}
                                ${escapeHtml(car.model)}
                            </strong>

                        </td>


                        <td>
                            ${car.year}
                        </td>


                        <td>
                            ${car.carCategoryId}
                        </td>


                        <td>
                            ${car.branchId}
                        </td>


                        <td>
                            OMR ${Number(car.dailyRate).toFixed(2)}
                        </td>


                        <td>
                            ${availability}
                        </td>


                        <td>

                            <div class="row-actions">


                                <!-- EDIT -->

                                <button
                                    class="btn btn-outline-secondary"
                                    title="Edit"
                                    onclick="openEditCarModal(${car.carId})">

                                    <i class="bi bi-pencil"></i>

                                </button>



                                <!-- AVAILABILITY -->

                                <button
                                    class="btn btn-outline-secondary"
                                    title="Change Availability"
                                    onclick="toggleAvailability(
                                        ${car.carId},
                                        ${car.isAvailable}
                                    )">

                                    <i class="bi bi-arrow-repeat"></i>

                                </button>



                                <!-- DELETE -->

                                <button
                                    class="btn btn-outline-danger"
                                    title="Delete"
                                    onclick="openDeleteCarModal(
                                        ${car.carId},
                                        '${escapeForJs(car.make)} ${escapeForJs(car.model)}'
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
// OPEN ADD CAR
// ========================================

function openAddCarModal() {

    editingCarId =
        null;


    document
        .getElementById("carForm")
        .reset();


    document
        .getElementById("carId")
        .value =
        "";


    document
        .getElementById("carModalTitle")
        .textContent =
        "Add Car";


    document
        .getElementById("saveCarBtn")
        .textContent =
        "Save Car";


    document
        .getElementById("isAvailable")
        .value =
        "true";


    carModal.show();
}


// ========================================
// GET CAR BY ID
// GET /Car/GetCar?id=1
// ========================================

async function openEditCarModal(id) {

    try {

        const response =
            await fetch(
                `${CAR_API}/GetCar?id=${id}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to load car."
            );
        }


        const car =
            await response.json();


        editingCarId =
            car.carId;


        document
            .getElementById("carId")
            .value =
            car.carId;


        document
            .getElementById("plateNumber")
            .value =
            car.plateNumber ?? "";


        document
            .getElementById("make")
            .value =
            car.make ?? "";


        document
            .getElementById("model")
            .value =
            car.model ?? "";


        document
            .getElementById("year")
            .value =
            car.year;


        document
            .getElementById("dailyRate")
            .value =
            car.dailyRate;


        document
            .getElementById("carCategoryId")
            .value =
            car.carCategoryId;


        document
            .getElementById("branchId")
            .value =
            car.branchId;


        document
            .getElementById("isAvailable")
            .value =
            String(
                car.isAvailable
            );


        document
            .getElementById("carModalTitle")
            .textContent =
            "Edit Car";


        document
            .getElementById("saveCarBtn")
            .textContent =
            "Update Car";


        carModal.show();

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
// ADD / UPDATE CAR
// ========================================

async function saveCar(event) {

    event.preventDefault();


    const payload = {

        plateNumber:
            document
                .getElementById("plateNumber")
                .value
                .trim(),

        make:
            document
                .getElementById("make")
                .value
                .trim(),

        model:
            document
                .getElementById("model")
                .value
                .trim(),

        year:
            Number(
                document
                    .getElementById("year")
                    .value
            ),

        dailyRate:
            Number(
                document
                    .getElementById("dailyRate")
                    .value
            ),

        isAvailable:
            document
                .getElementById("isAvailable")
                .value === "true",

        carCategoryId:
            Number(
                document
                    .getElementById("carCategoryId")
                    .value
            ),

        branchId:
            Number(
                document
                    .getElementById("branchId")
                    .value
            )
    };


    // Basic validation

    if (
        !payload.plateNumber ||
        !payload.make ||
        !payload.model ||
        !payload.year ||
        payload.dailyRate < 0 ||
        !payload.carCategoryId ||
        !payload.branchId
    ) {

        showMessage(
            "Please fill in all car fields correctly.",
            "danger"
        );

        return;
    }


    const saveButton =
        document.getElementById(
            "saveCarBtn"
        );


    saveButton.disabled =
        true;


    try {

        let response;


        // ====================================
        // EDIT
        // PUT /Car/UpdateCar?id=1
        // ====================================

        if (editingCarId !== null) {

            response =
                await fetch(
                    `${CAR_API}/UpdateCar?id=${editingCarId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

        }


        // ====================================
        // ADD
        // POST /Car/AddCar
        // ====================================

        else {

            response =
                await fetch(
                    `${CAR_API}/AddCar`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

        }


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to save car."
            );
        }


        carModal.hide();


        showMessage(
            editingCarId !== null
                ? "Car updated successfully."
                : "Car added successfully.",
            "success"
        );


        editingCarId =
            null;


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

        saveButton.disabled =
            false;
    }
}


// ========================================
// UPDATE AVAILABILITY
// PATCH
// /Car/UpdateCarAvailability?id=1&isAvailable=true
// ========================================

async function toggleAvailability(
    id,
    currentAvailability
) {

    const newAvailability =
        !currentAvailability;


    try {

        const response =
            await fetch(
                `${CAR_API}/UpdateCarAvailability?id=${id}&isAvailable=${newAvailability}`,
                {
                    method: "PATCH"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to update availability."
            );
        }


        showMessage(
            "Car availability updated successfully.",
            "success"
        );


        await loadCars();

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
// OPEN DELETE
// ========================================

function openDeleteCarModal(
    id,
    label
) {

    pendingDeleteCarId =
        id;


    document
        .getElementById("deleteCarLabel")
        .textContent =
        label;


    deleteCarModal.show();
}


// ========================================
// DELETE
// DELETE /Car/RemoveCar?id=1
// ========================================

async function confirmDeleteCar() {

    if (
        pendingDeleteCarId === null
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${CAR_API}/RemoveCar?id=${pendingDeleteCarId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Failed to delete car."
            );
        }


        deleteCarModal.hide();


        pendingDeleteCarId =
            null;


        showMessage(
            "Car deleted successfully.",
            "success"
        );


        await loadCars();

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
// FILTER
// ========================================

function applyFilters() {

    const make =
        document
            .getElementById("makeFilter")
            .value
            .trim()
            .toLowerCase();


    const availability =
        document
            .getElementById("availabilityFilter")
            .value;


    const filtered =
        carRecords.filter(
            function (car) {

                const matchesMake =
                    make === "" ||
                    String(
                        car.make ?? ""
                    )
                        .toLowerCase()
                        .includes(make);


                let matchesAvailability =
                    true;


                if (
                    availability === "true"
                ) {

                    matchesAvailability =
                        car.isAvailable === true;
                }


                if (
                    availability === "false"
                ) {

                    matchesAvailability =
                        car.isAvailable === false;
                }


                return (
                    matchesMake &&
                    matchesAvailability
                );
            }
        );


    displayCars(
        filtered
    );
}


// ========================================
// SORT BY DAILY RATE
// Uses your backend endpoint
// GET /Car/SortByDailyRate
// ========================================

async function sortCarsByRate() {

    try {

        const response =
            await fetch(
                `${CAR_API}/SortByDailyRate`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to sort cars."
            );
        }


        const cars =
            await response.json();


        carRecords =
            cars;


        displayCars(
            cars
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
    text,
    type
) {

    const box =
        document.getElementById(
            "messageBox"
        );


    box.className =
        `alert alert-${type}`;


    box.textContent =
        text;


    box.classList.remove(
        "d-none"
    );
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
// SAFE ONCLICK TEXT
// ========================================

function escapeForJs(value) {

    return String(value ?? "")

        .replaceAll(
            "\\",
            "\\\\"
        )

        .replaceAll(
            "'",
            "\\'"
        );
}