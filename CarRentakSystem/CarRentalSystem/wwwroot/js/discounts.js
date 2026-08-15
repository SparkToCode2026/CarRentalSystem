// ==========================================
// RoadKey - Discounts
// discounts.js
// ==========================================

const API_BASE_URL = "https://localhost:7083";

let discounts = [];

let selectedDiscountId = null;

let discountModal = null;
let deleteDiscountModal = null;


// ==========================================
// PAGE START
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    discountModal = new bootstrap.Modal(
        document.getElementById("discountModal")
    );

    deleteDiscountModal = new bootstrap.Modal(
        document.getElementById("deleteDiscountModal")
    );


    // Form submit
    document
        .getElementById("discountForm")
        .addEventListener("submit", saveDiscount);


    // Delete confirmation
    document
        .getElementById("confirmDeleteDiscountBtn")
        .addEventListener("click", deleteDiscount);


    // Load database data
    loadDiscounts();
});



// ==========================================
// LOAD ALL DISCOUNTS
// GET /Discount/GetAllDiscount
// ==========================================

async function loadDiscounts() {

    showLoading();

    try {

        const response = await authorizedFetch(
            `${API_BASE_URL}/Discount/GetAllDiscount`
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Get discounts error:",
                errorText
            );

            throw new Error(
                "Failed to load discounts."
            );
        }


        discounts = await response.json();


        console.log(
            "Discounts from API:",
            discounts
        );


        renderDiscounts(discounts);

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Could not load discounts from the server.",
            "danger"
        );

        showEmptyTable(
            "Could not load discounts."
        );
    }
}



// ==========================================
// RENDER TABLE
// ==========================================

function renderDiscounts(data) {

    const tableBody =
        document.getElementById(
            "discountsTableBody"
        );

    const recordCount =
        document.getElementById(
            "recordCount"
        );


    recordCount.textContent =
        `${data.length} discount${data.length === 1 ? "" : "s"}`;


    if (data.length === 0) {

        showEmptyTable(
            "No discounts found."
        );

        return;
    }


    tableBody.innerHTML = "";


    data.forEach(discount => {

        // ASP.NET normally serializes
        // Discount_ID as discount_ID
        const id =
            discount.discount_ID ??
            discount.Discount_ID;


        const code =
            discount.code ??
            discount.Code ??
            "";


        const percent =
            discount.percent ??
            discount.Percent ??
            0;


        const expiresOn =
            discount.expiresOn ??
            discount.ExpiresOn;


        const status =
            getDiscountStatus(expiresOn);


        const statusClass =
            status === "Active"
                ? "badge-success"
                : "badge-danger";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <span class="plate">
                    ${escapeHtml(code)}
                </span>
            </td>


            <td>
                <strong>
                    ${Number(percent).toFixed(2)}%
                </strong>
            </td>


            <td>
                ${formatDate(expiresOn)}
            </td>


            <td>

                <span class="badge-status ${statusClass}">
                    ${status}
                </span>

            </td>


            <td>

                <div class="row-actions">


                    <button
                        class="btn btn-outline-secondary"
                        title="Edit"
                        onclick="openEditDiscountModal(${id})">

                        <i class="bi bi-pencil"></i>

                    </button>


                    <button
                        class="btn btn-outline-danger"
                        title="Delete"
                        onclick="openDeleteDiscountModal(
                            ${id},
                            '${escapeForJs(code)}'
                        )">

                        <i class="bi bi-trash"></i>

                    </button>


                </div>

            </td>
        `;


        tableBody.appendChild(row);
    });
}



// ==========================================
// OPEN ADD MODAL
// ==========================================

function openAddDiscountModal() {

    selectedDiscountId = null;


    document.getElementById(
        "discountModalTitle"
    ).textContent = "Add Discount";


    document.getElementById(
        "discountSubmitBtn"
    ).textContent = "Save Discount";


    document.getElementById(
        "discountForm"
    ).reset();


    document.getElementById(
        "discountId"
    ).value = "";


    document.getElementById(
        "discountStatus"
    ).value = "Active";


    discountModal.show();
}



// ==========================================
// OPEN EDIT MODAL
// ==========================================

async function openEditDiscountModal(id) {

    try {

        const response = await authorizedFetch(
            `${API_BASE_URL}/Discount/GetDiscount?discount_id=${id}`
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Could not load discount."
            );
        }


        const discount =
            await response.json();


        selectedDiscountId = id;


        document.getElementById(
            "discountId"
        ).value = id;


        document.getElementById(
            "discountCode"
        ).value =
            discount.code ??
            discount.Code ??
            "";


        document.getElementById(
            "discountPercent"
        ).value =
            discount.percent ??
            discount.Percent ??
            0;


        const expiry =
            discount.expiresOn ??
            discount.ExpiresOn;


        document.getElementById(
            "discountExpiry"
        ).value =
            toDateInputValue(expiry);


        document.getElementById(
            "discountStatus"
        ).value =
            getDiscountStatus(expiry);


        document.getElementById(
            "discountModalTitle"
        ).textContent =
            "Edit Discount";


        document.getElementById(
            "discountSubmitBtn"
        ).textContent =
            "Save Changes";


        discountModal.show();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Could not load discount.",
            "danger"
        );
    }
}



// ==========================================
// SAVE
// ADD OR UPDATE
// ==========================================

async function saveDiscount(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "discountId"
        ).value;


    const code =
        document.getElementById(
            "discountCode"
        ).value.trim();


    const percent =
        Number(
            document.getElementById(
                "discountPercent"
            ).value
        );


    const expiry =
        document.getElementById(
            "discountExpiry"
        ).value;


    const status =
        document.getElementById(
            "discountStatus"
        ).value;


    // -------------------------------
    // Validation
    // -------------------------------

    if (!code) {

        showMessage(
            "Discount code is required.",
            "danger"
        );

        return;
    }


    if (
        Number.isNaN(percent) ||
        percent < 0 ||
        percent > 100
    ) {

        showMessage(
            "Percentage must be between 0 and 100.",
            "danger"
        );

        return;
    }


    if (!expiry) {

        showMessage(
            "Expiration date is required.",
            "danger"
        );

        return;
    }


    // -------------------------------
    // Status must match the expiry date,
    // since status is derived from ExpiresOn
    // -------------------------------

    const actualStatus =
        getDiscountStatus(
            `${expiry}T00:00:00`
        );


    if (status !== actualStatus) {

        showMessage(
            status === "Active"
                ? "For Active status, the expiration date must be today or later."
                : "For Expired status, the expiration date must be in the past.",
            "danger"
        );

        return;
    }


    // Object must match C# Discount model
    const discount = {

        code: code,

        percent: percent,

        expiresOn:
            `${expiry}T00:00:00`
    };


    const submitButton =
        document.getElementById(
            "discountSubmitBtn"
        );


    submitButton.disabled = true;

    submitButton.textContent =
        id
            ? "Saving..."
            : "Adding...";


    try {

        let response;


        // ==================================
        // EDIT
        // ==================================

        if (id) {

            response = await authorizedFetch(
                `${API_BASE_URL}/Discount/UpdateDiscount?discount_id=${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(discount)
                }
            );

        }

        // ==================================
        // ADD
        // ==================================

        else {

            response = await authorizedFetch(
                `${API_BASE_URL}/Discount/AddDiscount`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(discount)
                }
            );
        }


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Save discount error:",
                errorText
            );


            throw new Error(
                errorText ||
                "Could not save discount."
            );
        }


        discountModal.hide();


        showMessage(
            id
                ? "Discount updated successfully."
                : "Discount added successfully.",
            "success"
        );


        await loadDiscounts();

    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Could not save discount.",
            "danger"
        );

    }
    finally {

        submitButton.disabled = false;

        submitButton.textContent =
            id
                ? "Save Changes"
                : "Save Discount";
    }
}


// ==========================================
// OPEN DELETE MODAL
// ==========================================

function openDeleteDiscountModal(
    id,
    code
) {

    selectedDiscountId = id;


    document.getElementById(
        "deleteDiscountLabel"
    ).textContent = code;


    deleteDiscountModal.show();
}



// ==========================================
// DELETE
// DELETE /Discount/RemoveDiscount
// ==========================================

async function deleteDiscount() {

    if (!selectedDiscountId)
        return;


    const button =
        document.getElementById(
            "confirmDeleteDiscountBtn"
        );


    button.disabled = true;

    button.textContent =
        "Deleting...";


    try {

        const response = await authorizedFetch(

            `${API_BASE_URL}/Discount/RemoveDiscount?discount_id=${selectedDiscountId}`,

            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Could not delete discount."
            );
        }


        deleteDiscountModal.hide();


        showMessage(
            "Discount deleted successfully.",
            "success"
        );


        selectedDiscountId = null;


        await loadDiscounts();

    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Could not delete discount.",
            "danger"
        );
    }
    finally {

        button.disabled = false;

        button.textContent =
            "Delete";
    }
}



// ==========================================
// FILTER BY MINIMUM PERCENTAGE
// GET /Discount/GetByPercent
// ==========================================

async function filterDiscounts() {

    const value =
        document.getElementById(
            "percentFilter"
        ).value;


    if (value === "") {

        await loadDiscounts();

        return;
    }


    const percent =
        Number(value);


    if (
        Number.isNaN(percent) ||
        percent < 0
    ) {

        showMessage(
            "Enter a valid percentage.",
            "danger"
        );

        return;
    }


    showLoading();


    try {

        const response = await authorizedFetch(

            `${API_BASE_URL}/Discount/GetByPercent?percent=${encodeURIComponent(percent)}`

        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Could not filter discounts."
            );
        }


        const data =
            await response.json();


        renderDiscounts(data);

    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Could not filter discounts.",
            "danger"
        );


        showEmptyTable(
            "Could not load discounts."
        );
    }
}



// ==========================================
// SORT BY EXPIRY
// GET /Discount/GetSortedByExpiry
// ==========================================

async function loadSortedDiscounts() {

    showLoading();


    try {

        const response = await authorizedFetch(
            `${API_BASE_URL}/Discount/GetSortedByExpiry`
        );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Could not sort discounts."
            );
        }


        const data =
            await response.json();


        renderDiscounts(data);

    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message ||
            "Could not sort discounts.",
            "danger"
        );


        showEmptyTable(
            "Could not load discounts."
        );
    }
}



// ==========================================
// STATUS
// ==========================================

function getDiscountStatus(expiresOn) {

    if (!expiresOn)
        return "Expired";


    const expiryDate =
        new Date(expiresOn);


    const today =
        new Date();


    // Remove time from today
    today.setHours(
        0,
        0,
        0,
        0
    );


    return expiryDate >= today
        ? "Active"
        : "Expired";
}



// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(dateValue) {

    if (!dateValue)
        return "-";


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime()))
        return "-";


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}



// ==========================================
// CONVERT DATE FOR <input type="date">
// ==========================================

function toDateInputValue(dateValue) {

    if (!dateValue)
        return "";


    return String(dateValue)
        .split("T")[0];
}



// ==========================================
// LOADING TABLE
// ==========================================

function showLoading() {

    const tableBody =
        document.getElementById(
            "discountsTableBody"
        );


    tableBody.innerHTML = `

        <tr>

            <td colspan="5"
                class="text-center py-5">

                <div class="state-empty">

                    <i class="bi bi-hourglass-split"></i>

                    <div>
                        Loading discounts...
                    </div>

                </div>

            </td>

        </tr>

    `;
}



// ==========================================
// EMPTY TABLE
// ==========================================

function showEmptyTable(message) {

    const tableBody =
        document.getElementById(
            "discountsTableBody"
        );


    tableBody.innerHTML = `

        <tr>

            <td colspan="5"
                class="text-center py-5">

                <div class="state-empty">

                    <i class="bi bi-percent"></i>

                    <div>
                        ${escapeHtml(message)}
                    </div>

                </div>

            </td>

        </tr>

    `;
}



// ==========================================
// SUCCESS / ERROR MESSAGE
// ==========================================

function showMessage(
    message,
    type = "success"
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


    setTimeout(() => {

        box.classList.add(
            "d-none"
        );

    }, 4000);
}



// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}



// Used when putting the discount code
// inside onclick="..."
function escapeForJs(value) {

    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}