const API_URL = "/Insurance";


// =====================================================
// Load all insurance policies
// =====================================================

async function loadInsurances() {

    try {

        const response =
            await authorizedFetch(`${API_URL}/GetAllInsurances`);


        if (!response.ok) {

            throw new Error(
                "Failed to load insurance policies"
            );

        }


        const insurances =
            await response.json();


        displayInsurances(insurances);


    } catch (error) {

        console.error(
            "Load Insurance Error:",
            error
        );


        showMessage(
            "Unable to load insurance policies.",
            "danger"
        );

    }
}



// =====================================================
// Display insurance policies
// =====================================================

function displayInsurances(insurances) {

    const table =
        document.getElementById(
            "insuranceTable"
        );


    table.innerHTML = "";



    if (!insurances || insurances.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="state-empty">

                        <i class="bi bi-shield-check"></i>

                        <div
                            style="color:var(--ink);font-weight:600;">

                            No insurance policies yet

                        </div>

                        <p class="mb-0">

                            Add an insurance policy
                            to see it here.

                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }



    insurances.forEach(insurance => {

        table.innerHTML += `

            <tr>


                <!-- Policy Type -->

                <td>

                    ${escapeHtml(
            insurance.policyType
        )}

                </td>



                <!-- Coverage -->

                <td>

                    ${escapeHtml(
            insurance.coverage
        )}

                </td>



                <!-- Premium -->

                <td>

                    $${Number(
            insurance.premium
        ).toFixed(2)}

                </td>



                <!-- Rental -->

                <td>

                    <span class="plate">

                        RNT-${insurance.rental_ID}

                    </span>

                </td>



                <!-- Actions -->

                <td>

                    <div class="row-actions">


                        <!-- View -->

                        <button
                                type="button"
                                class="btn btn-outline-secondary"
                                title="View"
                                onclick="viewInsurance(${insurance.insurance_ID})">

                            <i class="bi bi-eye"></i>

                        </button>



                        <!-- Edit -->

                        <button
                                type="button"
                                class="btn btn-outline-secondary"
                                title="Edit"
                                onclick="editInsurance(${insurance.insurance_ID})">

                            <i class="bi bi-pencil"></i>

                        </button>



                        <!-- Delete -->

                        <button
                                type="button"
                                class="btn btn-outline-danger"
                                title="Delete"
                                onclick="deleteInsurance(${insurance.insurance_ID})">

                            <i class="bi bi-trash"></i>

                        </button>


                    </div>

                </td>


            </tr>

        `;

    });

}



// =====================================================
// Add Insurance
// =====================================================

async function addInsurance() {


    const policyType =
        document.getElementById(
            "policyType"
        ).value.trim();


    const coverage =
        document.getElementById(
            "coverage"
        ).value.trim();


    const premium =
        document.getElementById(
            "premium"
        ).value;


    const rentalId =
        document.getElementById(
            "rentalId"
        ).value;



    // Validation

    if (
        !policyType ||
        !coverage ||
        premium === "" ||
        !rentalId
    ) {

        showMessage(
            "Please fill in all fields.",
            "danger"
        );

        return;

    }



    const insurance = {

        policyType: policyType,

        coverage: coverage,

        premium: Number(premium),

        rental_ID: Number(rentalId)

    };



    console.log(
        "Sending insurance:",
        insurance
    );



    try {


        const response =
            await authorizedFetch(
                `${API_URL}/AddInsurance`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            insurance
                        )

                }
            );



        // Get server response

        const responseText =
            await response.text();



        console.log(
            "Server response:",
            response.status,
            responseText
        );



        if (!response.ok) {

            throw new Error(
                responseText ||
                "Failed to add insurance"
            );

        }



        // Close modal

        const modalElement =
            document.getElementById(
                "addInsuranceModal"
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
                "addInsuranceForm"
            )
            .reset();



        // Reload table

        await loadInsurances();



        // Success

        showMessage(
            "Insurance policy added successfully.",
            "success"
        );


    } catch (error) {


        console.error(
            "Add Insurance Error:",
            error
        );


        showMessage(
            "Unable to add insurance policy.",
            "danger"
        );

    }

}



// =====================================================
// View Insurance
// =====================================================

async function viewInsurance(id) {


    try {


        const response =
            await authorizedFetch(
                `${API_URL}/GetInsurance?id=${id}`
            );



        if (!response.ok) {

            throw new Error(
                "Failed to get insurance"
            );

        }



        const insurance =
            await response.json();



        const content =
            document.getElementById(
                "viewInsuranceContent"
            );


        content.innerHTML = `

            <div class="mb-3">

                <strong>
                    Policy Type
                </strong>

                <div>
                    ${escapeHtml(
            insurance.policyType
        )}
                </div>

            </div>


            <div class="mb-3">

                <strong>
                    Coverage
                </strong>

                <div>
                    ${escapeHtml(
            insurance.coverage
        )}
                </div>

            </div>


            <div class="mb-3">

                <strong>
                    Premium
                </strong>

                <div>
                    $${Number(
            insurance.premium
        ).toFixed(2)}

                </div>

            </div>


            <div>

                <strong>
                    Rental ID
                </strong>

                <div>
                    RNT-${insurance.rental_ID}
                </div>

            </div>

        `;



        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "viewInsuranceModal"
                )
            );


        modal.show();


    } catch (error) {


        console.error(
            "View Insurance Error:",
            error
        );


        showMessage(
            "Unable to load insurance details.",
            "danger"
        );

    }

}



// =====================================================
// Edit Insurance
// =====================================================

async function editInsurance(id) {


    try {


        const response =
            await authorizedFetch(
                `${API_URL}/GetInsurance?id=${id}`
            );



        if (!response.ok) {

            throw new Error(
                "Failed to get insurance"
            );

        }



        const insurance =
            await response.json();



        document.getElementById(
            "editInsuranceId"
        ).value =
            insurance.insurance_ID;



        document.getElementById(
            "editPolicyType"
        ).value =
            insurance.policyType;



        document.getElementById(
            "editCoverage"
        ).value =
            insurance.coverage;



        document.getElementById(
            "editPremium"
        ).value =
            insurance.premium;



        document.getElementById(
            "editRentalId"
        ).value =
            insurance.rental_ID;



        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "editInsuranceModal"
                )
            );


        modal.show();


    } catch (error) {


        console.error(
            "Edit Insurance Error:",
            error
        );


        showMessage(
            "Unable to load insurance for editing.",
            "danger"
        );

    }

}



// =====================================================
// Update Insurance
// =====================================================

async function updateInsurance() {


    const id =
        document.getElementById(
            "editInsuranceId"
        ).value;



    const policyType =
        document.getElementById(
            "editPolicyType"
        ).value.trim();



    const coverage =
        document.getElementById(
            "editCoverage"
        ).value.trim();



    const premium =
        document.getElementById(
            "editPremium"
        ).value;



    const rentalId =
        document.getElementById(
            "editRentalId"
        ).value;



    if (
        !policyType ||
        !coverage ||
        premium === "" ||
        !rentalId
    ) {

        showMessage(
            "Please fill in all fields.",
            "danger"
        );

        return;

    }



    const insurance = {

        policyType: policyType,

        coverage: coverage,

        premium: Number(premium),

        rental_ID: Number(rentalId)

    };



    try {


        const response =
            await authorizedFetch(
                `${API_URL}/UpdateInsurance?id=${id}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            insurance
                        )

                }
            );



        const responseText =
            await response.text();



        console.log(
            "Update response:",
            responseText
        );



        if (!response.ok) {

            throw new Error(
                responseText ||
                "Failed to update insurance"
            );

        }



        const modalElement =
            document.getElementById(
                "editInsuranceModal"
            );


        const modal =
            bootstrap.Modal.getInstance(
                modalElement
            );


        if (modal) {

            modal.hide();

        }



        await loadInsurances();



        showMessage(
            "Insurance policy updated successfully.",
            "success"
        );


    } catch (error) {


        console.error(
            "Update Insurance Error:",
            error
        );


        showMessage(
            "Unable to update insurance policy.",
            "danger"
        );

    }

}



// =====================================================
// Delete Insurance
// =====================================================

async function deleteInsurance(id) {


    const confirmed =
        confirm(
            "Are you sure you want to delete this insurance policy?"
        );



    if (!confirmed) {

        return;

    }



    try {


        const response =
            await authorizedFetch(
                `${API_URL}/RemoveInsurance?id=${id}`,
                {

                    method: "DELETE"

                }
            );



        const responseText =
            await response.text();



        console.log(
            "Delete response:",
            responseText
        );



        if (!response.ok) {

            throw new Error(
                responseText ||
                "Failed to delete insurance"
            );

        }



        await loadInsurances();



        showMessage(
            "Insurance policy deleted successfully.",
            "success"
        );


    } catch (error) {


        console.error(
            "Delete Insurance Error:",
            error
        );


        showMessage(
            "Unable to delete insurance policy.",
            "danger"
        );

    }

}



// =====================================================
// Show Message
// =====================================================

function showMessage(message, type) {


    const messageDiv =
        document.getElementById(
            "message"
        );


    if (!messageDiv) {

        console.log(message);

        return;

    }



    messageDiv.innerHTML = `

        <div
            class="alert alert-${type} alert-dismissible fade show"
            role="alert">

            ${escapeHtml(message)}

            <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
            </button>

        </div>

    `;

}



// =====================================================
// Prevent HTML injection
// =====================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



// =====================================================
// Page Initialization
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // Load existing policies

        loadInsurances();



        // Add button

        const addInsuranceBtn =
            document.getElementById(
                "addInsuranceBtn"
            );



        // Save button

        const saveInsuranceBtn =
            document.getElementById(
                "saveInsuranceBtn"
            );



        // Update button

        const updateInsuranceBtn =
            document.getElementById(
                "updateInsuranceBtn"
            );



        // Add button event

        if (addInsuranceBtn) {

            addInsuranceBtn.addEventListener(
                "click",
                () => {

                    const modal =
                        new bootstrap.Modal(
                            document.getElementById(
                                "addInsuranceModal"
                            )
                        );


                    modal.show();

                }
            );

        }



        // Save event

        if (saveInsuranceBtn) {

            saveInsuranceBtn.addEventListener(
                "click",
                addInsurance
            );

        }



        // Update event

        if (updateInsuranceBtn) {

            updateInsuranceBtn.addEventListener(
                "click",
                updateInsurance
            );

        }

    }
);