// document.addEventListener("DOMContentLoaded", () => {
//     const loginBtn = document.getElementById("loginBtn");
//     const registerBtn = document.getElementById("registerBtn");

//     loginBtn.addEventListener("click", async () => {
//         const email = document.getElementById("email-login").value;
//         const password = document.getElementById("password-login").value;

//         try {
//             const response = await fetch("http://api-gateway:3000/auth/login", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email, password }),
//                 credentials: 'include'
//             });

//             if (response.ok) {
//                 window.location.href = "/index.html";
//             } else {
//                 const data = await response.json();
//                 alert("Error: " + data.error);
//             }
//         } catch (error) {
//             console.error("Error en el login:", error);
//             alert("Error en el login");
//         }
//     });

//     registerBtn.addEventListener("click", async () => {
//         const nombre = document.getElementById("nombre-register").value;
//         const emailRegister = document.getElementById("email-register").value;
//         const passwordRegister = document.getElementById("password-register").value;

//         try {
//             const response = await fetch("http://api-gateway:3000/auth/register", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ nombre, email: emailRegister, password: passwordRegister }),
//                 credentials: 'include'
//             });

//             if (response.ok) {
//                 window.location.href = "/index.html";
//             } else {
//                 const data = await response.json();
//                 alert("Error: " + data.error);
//             }
//         } catch (error) {
//             console.error("Error en el registro:", error);
//             alert("Error en el registro");
//         }
//     });
// });

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("email-login").value;
        const password = document.getElementById("password-login").value;

        try {
            const response = await fetch("http://api-gateway:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = "/index.html";
            } else {
                const data = await response.json();
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error en el login:", error);
            alert("Error en el login");
        }
    });

    registerBtn.addEventListener("click", async () => {
        const nombre = document.getElementById("nombre-register").value;
        const emailRegister = document.getElementById("email-register").value;
        const passwordRegister = document.getElementById("password-register").value;

        try {
            const response = await fetch("http://api-gateway:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email: emailRegister, password: passwordRegister }),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = "/index.html";
            } else {
                const data = await response.json();
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            alert("Error en el registro");
        }
    });
});