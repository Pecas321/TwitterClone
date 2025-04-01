document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'http://api-gateway:3000';

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const errorElement = document.getElementById("error-message");

    function showError(message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
            setTimeout(() => errorElement.style.display = "none", 5000);
        } else {
            alert(message);
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("email-login")?.value;
            const password = document.getElementById("password-login")?.value;

            if (!email || !password) {
                showError("Por favor ingresa email y contraseña");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    console.log("Login exitoso:", data);
                    window.location.href = "/index.html";
                } else {
                    showError(data.error || "Error al iniciar sesión");
                }
            } catch (error) {
                console.error("Error en el login:", error);
                showError("Error de conexión con el servidor");
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            const nombre = document.getElementById("nombre-register")?.value;
            const email = document.getElementById("email-register")?.value;
            const password = document.getElementById("password-register")?.value;

            if (!nombre || !email || !password) {
                showError("Por favor completa todos los campos");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ nombre, email, password }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = "/index.html";
                } else {
                    showError(data.error || "Error al registrar usuario");
                }
            } catch (error) {
                console.error("Error en el registro:", error);
                showError("Error de conexión con el servidor");
            }
        });
    }
});