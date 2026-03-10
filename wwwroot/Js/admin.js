function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;


    // funcion para inicio de sesion basico
    if (user === "admin" && pass === "1234") {
        window.location.href = "dashboard.html";
    } else {
        alert("Credenciales incorrectas");
    }
}
// funcion para poner cartelitos en el puntero ante una accion
function activarTooltips() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    tooltipTriggerList.forEach(el => {
        new bootstrap.Tooltip(el);
    });
}

// funcion para mostrar errores
function mostrarError(msg) {
    const error = document.getElementById("errorMsg");
    error.textContent = msg;
    error.classList.remove("d-none");
}

function limpiarError() {
    document.getElementById("errorMsg").classList.add("d-none");
}


