// ==============================
// catalogoProductos.js
// ==============================

// Elementos principales
const modalCombo = document.getElementById('modalCombo');
const btnAgregarCarrito = document.getElementById('btnAgregarCarrito');
const errorGustos = document.getElementById('errorGustos');

// Ejecutar solo si estamos en la página correcta
if (modalCombo && btnAgregarCarrito && errorGustos) {

    let comboSeleccionado = null;

    // ==============================
    // CUANDO SE ABRE EL MODAL
    // ==============================
    console.log("abrirCarrito:", abrirCarrito);

    modalCombo.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        comboSeleccionado = button.dataset.combo;

        const comboPeso = modalCombo.querySelector('#comboPeso');
        if (comboPeso) {
            comboPeso.textContent = comboSeleccionado;
        }

        // Limpiar checkboxes
        modalCombo.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Ocultar error
        errorGustos.classList.add('d-none');
    });

    // ==============================
    // BOTÓN AGREGAR AL CARRITO
    // ==============================
    btnAgregarCarrito.addEventListener('click', () => {
        const saboresSeleccionados = [];

        modalCombo
            .querySelectorAll('input[type="checkbox"]:checked')
            .forEach(cb => {
                saboresSeleccionados.push(
                    cb.nextElementSibling.textContent.trim()
                );
            });

        const minimo = minimoGustosPorCombo(comboSeleccionado);

        if (saboresSeleccionados.length < minimo) {
            errorGustos.textContent = `⚠️ Tenés que elegir mínimo ${minimo} gustos`;
            errorGustos.classList.remove('d-none');
            return;
        }

        if (typeof agregarAlCarrito === 'function') {
            agregarAlCarrito({
                combo: comboSeleccionado,
                sabores: saboresSeleccionados
            });
        }

        const modal = bootstrap.Modal.getInstance(modalCombo);
        if (modal) modal.hide();

        if (typeof abrirCarrito === 'function') {
            abrirCarrito();
        }
    });

    // ==============================
    // OCULTAR ERROR AL CAMBIAR CHECK
    // ==============================
    modalCombo.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            errorGustos.classList.add('d-none');
        });
    });

    // ==============================
    // LIMPIEZA AL CERRAR MODAL
    // ==============================
    modalCombo.addEventListener('hidden.bs.modal', () => {
        errorGustos.classList.add('d-none');

        modalCombo
            .querySelectorAll('input[type="checkbox"]')
            .forEach(cb => cb.checked = false);
    });

    // ==============================
    // ANTI CACHE (VOLVER ATRÁS)
    // ==============================
    window.addEventListener('pageshow', () => {
        modalCombo
            .querySelectorAll('input[type="checkbox"]')
            .forEach(cb => cb.checked = false);
    });
}


// FUNCIONES CONDICIONES GUSTOS

function minimoGustosPorCombo(combo) {
    if (combo === '650') return 6;
    if (combo === '350') return 3;
    return 2;
}

// FUNCION PARA CARTEL DE ENVIO CON EXITO
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("pedidoEnviado") === "true") {

        alert("✅ Pedido enviado con éxito");

        localStorage.removeItem("pedidoEnviado");
    }
});

