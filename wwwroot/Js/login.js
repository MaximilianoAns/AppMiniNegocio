const API_URL = "https://localhost:7264/api/auth";

// ── Mensaje del guard si fue redirigido ──────────────
document.addEventListener('DOMContentLoaded', function mostrarMensajeGuard() {
    const motivo = sessionStorage.getItem('guardRedirect');
    if (!motivo) return;

    sessionStorage.removeItem('guardRedirect');

    const mensajes = {
        'sin-sesion': '🔒 Tenés que iniciar sesión para acceder al panel.',
        'token-expirado': '⏱️ Tu sesión expiró. Por favor volvé a ingresar.',
        'token-invalido': '⚠️ Sesión inválida. Por favor volvé a ingresar.',
    };

    const texto = mensajes[motivo] || '🔒 Acceso restringido. Iniciá sesión primero.';
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = texto;
        errorDiv.classList.remove('d-none');
    }
});

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
            //  NACE LA SESIÓN
            localStorage.setItem("token", data.token);

            // FLAG PARA CARTEL DE ÉXITO (una sola vez)
            sessionStorage.setItem("loginSuccess", "true");

            // REDIRECCIÓN SEGÚN ROL
            const rol = obtenerRolDelToken(data.token);
            if (rol === "Admin") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        })
        .catch(err => {
            errorDiv.innerText = err.message;
            errorDiv.classList.remove("d-none");
        });
}
// ── Decodificar rol del token JWT ────────────────────
function obtenerRolDelToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            || decoded["role"]
            || decoded["Role"]
            || null;
    } catch {
        return null;
    }
}
