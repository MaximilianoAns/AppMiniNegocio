const API_URL = "https://localhost:7264/api/auth";

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("error");

    errorDiv.classList.add("d-none");

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(async response => {
            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Credenciales inválidas");
            }
            return response.json();
        })
        .then(data => {
            // 🔐 NACE LA SESIÓN
            localStorage.setItem("token", data.token);

            // ✅ FLAG PARA CARTEL DE ÉXITO (una sola vez)
            sessionStorage.setItem("loginSuccess", "true");

            // 🔁 REDIRECCIÓN
            window.location.href = "perfil.html";
        })
        .catch(err => {
            errorDiv.innerText = err.message;
            errorDiv.classList.remove("d-none");
        });
}