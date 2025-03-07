document.addEventListener("DOMContentLoaded", function () {
    const signInButton = document.getElementById("signInButton");
    if (signInButton) {
        signInButton.addEventListener("click", async function () {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const role = document.querySelector('input[name="role"]:checked').id;

            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            try {
                const response = await fetch("/api/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role })
                });

                const data = await response.json();
                if (response.ok) {
                    console.log("Login successful");
                    if (role === "volunteer") {
                        window.location.href = "/volunteerdashboard.html";
                    } else {
                        window.location.href = "/admindashboard.html";
                    }
                } else {
                    alert(data.message || "Login failed. Please check your credentials.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        });
    }

    const signUpButton = document.getElementById("signUpButton");
    if (signUpButton) {
        signUpButton.addEventListener("click", async function () {
            const first = document.getElementById("first-name").value;
            const last = document.getElementById("last-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
            const confirmPass = document.getElementById("confirm-password").value;
            const role = document.getElementById("role").value;
            console.log("Role:", role);

            if (!email || !password || !first || !last || !role || password !== confirmPass) {
                alert("Please enter all fields correctly.");
                return;
            }

            try {
                const response = await fetch("/api/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, first, last, role })
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.href = "/signin";
                } else {
                    alert(data.message || "Signup failed. Please check your information.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        });
    }
});
