const carrito = obtenerCarrito();
cartCount.textContent = carrito.length;

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("nav-auth");
    if (!nav) return;

    const token = localStorage.getItem("token");

    if (!token) {
        // Usuario NO logueado
        nav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Iniciar sesión</a>
            </li>
            <li class="nav-item">
                <a class="btn btn-pink ms-2" href="register.html">Registrarse</a>
            </li>
        `;
    } else {
        // Usuario logueado
        nav.innerHTML = `
            <li class="nav-item">
                <button class="btn btn-outline-danger" onclick="logout()">
                    Cerrar sesión
                </button>
            </li>
        `;
    }
});
