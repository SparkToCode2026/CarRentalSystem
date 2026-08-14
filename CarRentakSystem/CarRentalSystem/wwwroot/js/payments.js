const API = "/Payments";

let payments = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPayments();
    loadAnalytics();
    loadRentals();
});


// ==========================================
// GET ALL PAYMENTS
// ==========================================

async function loadPayments() {

    try {

        const response = await fetch(`${API}/GetAllPayments`);

        if (!response.ok) {
            throw new Error("Could not load payments.");
        }

        payments = await response.json();

        displayPayments(payments);

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Failed to load payments.",
            "danger"
        );

        displayPayments([]);
    }
}


// ==========================================
// DISPLAY PAYMENTS
// ==========================================

function displayPayments(data) {

    const tbody =
        document.getElementById("paymentsTableBody");

    tbody.innerHTML = "";


    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-credit-card"></i>
                        No payments found.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(payment => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <span class="payment-id">
                    #${payment.payment_ID}
                </span>
            </td>

            <td>
                Rental #${payment.rental_ID}
            </td>

            <td class="amount">
                ${Number(payment.amount).toFixed(2)} OMR
            </td>

            <td>
                ${payment.method}
            </td>

            <td>
                ${getStatusBadge(payment.status)}
            </td>

            <td>
                ${formatDate(payment.paidAtUtc)}
            </td>

            <td class="text-end">

                <button
                    class="btn btn-sm btn-outline-secondary me-1"
                    title="Edit"
                    onclick="editPayment(${payment.payment_ID})">

                    <i class="bi bi-pencil"></i>

                </button>


                <button
                    class="btn btn-sm btn-outline-danger"
                    title="Delete"
                    onclick="deletePayment(${payment.payment_ID})">

                    <i class="bi bi-trash"></i>

                </button>

            </td>
        `;

        tbody.appendChild(row);
    });
}


// ==========================================
// ADD PAYMENT MODAL
// ==========================================

function openAddPayment() {

    document.getElementById("paymentModalTitle")
        .textContent = "Add Payment";

    document.getElementById("paymentForm")
        .reset();

    document.getElementById("paymentId")
        .value = "";

    document.getElementById("status")
        .value = "Pending";


    // Default current date/time
    const now = new Date();

    now.setMinutes(
        now.getMinutes() -
        now.getTimezoneOffset()
    );

    document.getElementById("paidAt")
        .value = now
            .toISOString()
            .slice(0, 16);
}


// ==========================================
// SAVE PAYMENT
// ADD OR UPDATE
// ==========================================

async function savePayment() {

    const form =
        document.getElementById("paymentForm");


    if (!form.checkValidity()) {

        form.reportValidity();

        return;
    }


    const paymentId =
        document.getElementById("paymentId").value;


    const payment = {

        payment_ID:
            paymentId
                ? Number(paymentId)
                : 0,

        amount:
            Number(
                document.getElementById("amount").value
            ),

        method:
            document.getElementById("method").value,

        paidAtUtc:
            new Date(
                document.getElementById("paidAt").value
            ).toISOString(),

        status:
            document.getElementById("status").value,

        rental_ID:
            Number(
                document.getElementById("rentalId").value
            )

    };


    try {

        let response;


        // UPDATE
        if (paymentId) {

            response = await fetch(
                `${API}/UpdatePayment?id=${paymentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payment)
                }
            );

        }

        // ADD
        else {

            response = await fetch(
                `${API}/AddPayment`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payment)
                }
            );
        }


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);
        }


        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById("paymentModal")
            );

        modal.hide();


        showMessage(
            paymentId
                ? "Payment updated successfully."
                : "Payment added successfully.",
            "success"
        );


        await loadPayments();

        await loadAnalytics();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message || "Could not save payment.",
            "danger"
        );
    }
}


// ==========================================
// EDIT PAYMENT
// ==========================================

async function editPayment(id) {

    try {

        const response =
            await fetch(
                `${API}/GetPaymentById?id=${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load payment."
            );
        }


        const payment =
            await response.json();


        document.getElementById(
            "paymentModalTitle"
        ).textContent = "Edit Payment";


        document.getElementById(
            "paymentId"
        ).value = payment.payment_ID;


        document.getElementById(
            "rentalId"
        ).value = payment.rental_ID;


        document.getElementById(
            "amount"
        ).value = payment.amount;


        document.getElementById(
            "method"
        ).value = payment.method;


        document.getElementById(
            "status"
        ).value = payment.status;


        document.getElementById(
            "paidAt"
        ).value =
            toDateTimeLocal(
                payment.paidAtUtc
            );


        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "paymentModal"
                )
            );


        modal.show();

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Failed to load payment.",
            "danger"
        );
    }
}


// ==========================================
// DELETE PAYMENT
// ==========================================

async function deletePayment(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this payment?"
        );


    if (!confirmed)
        return;


    try {

        const response =
            await fetch(
                `${API}/DeletePayment?id=${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);
        }


        showMessage(
            "Payment deleted successfully.",
            "success"
        );


        await loadPayments();

        await loadAnalytics();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Could not delete payment.",
            "danger"
        );
    }
}


// ==========================================
// FILTER
// ==========================================

async function filterPayments() {

    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const method =
        document.getElementById(
            "methodFilter"
        ).value;


    const params =
        new URLSearchParams();


    if (status)
        params.append(
            "status",
            status
        );


    if (method)
        params.append(
            "method",
            method
        );


    try {

        const response =
            await fetch(
                `${API}/FilterPayments?${params.toString()}`
            );


        if (!response.ok) {

            throw new Error(
                "Could not filter payments."
            );
        }


        const data =
            await response.json();


        displayPayments(data);

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Failed to filter payments.",
            "danger"
        );
    }
}


// ==========================================
// RESET FILTER
// ==========================================

function resetFilters() {

    document.getElementById(
        "statusFilter"
    ).value = "";


    document.getElementById(
        "methodFilter"
    ).value = "";


    loadPayments();
}


// ==========================================
// PAYMENT ANALYTICS
// ==========================================

async function loadAnalytics() {

    try {

        const response =
            await fetch(
                `${API}/PaymentAnalytics`
            );


        if (!response.ok)
            return;


        const data =
            await response.json();


        document.getElementById(
            "totalPayments"
        ).textContent =
            data.totalCount ?? 0;


        document.getElementById(
            "totalRevenue"
        ).textContent =
            `${Number(
                data.totalRevenue ?? 0
            ).toFixed(2)} OMR`;


        // Calculate paid payments
        const paid =
            payments.filter(
                p =>
                    p.status
                        ?.toLowerCase()
                    === "paid"
            ).length;


        document.getElementById(
            "paidPayments"
        ).textContent = paid;

    }
    catch (error) {

        console.error(
            "Analytics error:",
            error
        );
    }
}


// ==========================================
// STATUS BADGE
// ==========================================

function getStatusBadge(status) {

    const value =
        status || "Unknown";


    const normalized =
        value.toLowerCase();


    if (normalized === "paid") {

        return `
            <span class="status status-paid">
                Paid
            </span>
        `;
    }


    if (normalized === "pending") {

        return `
            <span class="status status-pending">
                Pending
            </span>
        `;
    }


    if (normalized === "failed") {

        return `
            <span class="status status-failed">
                Failed
            </span>
        `;
    }


    return `
        <span class="status">
            ${value}
        </span>
    `;
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date)
        return "—";


    return new Date(date)
        .toLocaleString();
}


function toDateTimeLocal(date) {

    if (!date)
        return "";


    const d =
        new Date(date);


    d.setMinutes(
        d.getMinutes() -
        d.getTimezoneOffset()
    );


    return d
        .toISOString()
        .slice(0, 16);
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    const message =
        document.getElementById("message");


    message.innerHTML = `

        <div class="alert alert-${type} alert-dismissible fade show">

            ${text}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>
    `;


    setTimeout(() => {

        message.innerHTML = "";

    }, 4000);
}


// load rentals
async function loadRentals() {

    const select =
        document.getElementById(
            "rentalId"
        );


    try {

        const response =
            await fetch(
                "/Rental/GetAllRentals"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load rentals."
            );
        }


        const rentals =
            await response.json();


        select.innerHTML = `
            <option value="">
                Select rental...
            </option>
        `;


        rentals.forEach(
            rental => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    rental.rental_ID;


                option.textContent =
                    `RNT-${rental.rental_ID}`;


                select.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.error(error);


        select.innerHTML = `
            <option value="">
                Could not load rentals
            </option>
        `;

    }

}