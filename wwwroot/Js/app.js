const API_URL = "https://localhost:7264/api/productos";

const btnGuardar = document.getElementById("btnGuardar");
const bodyTabla = document.getElementById("tblProductosBody");

btnGuardar.addEventListener("click", guardarProducto);

async function cargarProductos() {
    const response = await fetch(API_URL);
    const productos = await response.json();

    bodyTabla.innerHTML = "";

    productos.forEach(p => {
        bodyTabla.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.precio}</td>
                <td>${p.stock}</td>
            </tr>
        `;
    });
}

async function guardarProducto() {
    const id = document.getElementById("productoId").value;
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const stock = document.getElementById("stock").value;

    const producto = { nombre, precio, stock };

    if (id) {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...producto })
        });
    } else {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });
    }

    limpiarFormulario();
    cargarProductos();
}

function limpiarFormulario() {
    document.getElementById("productoId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
}

// 🔥 Cargar productos al abrir la página
cargarProductos();

