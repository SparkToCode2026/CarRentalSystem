const API_BASE = "http://localhost:5092";

let reviews = [];
let reviewModal;

// ===============================
// LOAD PAGE
// ===============================
document.addEventListener("DOMContentLoaded", function () {

    reviewModal =
        new bootstrap.Modal(
            document.getElementById("reviewModal")
        );

    loadReviews();

});

// ===============================
// GET ALL REVIEWS
// ===============================
async function loadReviews() {

    try {

        const response = await fetch(
            `${API_BASE}/Review/GetALLReviews`
        );

        if (!response.ok) {
            throw new Error("Failed to load reviews.");
        }

        reviews = await response.json();

        displayReviews(reviews);

    }

    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

        console.error(error);

    }

}

// ===============================
// DISPLAY REVIEWS
// ===============================
function displayReviews(records) {

    const tbody =
        document.getElementById("reviewsTableBody");

    const count =
        document.getElementById("recordCount");

    count.textContent =
        `${records.length} record${records.length === 1 ? "" : "s"}`;

    if (records.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="state-empty">
                        <i class="bi bi-inbox"></i>
                        <div>No reviews found</div>
                    </div>
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML = records.map(r => `

        <tr>

            <td>${r.review_ID}</td>

            <td>
                ${formatDate(r.reviewDate)}
            </td>

            <td>
                ${r.carid}
            </td>

            <td>
                ${r.userid}
            </td>

            <td>
                ${getRatingBadge(r.rating)}
            </td>

            <td>
                ${escapeHtml(r.comment)}
            </td>

            <td>

                <div class="btn-group btn-group-sm">

                    <button class="btn btn-outline-primary"
                            onclick="editReview(${r.review_ID})">

                        <i class="bi bi-pencil"></i>

                    </button>

                    <button class="btn btn-outline-danger"
                            onclick="deleteReview(${r.review_ID})">

                        <i class="bi bi-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `).join("");

}

// ===============================
// ADD REVIEW
// ===============================
function openAddModal() {

    document.getElementById("reviewForm").reset();

    document.getElementById("reviewId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Review";

}

// ===============================
// EDIT REVIEW
// ===============================
async function editReview(id) {

    try {

        const response = await fetch(
            `${API_BASE}/Review/GetReview?id=${id}`
        );

        if (!response.ok) {
            throw new Error("Review not found.");
        }

        const review =
            await response.json();

        document.getElementById("reviewId").value =
            review.review_ID;

        document.getElementById("reviewDate").value =
            review.reviewDate.substring(0, 10);

        document.getElementById("comment").value =
            review.comment;

        document.getElementById("rating").value =
            review.rating;

        document.getElementById("carId").value =
            review.carid;

        document.getElementById("userId").value =
            review.userid;

        document.getElementById("modalTitle").textContent =
            "Edit Review";

        reviewModal.show();

    }

    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}

// ===============================
// SAVE REVIEW
// ===============================
async function saveReview() {

    const form =
        document.getElementById("reviewForm");

    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }

    const id =
        document.getElementById("reviewId").value;

    const review = {

        reviewDate:
        document.getElementById("reviewDate").value,

        comment:
            document.getElementById("comment").value.trim(),

        rating:
            Number(
                document.getElementById("rating").value
            ),

        carid:
            Number(
                document.getElementById("carId").value
            ),

        userid:
            Number(
                document.getElementById("userId").value
            )

    };

    try {

        let url;
        let method;

        if (id) {

            url =
                `${API_BASE}/Review/UpdateReview?id=${id}`;

            method = "PUT";

        }

        else {

            url =
                `${API_BASE}/Review/AddReview`;

            method = "POST";

        }

        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(review)

        });

        if (!response.ok) {

            throw new Error(
                id
                    ? "Failed to update review."
                    : "Failed to add review."
            );

        }

        reviewModal.hide();

        showMessage(

            id
                ? "Review updated successfully."
                : "Review added successfully.",

            "success"

        );

        await loadReviews();

    }

    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}

// ===============================
// DELETE REVIEW
// ===============================
async function deleteReview(id) {

    if (!confirm(
        "Are you sure you want to delete this review?"
    )) {

        return;

    }

    try {

        const response = await fetch(

            `${API_BASE}/Review/RemoveReview?id=${id}`,

            {
                method: "DELETE"
            }

        );

        if (!response.ok) {
            throw new Error("Failed to delete review.");
        }

        showMessage(
            "Review deleted successfully.",
            "success"
        );

        await loadReviews();

    }

    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}

// ===============================
// FILTER
// ===============================
async function filterReviews() {

    const rating =
        document.getElementById("ratingFilter").value;

    if (!rating) {

        await loadReviews();

        return;

    }

    try {

        const response = await fetch(

            `${API_BASE}/Review/GetByRating?rating=${rating}`

        );

        if (!response.ok) {
            throw new Error("Failed to filter reviews.");
        }

        const data =
            await response.json();

        reviews = data;

        displayReviews(data);

    }

    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}

// ===============================
// SORT
// ===============================
async function sortReviews() {

    try {

        const response = await fetch(

            `${API_BASE}/Review/GetSortedByRating`

        );

        if (!response.ok) {
            throw new Error("Failed to sort reviews.");
        }

        const data =
            await response.json();

        reviews = data;

        displayReviews(data);

    }

    catch (error) {

        showMessage(
            error.message,
            "danger"
        );

    }

}

// ===============================
// SEARCH
// ===============================
document.getElementById("searchInput")
    .addEventListener("input", function () {

        const search =
            this.value.toLowerCase();

        if (!search) {

            displayReviews(reviews);

            return;

        }

        const filtered = reviews.filter(r =>

            String(r.review_ID)
                .includes(search)

            ||

            String(r.comment)
                .toLowerCase()
                .includes(search)

            ||

            String(r.carid)
                .includes(search)

            ||

            String(r.userid)
                .includes(search)

        );

        displayReviews(filtered);

    });

// ===============================
// RATING BADGE
// ===============================
function getRatingBadge(rating) {

    return `
        <span class="badge text-bg-primary">
            ${rating} ★
        </span>
    `;

}

// ===============================
// DATE FORMAT
// ===============================
function formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date)
        .toLocaleDateString();

}

// ===============================
// MESSAGE
// ===============================
function showMessage(message, type) {

    const container =
        document.getElementById("messageContainer");

    container.innerHTML = `

        <div class="alert alert-${type}
                    alert-dismissible
                    fade show">

            ${escapeHtml(message)}

            <button class="btn-close"
                    data-bs-dismiss="alert">
            </button>

        </div>

    `;

}

// ===============================
// HTML SAFETY
// ===============================
function escapeHtml(value) {

    if (!value) {
        return "";
    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}