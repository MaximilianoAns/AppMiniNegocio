const API_URL = "https://localhost:7264/api/auth";

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("error");
    const okDiv = document.getElementById("ok");

    errorDiv.classList.add("d-none");
    okDiv.classList.add("d-none");

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        const errors = await res.json();
        errorDiv.textContent = errors[0]?.description || "Error al registrarse";
        errorDiv.classList.remove("d-none");
        return;
    }

    okDiv.textContent = "Usuario creado correctamente. Ahora podés iniciar sesión.";
    okDiv.classList.remove("d-none");
    window.location.href = "login.html";
}