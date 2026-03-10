const carritoDrawer = document.getElementById('carritoDrawer');
const listaCarrito = document.getElementById('listaCarrito');
const cerrarCarrito = document.getElementById('cerrarCarrito');
const btnAbrirCarrito = document.getElementById('btnAbrirCarrito');
const cartCount = document.getElementById('cartCount');

// 🔓 FUNCIÓN GLOBAL
window.abrirCarrito = function () {
    renderCarritoDrawer();
    carritoDrawer.classList.add('abierto');
};

// CLICK EN ICONO DEL NAVBAR
if (btnAbrirCarrito) {
    btnAbrirCarrito.addEventListener('click', (e) => {
        e.preventDefault();

        carritoDrawer.classList.toggle('abierto');

        if (carritoDrawer.classList.contains('abierto')) {
            renderCarritoDrawer();
        }
    });
}



// CERRAR CARRITO
if (cerrarCarrito) {
    cerrarCarrito.addEventListener('click', () => {
        carritoDrawer.classList.remove('abierto');
    });
}



function renderCarritoDrawer() {

    const listaCarrito = document.getElementById('listaCarrito');
    if (!listaCarrito) return;

    const carrito = obtenerCarrito(); // desde storage
    listaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <li class="list-group-item text-center">
                Carrito vacío 🍬
            </li>
        `;
        actualizarBotonIrAlCarrito();
        return;
    }

    carrito.forEach((item, index) => {

        const li = document.createElement('li');
        li.className = 'list-group-item';

        li.innerHTML = `
            <strong>Combo ${item.combo}gr</strong>
            <ul class="mb-2">
                ${item.sabores.map(s => `<li>${s}</li>`).join('')}
            </ul>
            <button class="btn btn-sm btn-outline-danger btn-quitar">
                Quitar
            </button>
        `;

        li.querySelector('.btn-quitar').addEventListener('click', () => {
            eliminarItem(index); 
            renderCarritoDrawer(); 
        });

        listaCarrito.appendChild(li);
      

    });
    actualizarBotonIrAlCarrito();
}

// redirigimos el boton ver carrito a la pagina del carrito
document.addEventListener("DOMContentLoaded", () => {

    const btnIrAlCarrito = document.getElementById("btnIrAlCarrito");

    if (btnIrAlCarrito) {
        btnIrAlCarrito.addEventListener("click", () => {
            window.location.href = "carrito.html";
        });
    }

    actualizarBotonIrAlCarrito();
});


// actualizamos el boton 
function actualizarBotonIrAlCarrito() {
    const btnIrAlCarrito = document.getElementById("btnIrAlCarrito");
    if (!btnIrAlCarrito) return;

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    btnIrAlCarrito.disabled = carrito.length === 0;
}

// deshabilitamos el boton del carrito al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
    actualizarBotonIrAlCarrito();
});


// CERRAR SI HAGO CLICK FUERA DEL DRAWER
document.addEventListener('click', (e) => {

    if (!carritoDrawer.classList.contains('abierto')) return;

    const clickDentroCarrito = carritoDrawer.contains(e.target);
    const clickEnBotonCarrito = btnAbrirCarrito && btnAbrirCarrito.contains(e.target);

    if (!clickDentroCarrito && !clickEnBotonCarrito) {
        carritoDrawer.classList.remove('abierto');
    }

});





