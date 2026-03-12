// ==============================
// STORAGE DEL CARRITO
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
// AGREGAR AL CARRITO
// ==============================
window.agregarAlCarrito = function (item) {
    carrito.push(item);
    guardarCarrito(carrito);
    renderCarrito();
    actualizarContadorCarrito();
};

// ==============================
// ELIMINAR ITEM
// ==============================
window.eliminarItem = function (index) {
    carrito.splice(index, 1);
    guardarCarrito(carrito);
    renderCarrito();
    actualizarContadorCarrito();
};

// ==============================
// VACIAR CARRITO
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
            <p class="text-center" style="color:var(--text-soft);font-weight:700;">
                Tu carrito está vacío 🍬
            </p>
        `;
        return;
    }

    carrito.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'carrito-item';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 style="font-weight:800;color:var(--text);margin-bottom:.5rem;">
                        🫙 Combo ${item.combo}gr
                    </h5>
                    <ul style="margin:0;padding-left:1.25rem;color:var(--text-soft);font-size:.9rem;">
                        ${item.sabores.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                <button class="btn btn-outline-pink btn-sm" onclick="eliminarItem(${index})">
                    🗑️ Quitar
                </button>
            </div>
        `;
        contenedorCarrito.appendChild(card);
    });
}

// ==============================
// CONTADOR NAVBAR
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
    const cancelar = document.getElementById('btncancelarVaciar');
    const confirmar = document.getElementById('btnconfirmarVaciar');

    if (!btnVaciar || !modalVaciar || !cancelar || !confirmar) return;

    btnVaciar.addEventListener('click', () => modalVaciar.classList.add('activo'));
    cancelar.addEventListener('click', () => modalVaciar.classList.remove('activo'));
    confirmar.addEventListener('click', () => {
        vaciarCarrito();
        renderCarrito();
        modalVaciar.classList.remove('activo');
    });
});

// ==============================
// FINALIZAR PEDIDO
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    const btnFinalizar = document.getElementById('btnFinalizar');
    const modal = document.getElementById('modalConfirmacion');
    const btnCancelar = document.getElementById('cancelarEnvio');
    const btnConfirmar = document.getElementById('confirmarEnvio');

    if (!btnFinalizar) return;

    // Abrir modal
    btnFinalizar.addEventListener('click', () => {
        const carrito = obtenerCarrito();
        if (!carrito || carrito.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        modal.classList.add('activo');
    });

    // Cancelar
    btnCancelar.addEventListener('click', () => modal.classList.remove('activo'));

    // Confirmar pedido
    btnConfirmar.addEventListener('click', async () => {

        // Feedback visual
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = 'Enviando...';

        // 1 — Verificar login
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

        // 2 — Armar DTO con combos y gustos
        // Precios por peso (modificalos según tus precios reales)
        const precios = { 650: 2500, 350: 1500, 200: 900 };

        const ventaDto = {
            combos: carrito.map(item => ({
                peso: item.combo,                        // 650, 350 o 200
                cantidad: 1,
                precioUnitario: precios[item.combo] || 0,
                gustos: item.sabores                     // ["Ositos ácidos", "Moritas", ...]
            }))
        };

        // 3 — Registrar venta en el backend
        let ventaCreada;
        try {
            const res = await fetch("https://localhost:7264/api/Ventas/desde-carrito", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(ventaDto)
            });

            if (!res.ok) {
                const msg = await res.text();
                alert("Error al registrar la venta: " + msg);
                return;
            }

            ventaCreada = await res.json();

        } catch (error) {
            console.error(error);
            alert("No se pudo conectar con el servidor");
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = 'Sí, enviar';
            return;
        }

        // 4 — Armar mensaje WhatsApp con el detalle completo
        let mensaje = `Hola Antonella! 🍭 Quiero hacer un pedido.\n`;
        mensaje += `Pedido N° ${ventaCreada.id}\n\n`;

        carrito.forEach(item => {
            mensaje += `🫙 Combo ${item.combo}gr\n`;
            item.sabores.forEach(sabor => {
                mensaje += `   - ${sabor}\n`;
            });
            mensaje += '\n';
        });

        mensaje += `Total: $${ventaCreada.total}\nGracias! 🍬`;

        const telefonoVendedor = '5491136371515';
        const url = `https://wa.me/${telefonoVendedor}?text=${encodeURIComponent(mensaje)}`;

        // 5 — Limpiar y redirigir
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