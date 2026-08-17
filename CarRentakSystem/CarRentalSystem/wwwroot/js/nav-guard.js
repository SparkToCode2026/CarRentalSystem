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

function applyRoleBasedNav(currentFile) {
    const admin = (typeof isAdmin === "function") ? isAdmin() : false;
    const staffOrAdmin = (typeof isStaffOrAdmin === "function") ? isStaffOrAdmin() : false;

    // Pages that only an Admin account may see.
    const adminOnlyPages = ["users.html"];

    // Back-office pages that Staff and Admin may see, but a Customer may not
    // (operational/internal data, not something a customer self-serves).
    const staffOnlyPages = [
        "maintenance.html",
        "damage-reports.html",
        "insurance.html",
        "discounts.html"
    ];

    document.querySelectorAll(".side-link, a.side-link").forEach(function (link) {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const onclick = (link.getAttribute("onclick") || "").toLowerCase();
        const matchesPage = function (page) {
            return href.includes(page) || onclick.includes(page);
        };

        const isAdminOnlyLink = adminOnlyPages.some(matchesPage);
        const isStaffOnlyLink = staffOnlyPages.some(matchesPage);

        if (isAdminOnlyLink && !admin) link.style.display = "none";
        if (isStaffOnlyLink && !staffOrAdmin) link.style.display = "none";
    });

    const lowerFile = currentFile.toLowerCase();

    if (adminOnlyPages.includes(lowerFile) && !admin) {
        alert("You do not have permission to view this page.");
        window.location.href = "../index.html";
        return;
    }

    if (staffOnlyPages.includes(lowerFile) && !staffOrAdmin) {
        alert("You do not have permission to view this page.");
        window.location.href = "../index.html";
        return;
    }
}
function hideStaffOnlyControls() {
    const isAdminUser = (typeof isAdmin === "function") ? isAdmin() : false;
    const allowed = (typeof isStaffOrAdmin === "function") ? isStaffOrAdmin() : false;

    applyVisibilityRules(document, allowed, isAdminUser);

    // Tables are populated asynchronously after this first pass runs, so keep
    // watching for new rows/cells and hide restricted ones as they appear.
    if (!window.__staffOnlyObserverStarted) {
        window.__staffOnlyObserverStarted = true;

        const observer = new MutationObserver(function (mutations) {
            const stillAdmin = (typeof isAdmin === "function") ? isAdmin() : false;
            const stillAllowed = (typeof isStaffOrAdmin === "function") ? isStaffOrAdmin() : false;

            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    applyVisibilityRules(node, stillAllowed, stillAdmin, true);
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// Applies both permission tiers to `root` (a document or a newly-added node):
//   data-role="staff" -> visible to Staff and Admin, hidden from Customer
//   data-role="admin" -> visible to Admin only, hidden from Customer AND Staff
//   .row-actions      -> legacy wrapper, treated like data-role="staff"
function applyVisibilityRules(root, staffOrAdminAllowed, adminAllowed, includeSelf) {
    const hide = function (el) { el.style.display = "none"; };

    const staffOnlySelector = '[data-role="staff"]';
    const adminOnlySelector = '[data-role="admin"]';
    const rowActionsSelector = '.row-actions';

    if (!staffOrAdminAllowed) {
        if (includeSelf && root.matches) {
            if (root.matches(staffOnlySelector)) hide(root);
            if (root.matches(rowActionsSelector)) hide(root);
        }
        if (root.querySelectorAll) {
            root.querySelectorAll(staffOnlySelector).forEach(hide);
            root.querySelectorAll(rowActionsSelector).forEach(hide);
        }
    }

    if (!adminAllowed) {
        if (includeSelf && root.matches && root.matches(adminOnlySelector)) hide(root);
        if (root.querySelectorAll) {
            root.querySelectorAll(adminOnlySelector).forEach(hide);
        }
    }
}