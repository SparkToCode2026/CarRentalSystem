const API_URL = "/DriverProfile";


// ========================================
// Load all driver profiles
// ========================================

async function loadDrivers() {

    try {

        const response =
            await authorizedFetch(`${API_URL}/GetAllDriverProfiles`);


        if (!response.ok) {

            throw new Error(
                "Failed to load driver profiles"
            );

        }


        const drivers =
            await response.json();


        displayDrivers(drivers);


    } catch (error) {

        console.error(error);


        showMessage(
            "Unable to load driver profiles.",
            "danger"
        );

    }

}



// ========================================
// Display drivers in the table
// ========================================

function displayDrivers(drivers) {


    const table =
        document.getElementById(
            "driverProfilesTable"
        );


    table.innerHTML = "";



    if (drivers.length === 0) {


        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="state-empty">

                        <i class="bi bi-person-badge"></i>


                        <div
                            style="color:var(--ink);font-weight:600;">

                            No driver profiles yet

                        </div>


                        <p class="mb-0">

                            Add a driver profile to see it here.

                        </p>


                    </div>

                </td>

            </tr>

        `;


        return;

    }



    drivers.forEach(driver => {


        const expiryDate =

            new Date(
                driver.licenseExpiryDate
            ).toLocaleDateString();



        table.innerHTML += `

            <tr>


                <td>

                    ${driver.userId}

                </td>



                <td>

                    <span class="plate">

                        ${driver.licenseNumber}

                    </span>

                </td>



                <td>

                    ${expiryDate}

                </td>



                <td>

                    ${getLicenseStatus(
            driver.licenseExpiryDate
        )}

                </td>



                <td>

                    <div class="row-actions">


                        <button
                            class="btn btn-outline-secondary"
                            title="View"
                            onclick="viewDriver(${driver.driverProfile_ID})">

                            <i class="bi bi-eye"></i>

                        </button>



                        <button
                            class="btn btn-outline-secondary"
                            title="Edit"
                            onclick="editDriver(${driver.driverProfile_ID})">

                            <i class="bi bi-pencil"></i>

                        </button>



                        <button
                            class="btn btn-outline-danger"
                            title="Delete"
                            onclick="deleteDriver(${driver.driverProfile_ID})">

                            <i class="bi bi-trash"></i>

                        </button>


                    </div>

                </td>


            </tr>

        `;

    });

}



// ========================================
// Determine license status
// ========================================

function getLicenseStatus(expiryDate) {


    const today =
        new Date();


    const expiry =
        new Date(expiryDate);



    if (expiry < today) {


        return `

            <span class="badge-status badge-danger">

                Expired

            </span>

        `;

    }



    return `

        <span class="badge-status badge-success">

            Valid

        </span>

    `;

}



// ========================================
// Show message
// ========================================

function showMessage(message, type) {


    const messageDiv =
        document.getElementById("message");


    if (!messageDiv) {

        console.log(message);

        return;

    }


    messageDiv.innerHTML = `

        <div class="alert alert-${type}">

            ${message}

        </div>

    `;

}



// ========================================
// Add new driver profile
// ========================================

async function addDriver() {


    const userId =
        document.getElementById(
            "userId"
        ).value;



    const licenseNumber =
        document.getElementById(
            "licenseNumber"
        ).value;



    const licenseExpiryDate =
        document.getElementById(
            "licenseExpiryDate"
        ).value;



    // Validation

    if (
        !userId ||
        !licenseNumber ||
        !licenseExpiryDate
    ) {


        showMessage(
            "Please fill in all fields.",
            "danger"
        );


        return;

    }



    // Create DriverProfile object

    const driverProfile = {


        licenseNumber:
            parseInt(
                licenseNumber
            ),


        licenseExpiryDate:
        licenseExpiryDate,


        userId:
            parseInt(
                userId
            )

    };



    try {


        const response =
            await authorizedFetch(
                `${API_URL}/AddDriverProfile`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            driverProfile
                        )

                }
            );



        if (!response.ok) {


            const errorText =
                await response.text();


            console.error(
                "API Error:",
                errorText
            );


            throw new Error(
                "Failed to add driver profile"
            );

        }



        const result =
            await response.json();



        console.log(
            "Driver added:",
            result
        );



        // Close modal

        const modalElement =
            document.getElementById(
                "addDriverModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }



        // Clear form

        document
            .getElementById(
                "addDriverForm"
            )
            .reset();



        // Reload drivers

        await loadDrivers();



        // Show success message

        showMessage(
            "Driver profile added successfully.",
            "success"
        );


    } catch (error) {


        console.error(error);


        showMessage(
            "Unable to add driver profile.",
            "danger"
        );

    }

}
// ========================================
// VIEW DRIVER
// ========================================

async function viewDriver(id) {

    try {

        const response = await authorizedFetch(
            `${API_URL}/GetDriverProfileWithRelatedData?id=${id}`
        );

        if (!response.ok) {
            throw new Error("Failed to load driver profile.");
        }

        const driver = await response.json();

        const content =
            document.getElementById("viewDriverContent");

        content.innerHTML = `
    <p><strong>User ID:</strong> ${driver.userId}</p>

    <p><strong>User:</strong>
        ${driver.userName ?? "-"}
    </p>

    <p><strong>License Number:</strong>
        ${driver.licenseNumber}
    </p>

    <p><strong>Expiry Date:</strong>
        ${new Date(driver.licenseExpiryDate).toLocaleDateString()}
    </p>

    <p><strong>Rentals:</strong>
        ${driver.rentalCount}
    </p>
`;

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById("viewDriverModal")
            );

        modal.show();

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load driver profile.",
            "danger"
        );
    }
}



// ========================================
// EDIT DRIVER
// ========================================

async function editDriver(id) {

    try {

        const response = await authorizedFetch(
            `${API_URL}/GetDriverProfile?id=${id}`
        );

        if (!response.ok) {
            throw new Error("Driver profile not found.");
        }

        const driver = await response.json();

        document.getElementById("editDriverId").value =
            driver.driverProfile_ID;

        document.getElementById("editUserId").value =
            driver.userId;

        document.getElementById("editLicenseNumber").value =
            driver.licenseNumber;

        document.getElementById("editLicenseExpiryDate").value =
            driver.licenseExpiryDate.substring(0, 10);

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById("editDriverModal")
            );

        modal.show();

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load driver profile for editing.",
            "danger"
        );
    }
}



// ========================================
// UPDATE DRIVER
// ========================================

async function updateDriver() {

    const id =
        document.getElementById("editDriverId").value;

    const updatedDriver = {

        userId:
            Number(
                document.getElementById("editUserId").value
            ),

        licenseNumber:
            Number(
                document.getElementById("editLicenseNumber").value
            ),

        licenseExpiryDate:
            document.getElementById("editLicenseExpiryDate").value
    };

    try {

        const response = await authorizedFetch(
            `${API_URL}/UpdateDriverProfile?id=${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedDriver)
            }
        );

        if (!response.ok) {

            const text = await response.text();

            throw new Error(
                text || "Failed to update driver profile."
            );
        }

        bootstrap.Modal
            .getInstance(
                document.getElementById("editDriverModal")
            )
            ?.hide();

        await loadDrivers();

        showMessage(
            "Driver profile updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to update driver profile.",
            "danger"
        );
    }
}



// ========================================
// DELETE DRIVER
// ========================================

async function deleteDriver(id) {

    if (!confirm(
        "Are you sure you want to delete this driver profile?"
    )) {
        return;
    }

    try {

        const response = await authorizedFetch(
            `${API_URL}/RemoveDriverProfile?id=${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const text = await response.text();

            throw new Error(
                text || "Failed to delete driver profile."
            );
        }

        await loadDrivers();

        showMessage(
            "Driver profile deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );
    }
}


// ========================================
// Page initialization
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const updateDriverBtn =
            document.getElementById(
                "updateDriverBtn"
            );

        if (updateDriverBtn) {

            updateDriverBtn.addEventListener(
                "click",
                updateDriver
            );
        }
        // Load drivers

        loadDrivers();



        // Add Driver button

        const addDriverBtn =
            document.getElementById(
                "addDriverBtn"
            );



        // Save Driver button

        const saveDriverBtn =
            document.getElementById(
                "saveDriverBtn"
            );



        // Add Driver Modal

        const addDriverModal =
            document.getElementById(
                "addDriverModal"
            );



        // Check elements exist

        if (
            !addDriverBtn ||
            !saveDriverBtn ||
            !addDriverModal
        ) {

            console.error(
                "Add Driver elements were not found."
            );


            return;

        }



        // Open Add Driver modal

        addDriverBtn.addEventListener(
            "click",
            () => {


                const modal =
                    new bootstrap.Modal(
                        addDriverModal
                    );


                modal.show();

            }
        );



        // Save Driver

        saveDriverBtn.addEventListener(
            "click",
            addDriver
        );

    }
);