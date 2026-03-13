
/*const contenedorCarrito = document.getElementById('contenedorCarrito');
const btnVaciar = document.getElementById('btnVaciar');
const btnFinalizar = document.getElementById('btnFinalizar');

function renderCarrito() {
    const carrito = obtenerCarrito();
    contenedorCarrito.innerHTML = '';

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="alert alert-info text-center">
                Tu carrito está vacío 🍬
            </div>`;
        return;
    }

    carrito.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm';

        card.innerHTML = `
            <div class="card-body">
                <h5>Combo ${item.combo}gr</h5>
                <ul>
                    ${item.sabores.map(s => `<li>${s}</li>`).join('')}
                </ul>
                <button class="btn btn-sm btn-outline-danger">
                    ❌ Quitar
                </button>
            </div>
        `;

        card.querySelector('button').addEventListener('click', () => {
            eliminarDelCarrito(index);
            renderCarrito();
        });

        contenedorCarrito.appendChild(card);
    });
}

btnVaciar.addEventListener('click', () => {
    if (!confirm('¿Vaciar carrito?')) return;
    vaciarCarrito();
    renderCarrito();
});

btnFinalizar.addEventListener('click', () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    let mensaje = 'Hola! Quiero hacer un pedido 🍬\n\n';

    carrito.forEach(item => {
        mensaje += `• Combo ${item.combo}gr\n`;
        item.sabores.forEach(s => mensaje += `   - ${s}\n`);
        mensaje += '\n';
    });

    const telefono = '5491136371515';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
});

renderCarrito();*/
