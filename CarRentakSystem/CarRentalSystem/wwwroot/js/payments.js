const PAYMENT_API = "/Payments";
const RENTAL_API = "/Rental";

let payments = [];
let deletePaymentId = null;


// ==============================
// START PAGE
// ==============================

document.addEventListener("DOMContentLoaded", async () => {

    await loadRentals();
    await loadPayments();
    await loadAnalytics();

    document
        .getElementById("paymentForm")
        .addEventListener(
            "submit",
            savePayment
        );


    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            filterPayments
        );


    document
        .getElementById("methodFilter")
        .addEventListener(
            "change",
            filterPayments
        );


    document
        .getElementById(
            "confirmDeletePaymentBtn"
        )
        .addEventListener(
            "click",
            deletePayment
        );

});


// ==============================
// LOAD RENTALS
// ==============================

async function loadRentals() {

    const select =
        document.getElementById("rentalId");

    try {

        const response =
            await fetch(
                `${RENTAL_API}/GetAllRentals`
            );


        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Rental error:",
                error
            );

            throw new Error(
                "Failed to load rentals"
            );
        }


        const rentals =
            await response.json();


        select.innerHTML = `
            <option value="">
                Select rental...
            </option>
        `;


        rentals.forEach(rental => {

            const id =
                rental.rental_ID ??
                rental.Rental_ID;


            const option =
                document.createElement(
                    "option"
                );


            option.value = id;


            option.textContent =
                `Rental #${id}`;


            select.appendChild(option);

        });

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


// ==============================
// LOAD ALL PAYMENTS
// ==============================

async function loadPayments() {

    try {

        const response =
            await fetch(
                `${PAYMENT_API}/GetAllPayments`
            );


        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Payment error:",
                error
            );

            throw new Error(
                "Failed to load payments"
            );
        }


        payments =
            await response.json();


        renderPayments(payments);


        document.getElementById(
            "recordCount"
        ).textContent =
            `${payments.length} payments`;

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Failed to load payments.",
            "danger"
        );

    }

}


// ==============================
// RENDER PAYMENTS
// ==============================

function renderPayments(data) {

    const body =
        document.getElementById(
            "paymentsTableBody"
        );


    body.innerHTML = "";


    if (!data || data.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center py-5">

                    No payments found.

                </td>
            </tr>
        `;

        return;
    }


    data.forEach(payment => {

        const paymentId =
            payment.payment_ID ??
            payment.Payment_ID;


        const rentalId =
            payment.rental_ID ??
            payment.Rental_ID;


        const amount =
            payment.amount ??
            payment.Amount;


        const method =
            payment.method ??
            payment.Method;


        const status =
            payment.status ??
            payment.Status;


        const paidAt =
            payment.paidAtUtc ??
            payment.PaidAtUtc;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                #${paymentId}
            </td>

            <td>
                Rental #${rentalId}
            </td>

            <td>
                OMR ${Number(amount).toFixed(2)}
            </td>

            <td>
                ${escapeHtml(method)}
            </td>

            <td>
                ${formatDate(paidAt)}
            </td>

            <td>
                <span class="badge text-bg-light">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>

                <button
                    class="btn btn-sm btn-outline-secondary"
                    onclick="openEditPaymentModal(${paymentId})">

                    <i class="bi bi-pencil"></i>

                </button>


                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="openDeletePaymentModal(${paymentId})">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        `;


        body.appendChild(row);

    });

}


// ==============================
// OPEN ADD MODAL
// ==============================

function openAddPaymentModal() {

    document
        .getElementById("paymentForm")
        .reset();


    document.getElementById(
        "paymentId"
    ).value = "";


    document.getElementById(
        "paymentModalTitle"
    ).textContent =
        "Add Payment";


    document.getElementById(
        "paymentStatus"
    ).value =
        "Pending";


    const now =
        new Date();


    now.setMinutes(
        now.getMinutes() -
        now.getTimezoneOffset()
    );


    document.getElementById(
        "paidAtUtc"
    ).value =
        now.toISOString().slice(0, 16);


    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById(
                "paymentModal"
            )
        )
        .show();

}


// ==============================
// OPEN EDIT MODAL
// ==============================

function openEditPaymentModal(id) {

    const payment =
        payments.find(p =>
            (p.payment_ID ??
                p.Payment_ID) === id
        );


    if (!payment) {

        showMessage(
            "Payment not found.",
            "danger"
        );

        return;
    }


    document.getElementById(
        "paymentId"
    ).value = id;


    document.getElementById(
        "rentalId"
    ).value =
        payment.rental_ID ??
        payment.Rental_ID;


    document.getElementById(
        "paymentAmount"
    ).value =
        payment.amount ??
        payment.Amount;


    document.getElementById(
        "paymentMethod"
    ).value =
        payment.method ??
        payment.Method;


    document.getElementById(
        "paymentStatus"
    ).value =
        payment.status ??
        payment.Status;


    const paidAt =
        payment.paidAtUtc ??
        payment.PaidAtUtc;


    if (paidAt) {

        const date =
            new Date(paidAt);


        date.setMinutes(
            date.getMinutes() -
            date.getTimezoneOffset()
        );


        document.getElementById(
            "paidAtUtc"
        ).value =
            date.toISOString()
                .slice(0, 16);

    }


    document.getElementById(
        "paymentModalTitle"
    ).textContent =
        "Edit Payment";


    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById(
                "paymentModal"
            )
        )
        .show();

}


// ==============================
// SAVE PAYMENT
// ==============================

async function savePayment(event) {

    event.preventDefault();


    const paymentId =
        document.getElementById(
            "paymentId"
        ).value;


    const rentalId =
        Number(
            document.getElementById(
                "rentalId"
            ).value
        );


    if (!rentalId) {

        showMessage(
            "Please select a rental.",
            "danger"
        );

        return;
    }


    const payment = {

        amount:
            Number(
                document.getElementById(
                    "paymentAmount"
                ).value
            ),

        method:
            document.getElementById(
                "paymentMethod"
            ).value,

        paidAtUtc:
            new Date(
                document.getElementById(
                    "paidAtUtc"
                ).value
            ).toISOString(),

        status:
            document.getElementById(
                "paymentStatus"
            ).value,

        rental_ID:
            rentalId
    };


    try {

        let url;
        let method;


        if (paymentId) {

            url =
                `${PAYMENT_API}/UpdatePayment?id=${paymentId}`;

            method = "PUT";

        }
        else {

            url =
                `${PAYMENT_API}/AddPayment`;

            method = "POST";

        }


        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payment)
                }
            );


        if (!response.ok) {

            const error =
                await response.text();


            throw new Error(
                error ||
                "Failed to save payment."
            );
        }


        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "paymentModal"
                )
            )
            ?.hide();


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
            error.message,
            "danger"
        );

    }

}


// ==============================
// FILTER
// ==============================

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
                `${PAYMENT_API}/FilterPayments?${params}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to filter payments."
            );
        }


        const data =
            await response.json();


        renderPayments(data);


        document.getElementById(
            "recordCount"
        ).textContent =
            `${data.length} payments`;

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Failed to filter payments.",
            "danger"
        );

    }

}


// ==============================
// DELETE MODAL
// ==============================

function openDeletePaymentModal(id) {

    deletePaymentId = id;


    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById(
                "deletePaymentModal"
            )
        )
        .show();

}


// ==============================
// DELETE PAYMENT
// ==============================

async function deletePayment() {

    if (!deletePaymentId)
        return;


    try {

        const response =
            await fetch(
                `${PAYMENT_API}/DeletePayment?id=${deletePaymentId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(
                error ||
                "Failed to delete payment."
            );
        }


        bootstrap.Modal
            .getInstance(
                document.getElementById(
                    "deletePaymentModal"
                )
            )
            ?.hide();


        showMessage(
            "Payment deleted successfully.",
            "success"
        );


        deletePaymentId = null;


        await loadPayments();
        await loadAnalytics();

    }
    catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "danger"
        );

    }

}


// ==============================
// ANALYTICS
// ==============================

async function loadAnalytics() {

    try {

        const response =
            await fetch(
                `${PAYMENT_API}/PaymentAnalytics`
            );


        if (!response.ok)
            return;


        const data =
            await response.json();


        const count =
            data.totalCount ??
            data.TotalCount ??
            0;


        const revenue =
            data.totalRevenue ??
            data.TotalRevenue ??
            0;


        document.getElementById(
            "totalPayments"
        ).textContent =
            count;


        document.getElementById(
            "totalRevenue"
        ).textContent =
            `OMR ${Number(revenue).toFixed(2)}`;

    }
    catch (error) {

        console.error(
            "Analytics error:",
            error
        );

    }

}


// ==============================
// MESSAGE
// ==============================

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


    setTimeout(() => {

        box.classList.add(
            "d-none"
        );

    }, 5000);

}


// ==============================
// FORMAT DATE
// ==============================

function formatDate(value) {

    if (!value)
        return "—";


    const date =
        new Date(value);


    if (isNaN(date.getTime()))
        return "—";


    return date.toLocaleString();

}


// ==============================
// SAFE TEXT
// ==============================

function escapeHtml(value) {

    if (value == null)
        return "—";


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}