document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("nav-auth");
    if (!nav) return;

    const token = localStorage.getItem("token");

    if (!token) {
        nav.innerHTML = `
            <a class="nav-link" href="login.html">Iniciar sesion</a>
            <a class="btn btn-pink ms-2" href="register.html">Registrarse</a>
        `;
    } else {
        nav.innerHTML = `
            <li class="nav-item d-flex align-items-center">
                <a href="perfil.html"
                   class="nav-link d-flex align-items-center"
                   title="Mi perfil">
                    <i class="bi bi-person-circle fs-4"></i>
                </a>
            </li>
            <li class="nav-item d-flex align-items-center ms-2">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="logout()">
                    Cerrar sesión
                </button>
            </li>
        `;
    }
});

window.logout = function () {
    localStorage.removeItem("token");
    sessionStorage.removeItem("loginSuccess");
    window.location.href = "login.html";
};
