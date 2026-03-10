

// ==============================
// STORAGE PAGANIA DEL CARRITO CON DETALLES
// ==============================
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ==============================
// ESTADO GLOBAL
// ==============================
let carrito = obtenerCarrito();

// ==============================
// AGREGAR AL CARRITO (GLOBAL)
// ==============================
window.agregarAlCarrito = function (item) {
    carrito.push(item);
    guardarCarrito(carrito);

    renderCarrito();
    actualizarContadorCarrito();
};

// ==============================
// ELIMINAR ITEM (GLOBAL)
// ==============================
window.eliminarItem = function (index) {
    carrito.splice(index, 1);
    guardarCarrito(carrito);

    renderCarrito();
    actualizarContadorCarrito();
};

// ==============================
// VACIAR CARRITO (GLOBAL)
// ==============================
window.vaciarCarrito = function () {
    carrito = [];
    guardarCarrito(carrito);

    renderCarrito();
    actualizarContadorCarrito();
};

// ==============================
// RENDER CARRITO
// ==============================
function renderCarrito() {
    const contenedorCarrito = document.getElementById('contenedorCarrito');
    if (!contenedorCarrito) return;

    contenedorCarrito.innerHTML = '';

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <p class="text-center text-muted">
                Tu carrito está vacío 🍬
            </p>
        `;
        return;
    }

    carrito.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-2';

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Combo ${item.combo}gr</h5>
                <ul class="mb-3">
                    ${item.sabores.map(s => `<li>${s}</li>`).join('')}
                </ul>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${index})">
                    ❌ Quitar
                </button>
            </div>
        `;

        contenedorCarrito.appendChild(card);
    });
}

// ==============================
// CONTADOR DEL CARRITO
// ==============================
function actualizarContadorCarrito() {
    const contador = document.getElementById('cartCount');
    if (!contador) return;

    contador.textContent = carrito.length;

    if (carrito.length > 0) {
        contador.classList.remove('d-none');
    } else {
        contador.classList.add('d-none');
    }
}

// ==============================
// BOTÓN VACIAR CARRITO
// ==============================


document.addEventListener('DOMContentLoaded', () => {

    const btnVaciar = document.getElementById('btnVaciarCarrito');
    const modalVaciar = document.getElementById('modalVaciar');
    const cancelarVaciar = document.getElementById('btncancelarVaciar');
    const confirmarVaciar = document.getElementById('btnconfirmarVaciar');

    if (!btnVaciar || !modalVaciar || !cancelarVaciar || !confirmarVaciar) return;

    btnVaciar.addEventListener('click', () => {
        modalVaciar.classList.add('activo');
    });

    cancelarVaciar.addEventListener('click', () => {
        modalVaciar.classList.remove('activo');
    });

    confirmarVaciar.addEventListener('click', () => {
        vaciarCarrito();
        renderCarrito();
        modalVaciar.classList.remove('activo');
    });

});
// ==============================
// FINALIZAR PEDIDO (WHATSAPP)

document.addEventListener('DOMContentLoaded', () => {

    const btnFinalizar = document.getElementById('btnFinalizar');
    const modal = document.getElementById('modalConfirmacion');
    const btnCancelar = document.getElementById('cancelarEnvio');
    const btnConfirmar = document.getElementById('confirmarEnvio');

    if (!btnFinalizar) return;

    // =========================
    // ABRIR MODAL
    // =========================
    btnFinalizar.addEventListener('click', () => {

        const carrito = obtenerCarrito();

        if (!carrito || carrito.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        modal.classList.add('activo');
    });

    // =========================
    // CANCELAR
    // =========================
    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('activo');
    });

    // =========================
    // CONFIRMAR PEDIDO
    // =========================
    btnConfirmar.addEventListener('click', async () => {

        // 1️⃣ VALIDAR LOGIN
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Tenés que iniciar sesión para finalizar el pedido");
            window.location.href = "login.html";
            return;
        }

        const carrito = obtenerCarrito();

        if (!carrito || carrito.length === 0) {
            alert("El carrito está vacío");
            return;
        }

        // =========================
        // 2️⃣ ARMAR DTO PARA API
        // =========================
        // ⚠️ Esto es provisorio hasta que guardemos combos/gustos en tablas propias
        const ventaDto = {
            detalles: []
        };

        carrito.forEach(item => {
            // Si cada combo tiene productos internos
            if (item.productos && Array.isArray(item.productos)) {
                item.productos.forEach(p => {
                    ventaDto.detalles.push({
                        productoId: p.productoId,
                        cantidad: p.cantidad
                    });
                });
            }
        });

        if (ventaDto.detalles.length === 0) {
            alert("No se pudieron generar los productos de la venta");
            return;
        }

        // =========================
        // 3️⃣ CREAR VENTA EN BACKEND
        // =========================
        let ventaCreada;

        try {
            const res = await fetch("https://localhost:7264/api/ventas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(ventaDto)
            });

            if (!res.ok) {
                alert("Error al registrar la venta");
                return;
            }

            ventaCreada = await res.json();

        } catch (error) {
            console.error(error);
            alert("No se pudo conectar con el servidor");
            return;
        }

        // =========================
        // 4️⃣ ARMAR MENSAJE WHATSAPP
        // =========================
        let mensaje = `Hola Antonella! 👋\n\n`;
        mensaje += `Quiero hacer un pedido.\n`;
        mensaje += `Pedido N° ${ventaCreada.id}\n\n`;

        carrito.forEach(item => {
            mensaje += `• Combo ${item.combo}gr\n`;
            item.sabores.forEach(sabor => {
                mensaje += `   - ${sabor}\n`;
            });
            mensaje += '\n';
        });

        mensaje += 'Gracias! 😊';

        const telefonoVendedor = '5491136371515';
        const url = `https://wa.me/${telefonoVendedor}?text=${encodeURIComponent(mensaje)}`;

        // =========================
        // 5️⃣ LIMPIEZA Y REDIRECCIÓN
        // =========================
        localStorage.setItem("pedidoEnviado", "true");
        vaciarCarrito();

        modal.classList.remove('activo');

        window.open(url, '_blank');
        window.location.href = "catalogoProductos.html";
    });

});

// ==============================
// INIT
// ==============================
renderCarrito();
actualizarContadorCarrito();
