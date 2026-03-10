document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    authFetch("/api/usuario/perfil")
        .then((response) => {
            if (response.status === 401) {
                logout();
                return null;
            }

            if (!response.ok) {
                throw new Error("No se pudo cargar el perfil");
            }

            return response.json();
        })
        .then((data) => {
            if (!data) return;

            document.getElementById("perfil-nombre").innerText = data.nombre || "Usuario";
            document.getElementById("perfil-email").innerText = data.email || "";
            document.getElementById("perfil-nombre-2").innerText = data.nombre || "Usuario";
            document.getElementById("perfil-email-2").innerText = data.email || "";
        })
        .catch((error) => {
            console.error(error);
        });

    const btnCerrarSesion = document.getElementById("btnCerrarSession");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", logout);
    }
});
