const API_URL = "https://localhost:7264/api/productos";
let productoAEliminar = null;
let nombreProductoAEliminar = "";


document.addEventListener("DOMContentLoaded", cargarProductos);
document.addEventListener("DOMContentLoaded", () => {

    const btnGuardar = document.getElementById("btnGuardar");

    if (!btnGuardar) {
        console.error("❌ No se encontró el botón Guardar");
        return;
    }

    btnGuardar.addEventListener("click", guardarProducto);
});


async function cargarProductos() {
    const res = await fetch(API_URL);
    const productos = await res.json();

    const tbody = document.getElementById("tablaProductos");
    tbody.innerHTML = "";

    productos.forEach(p => {
        tbody.innerHTML += `
            <tr>
               <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td>
                
                    <button class="btn btn-sm btn-warning me-1"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Editar"
                        onclick="editarProducto(${p.id})">
                        ✏️
                    </button>

                    <button class="btn btn-sm btn-danger"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Eliminar"
                        onclick="confirmarEliminar(${p.id},'${p.nombre}')">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    // funcion para llamar a la etiqueta cuando se marca en el puntero de la accion
    activarTooltips();

}
function confirmarEliminar(id, nombre) {
    productoAEliminar = id;
    nombreProductoAEliminar = nombre;

    document.querySelector("#confirmDeleteModal .modal-body")
        .innerHTML = `
            🍬 ¿Eliminar <strong>${nombre}</strong>?
            <p class="text-muted mt-2">
                Esta acción no se puede deshacer
            </p>
        `;

    new bootstrap.Modal(
        document.getElementById("confirmDeleteModal")
    ).show();
}

document.getElementById("btnConfirmDelete")
    .addEventListener("click", async () => {

        if (!productoAEliminar) return;

        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/${productoAEliminar}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        productoAEliminar = null;

        bootstrap.Modal.getInstance(
            document.getElementById("confirmDeleteModal")
        ).hide();

        cargarProductos();
    });


function editarProducto(id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(p => {

            // CARGAR ID (CLAVE)
            document.getElementById("productoId").value = p.id;

            document.getElementById("nombre").value = p.nombre;
            document.getElementById("precio").value = p.precio;
            document.getElementById("stock").value = p.stock;

            document.getElementById("errorMsg").classList.add("d-none");

            new bootstrap.Modal(
                document.getElementById("productoModal")
            ).show();
        });
    limpiarError();
}

async function guardarProducto() {

    const idValue = document.getElementById("productoId").value;
    const id = idValue ? Number(idValue) : 0;

    const nombre = document.getElementById("nombre").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const stock = Number(document.getElementById("stock").value);

    document.getElementById("errorMsg").classList.add("d-none");

    // VALIDACIONES
    if (nombre === "") {
        mostrarError("El nombre es obligatorio");
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        mostrarError("El precio debe ser mayor a 0");
        return;
    }

    if (isNaN(stock) || stock < 0) {
        mostrarError("El stock no puede ser negativo");
        return;
    }

    // OBJETO (ID INCLUIDO)
    const producto = {
        id,
        nombre,
        precio,
        stock
    };

    try {
        let response;

        if (id > 0) {
            // ✏️ EDITAR
            response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(producto)
            });
        } else {
            // ➕ NUEVO
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(producto)
            });
        }

        if (!response.ok) {
            throw new Error("Error al guardar producto");
        }

        bootstrap.Modal.getInstance(
            document.getElementById("productoModal")
        ).hide();

        limpiarFormulario();
        cargarProductos();

    } catch (err) {
        mostrarError("¡No se pudo guardar el producto!");
        console.error(err);
    }
}


function mostrarError(msg) {
    const error = document.getElementById("errorMsg");
    error.textContent = msg;
    error.classList.remove("d-none");
}


function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(() => cargarProductos());
}

function limpiarFormulario() {
    document.getElementById("productoId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
}
