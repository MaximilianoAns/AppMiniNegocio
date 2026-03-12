document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("nav-auth");
    if (!nav) return;

    const token = localStorage.getItem("token");

    if (!token) {
        nav.innerHTML = `
            <a class="nav-link" href="login.html">Iniciar sesión</a>
            <a class="btn btn-pink ms-2" href="register.html">Registrarse</a>
        `;
        return;
    }

    const rol = obtenerRolDelToken(token);
    const esAdmin = rol === "Admin";

    nav.innerHTML = `
        <li class="nav-item dropdown">
            <a href="#"
               class="nav-link dropdown-toggle d-flex align-items-center gap-2"
               id="perfilDropdown"
               data-bs-toggle="dropdown"
               aria-expanded="false"
               style="text-decoration:none;">
                <div style="
                    width:34px;height:34px;
                    border-radius:50%;
                    background:linear-gradient(135deg,#f72585,#7209b7);
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:.85rem;font-weight:800;
                    box-shadow:0 3px 10px rgba(247,37,133,.35);
                    flex-shrink:0;
                ">👤</div>
                <span class="d-none d-lg-inline" style="font-weight:700;font-size:.9rem;color:#2d1b4e;">
                    Mi cuenta
                </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown"
                style="
                    border-radius:14px;
                    border:1.5px solid rgba(247,37,133,.12);
                    box-shadow:0 8px 30px rgba(114,9,183,.15);
                    padding:.5rem;
                    min-width:190px;
                    margin-top:.5rem;
                ">

                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" href="perfil.html"
                       style="border-radius:10px;font-weight:700;padding:.6rem .85rem;color:#2d1b4e;">
                        👤 Mi perfil
                    </a>
                </li>

                ${esAdmin ? `
                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" href="dashboard.html"
                       style="border-radius:10px;font-weight:700;padding:.6rem .85rem;color:#7209b7;">
                        🛠️ Panel Admin
                    </a>
                </li>
                ` : ''}

                <li><hr class="dropdown-divider" style="border-color:rgba(247,37,133,.12);margin:.35rem .5rem;"></li>

                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" href="#" onclick="logout()"
                       style="border-radius:10px;font-weight:700;padding:.6rem .85rem;color:#f72585;">
                        🚪 Cerrar sesión
                    </a>
                </li>
            </ul>
        </li>
    `;
});

function obtenerRolDelToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
            || decoded["role"]
            || decoded["Role"]
            || null;
    } catch (e) {
        return null;
    }
}

window.logout = function () {
    localStorage.removeItem("token");
    sessionStorage.removeItem("loginSuccess");
    window.location.href = "login.html";
};;