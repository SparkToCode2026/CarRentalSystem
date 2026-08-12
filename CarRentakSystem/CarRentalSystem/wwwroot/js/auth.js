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


        const token =
            result.token ?? result.Token;


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