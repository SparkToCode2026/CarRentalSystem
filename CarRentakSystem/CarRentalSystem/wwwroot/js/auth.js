// ==========================================
// LOGIN
// ==========================================

const LOGIN_URL = "/User/Login";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById("loginForm");

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                login
            );
        }
    }
);


async function login(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const message =
        document.getElementById("loginMessage");


    message.innerHTML = "";


    const loginData = {
        name: "Login User",
        email: email,
        password: password
    };


    try {

        const response = await fetch(
            LOGIN_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || "Login failed"
            );
        }


        const result =
            await response.json();


        const token = result.accessToken ?? result.AccessToken;


        if (!token) {

            throw new Error(
                "Token was not returned."
            );
        }


        // Save JWT
        localStorage.setItem(
            "jwtToken",
            token
        );
        localStorage.setItem("userRole", result.role ?? result.Role ?? "");
        localStorage.setItem("userName", result.name ?? result.Name ?? "");
        localStorage.setItem("userEmail", result.email ?? result.Email ?? email);
        localStorage.setItem("userId", String(result.userId ?? result.UserId ?? ""));

        message.innerHTML = `
            <div class="alert alert-success">
                Login successful.
            </div>
        `;


        // Go to Dashboard
        setTimeout(() => {

            window.location.href =
                "../index.html";

        }, 500);

    }
    catch (error) {

        console.error(error);


        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}

// ==========================================
// REGISTER
// ==========================================

const REGISTER_URL = "/User/Register";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const registerForm =
            document.getElementById("registerForm");

        if (registerForm) {
            registerForm.addEventListener(
                "submit",
                register
            );
        }
    }
);


async function register(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("registerName")
            .value
            .trim();


    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("registerPassword")
            .value;


    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;


    const message =
        document.getElementById("registerMessage");


    message.innerHTML = "";


    // Check passwords match
    if (password !== confirmPassword) {

        message.innerHTML = `
            <div class="alert alert-danger">
                Passwords do not match.
            </div>
        `;

        return;
    }


    const registerData = {
        name: name,
        email: email,
        password: password
    };


    try {

        const response = await fetch(
            REGISTER_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(registerData)
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || "Registration failed"
            );
        }


        const result =
            await response.json();


        message.innerHTML = `
            <div class="alert alert-success">
                Account created successfully.
                Redirecting to login...
            </div>
        `;


        document
            .getElementById("registerForm")
            .reset();


        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1200);

    }
    catch (error) {

        console.error(error);


        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}

// ==========================================
// JWT / AUTH HELPERS
// ==========================================

function getToken() {
    return localStorage.getItem("jwtToken");
}


function isLoggedIn() {
    return getToken() !== null;
}


function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href =
            "/pages/login.html";

        return false;
    }

    return true;
}


function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");

    window.location.href = "/pages/login.html";
}

function getUserRole() {
    return localStorage.getItem("userRole") || "";
}

function getUserName() {
    return localStorage.getItem("userName") || "";
}

function isAdmin() {
    return getUserRole().toLowerCase() === "admin";
}
function isStaffOrAdmin() {
    const role = getUserRole().toLowerCase();
    return role === "admin" || role === "staff";
}

function getUserInitials() {
    const name = getUserName().trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


// Use this for protected API requests
async function authorizedFetch(url, options = {}) {

    const token = getToken();

    if (!token) {

        window.location.href =
            "/pages/login.html";

        return null;
    }


    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    };


    const response =
        await fetch(url, options);


    if (response.status === 401) {
        localStorage.removeItem("jwtToken");
        window.location.href = "/pages/login.html";
        throw new Error("Session expired. Redirecting to login...");
    }

    if (response.status === 403) {
        throw new Error("You do not have permission to perform this action.");
    }


    return response;
}