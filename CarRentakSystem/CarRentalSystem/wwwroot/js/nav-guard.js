document.addEventListener("DOMContentLoaded", function () {
    const publicPages = ["login.html", "register.html"];
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    if (publicPages.includes(currentFile)) return;

    if (typeof requireLogin === "function") {
        const ok = requireLogin();
        if (!ok) return;
    }

    setupAccountMenu();
    applyRoleBasedNav(currentFile);
    hideStaffOnlyControls();
});

function setupAccountMenu() {
    const avatar = document.querySelector(".topbar .avatar");
    if (!avatar) return;

    let dropdownWrapper = avatar.closest(".dropdown");

    if (!dropdownWrapper) {
        dropdownWrapper = document.createElement("div");
        dropdownWrapper.className = "dropdown";
        avatar.parentNode.insertBefore(dropdownWrapper, avatar);
        dropdownWrapper.appendChild(avatar);
        avatar.setAttribute("role", "button");
        avatar.setAttribute("data-bs-toggle", "dropdown");

        const menu = document.createElement("ul");
        menu.className = "dropdown-menu dropdown-menu-end";
        menu.innerHTML = `
            <li><span class="dropdown-item-text small text-muted" id="navUserLabel">RoadKey Account</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="navLogoutBtn">
                <i class="bi bi-box-arrow-right me-2"></i>Log out</a></li>
        `;
        dropdownWrapper.appendChild(menu);
    }

    const name = (typeof getUserName === "function") ? getUserName() : "";
    const role = (typeof getUserRole === "function") ? getUserRole() : "";
    avatar.textContent = (typeof getUserInitials === "function") ? getUserInitials() : "U";

    let label = dropdownWrapper.querySelector("#navUserLabel") || dropdownWrapper.querySelector(".dropdown-item-text");
    if (label && name) label.textContent = role ? `${name} · ${role}` : name;

    const logoutBtn = dropdownWrapper.querySelector("#navLogoutBtn") || dropdownWrapper.querySelector(".dropdown-item.text-danger");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            logout();
        });
    }
}

// Define which pages require Staff or Admin privileges
const STAFF_PAGES = [
    "maintenance.html",
    "damage-reports.html",
    "payments.html",
    "categories.html",
    "branches.html",
    "discounts.html",
    "insurance.html",
    "driver-profiles.html"
];

function applyRoleBasedNav(currentFile) {
    const admin = (typeof isAdmin === "function") ? isAdmin() : false;
    const staffOrAdmin = (typeof isStaffOrAdmin === "function") ? isStaffOrAdmin() : false;

    document.querySelectorAll(".side-link, a.side-link").forEach(function (link) {
        const href = link.getAttribute("href") || "";
        const onclick = link.getAttribute("onclick") || "";
        const text = link.textContent.trim().toLowerCase();

        // 1. Hide Users link for non-admins
        const isUsersLink = href.toLowerCase().includes("users.html") ||
            onclick.toLowerCase().includes("users.html") || text === "users";
        if (isUsersLink && !admin) link.style.display = "none";

        // 2. Hide all Staff pages for non-staff/non-admins
        if (STAFF_PAGES.some(p => href.toLowerCase().includes(p)) && !staffOrAdmin) {
            link.style.display = "none";
        }
    });

    // 3. Block direct URL access for Users page
    if (currentFile.toLowerCase() === "users.html" && !admin) {
        alert("You do not have permission to view this page.");
        window.location.href = "../index.html";
    }

    // 4. Block direct URL access for all Staff pages
    if (STAFF_PAGES.some(p => currentFile.toLowerCase().includes(p)) && !staffOrAdmin) {
        alert("You do not have permission to view this page.");
        window.location.href = "../index.html";
    }
}

function hideStaffOnlyControls() {
    const allowed = (typeof isStaffOrAdmin === "function") ? isStaffOrAdmin() : false;
    if (allowed) return;

    // Hide anything marked staff/admin-only
    document.querySelectorAll('[data-role="staff"]').forEach(function (el) {
        el.style.display = "none";
    });

    // Hide Row action buttons (edit/delete) in tables
    document.querySelectorAll('.row-actions').forEach(function (el) {
        el.style.display = "none";
    });

    // NEW: Hide "Actions" column headers globally
    document.querySelectorAll('th').forEach(function (th) {
        if (th.textContent.trim().toLowerCase() === "actions") {
            th.style.display = "none";
        }
    });
}
