const API_URL = "https://localhost:7264/api";

detallesVenta = [];
totalVenta = 0;
renderDetalleVenta();

// estas var las usamos para detectar el producto seleccionado 
const selectProducto = document.getElementById("selectProducto");
const inputCantidad = document.getElementById("inputCantidad");



// =====================
// CARGAR VENTAS
// =====================
async function cargarVentas() {
    const res = await fetch(`${API_URL}/Ventas`);
    const ventas = await res.json();

    const tbody = document.getElementById("tblVentasBody");
    tbody.innerHTML = "";

    ventas.forEach(v => {
        const tr = document.createElement("tr");

        if (v.estado === "Cancelada") {
            tr.className = "table-danger opacity-75";
        }

        tr.innerHTML = `
            <td>${v.id}</td>
            <td>${new Date(v.fecha).toLocaleDateString()}</td>
            <td>$ ${v.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-info" title="Ver detalle" onclick="verDetalle(${v.id})"> 👁 Ver </button>
            </td>
            <td>innerHTML
              <button class="btn btn-sm btn-danger"
                    onclick="cambiarEstado(${v.id}, 'Cancelada')">
                    🚫 Cancelar
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
    activarTooltips();
}
// funcion para cambiar de color del estado de la venta
function getBadgeColor(estado) {
    switch (estado) {
        case "Pendiente": return "bg-warning text-dark";
        case "Confirmada": return "bg-primary";
        case "EnPreparacion": return "bg-info text-dark";
        case "Enviada": return "bg-secondary";
        case "Entregada": return "bg-success";
        case "Cancelada": return "bg-danger";
        default: return "bg-dark";
    }
}
// funcion para cambiar de estado la venta, se llama desde el boton cancelar venta
async function cambiarEstado(id, nuevoEstado) {
    await fetch(`${API_URL}/Ventas/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, {
        method: "PUT"
    });

    cargarVentas();
}
function verDetalle(id) {
    console.log("ID enviado al detalle:", id);
    window.location.href = `ventaDetalle.html?id=${id}`; // PASAMOS EL ID A LA PAGINA 
}



// =====================
// CARGAR PRODUCTOS
// =====================
async function cargarProductos() {
    const select = document.getElementById("selectProducto");
    if (!select) return;

    try {
        const res = await fetch(`${API_URL}/Productos`);
        const productos = await res.json();

        select.innerHTML = `<option value="">Seleccione producto</option>`;

        productos
            .filter(p => p.activo !== false && p.stock > 0) // VALIDAMOS QUE EL STOCK ESTE MAYOR A CERO
            .forEach(p => { // P se crea dentro del for para hacer referencia a los productos
                const option = document.createElement("option");
                option.value = p.id;

              // MOSTRAMOS EL STOCK DISPONIBLE
                option.textContent =
                    `${p.nombre} ($${p.precio}) - Stock: ${p.stock}`;

                //guardamos info del producto directamente en el option
                //, para usarla después, sin volver a llamar a la API.
                option.value = p.id;
                option.textContent = `${p.nombre} ($${p.precio}) - Stock: ${p.stock}`;
                option.dataset.stock = p.stock;
                option.dataset.precio = p.precio;

                option.disabled = p.stock <= 0; // SI EL STOCK ES MENOR A CERO NO SE MUESTRA

                select.appendChild(option);
            });

    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los productos");
    }
}




// GUARDAR VENTA

async function guardarVenta() {
    const productoId = document.getElementById("productoId").value;
    const cantidad = document.getElementById("cantidad").value;

    if (!productoId || cantidad <= 0) {
        alert("Seleccioná un producto y una cantidad válida");
        return;
    }

    const venta = {
        detalles: [{
            productoId: Number(productoId),
            cantidad: Number(cantidad)
        }]
    };

    const res = await fetch(`${API_URL}/Ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
    });

    if (res.ok) {
        await cargarVentas();
        document.getElementById("cantidad").value = "";
    } else {
        const msg = await res.text();
        alert(msg);
    }
}


// ACCIONES


function confirmarAnular(id) {
    if (!confirm("¿Seguro que querés anular esta venta?")) return;

    fetch(`${API_URL}/Ventas/anular/${id}`, { method: "PUT" })
        .then(() => cargarVentas());
    window.location.reload();
}

document.getElementById("btnNuevaVenta")
    .addEventListener("click", () => {

        const select = document.getElementById("productoId");
        const cantidadInput = document.getElementById("cantidad");

        const productoId = Number(select.value);
        const cantidad = Number(cantidadInput.value);

        if (!productoId || cantidad <= 0) {
            alert("Seleccioná un producto y una cantidad válida");
            return;
        }

        const nombre = select.options[select.selectedIndex].text;
        const precio = Number(
            select.options[select.selectedIndex].text
                .match(/\$(\d+(\.\d+)?)/)[1]
        );

        const subtotal = precio * cantidad;

        detallesVenta.push({
            productoId,
            cantidad,
            precio,
            nombre
        });

        totalVenta += subtotal;

        renderDetalleVenta();
        cantidadInput.value = "";
    });

    // RENDERIZAMOS LA TABLA DETALLE 
function renderDetalleVenta() {
    const tbody = document.getElementById("detalleVentaBody");
    tbody.innerHTML = "";

    detallesVenta.forEach((d, index) => {
        const subtotal = d.precio * d.cantidad;

        tbody.innerHTML += `
            <tr>
                <td>${d.nombre}</td>
                <td>${d.cantidad}</td>
                <td>$${d.precio.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger"
                        onclick="eliminarDetalle(${index})">
                        ✖
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("totalVenta").textContent =
        totalVenta.toFixed(2);
}
 // ELIMINAR PRODUCTO DETALLEM
function eliminarDetalle(index) {
    const d = detallesVenta[index];
    totalVenta -= d.precio * d.cantidad;
    detallesVenta.splice(index, 1);
    renderDetalleVenta();
}
// CONFIRMAR VENTA POST
document.getElementById("btnConfirmarVenta")
    .addEventListener("click", async () => {

        if (detallesVenta.length === 0) {
            alert("La venta no tiene productos");
            return;
        }

        const venta = {
            detalles: detallesVenta.map(d => ({
                productoId: d.productoId,
                cantidad: d.cantidad
            }))
        };

        const res = await fetch(`${API_URL}/Ventas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(venta)
        });

        if (!res.ok) {
            const msg = await res.text();
            alert(msg);
            return;
        }

        // RESET
        detallesVenta = [];
        totalVenta = 0;
        renderDetalleVenta();
        cargarVentas();

        document
            .getElementById("formNuevaVenta")
            .classList.add("d-none");

        alert("Venta registrada correctamente");

        // 🔄 RECARGA LA PÁGINA → vuelve a pedir productos y stock actualizado

        window.location.reload();
    });


document.addEventListener("DOMContentLoaded", () => {

    const btnNuevaVenta = document.getElementById("btnNuevaVenta");
    const formNuevaVenta = document.getElementById("formNuevaVenta");
    const btnCancelarVenta = document.getElementById("btnCancelarVenta");

    // ABRIR FORMULARIO
    btnNuevaVenta.addEventListener("click", () => {
        formNuevaVenta.classList.remove("d-none");

        // reset venta
        detallesVenta = [];
        totalVenta = 0;
        renderDetalleVenta();
    });

    // CANCELAR VENTA
    btnCancelarVenta.addEventListener("click", () => {
        formNuevaVenta.classList.add("d-none");

        detallesVenta = [];
        totalVenta = 0;
        renderDetalleVenta();
    });
});

document.getElementById("btnAgregarProducto")
    .addEventListener("click", () => {

        const select = document.getElementById("selectProducto");
        const cantidadInput = document.getElementById("inputCantidad");

        if (!select || !cantidadInput) {
            console.error("Elementos no encontrados");
            return;
        }

        const productoId = Number(select.value);
        const cantidad = Number(cantidadInput.value);

        if (!productoId || cantidad <= 0) {
            alert("Seleccioná un producto y una cantidad válida");
            return;
        }

        if (cantidad > stock) {
            alert("No hay stock suficiente");
            return;
        }
        


        const option = select.selectedOptions[0];
        const texto = option.textContent;

        // Extraer precio del texto ($1234)
        const matchPrecio = texto.match(/\$(\d+(\.\d+)?)/);
        if (!matchPrecio) {
            alert("No se pudo obtener el precio del producto");
            return;
        }



        const precio = Number(matchPrecio[1]);
        const nombre = texto.split(" ($")[0];

        // validamos para no duplicar los productos
        const existente = detallesVenta.find(d => d.productoId === productoId);

        if (existente) {
            existente.cantidad += cantidad; // sumamos cantidad al producto y no duplicamos
        } else {
            detallesVenta.push({
                productoId,
                nombre,
                precio,
                cantidad
            });
        }
        // simula el consumo dentro de la venta 
        option.dataset.stock -= cantidad;
        option.textContent = `${nombre} ($${precio}) - Stock: ${option.dataset.stock}`;

        totalVenta += precio * cantidad;
        renderDetalleVenta();

        cantidadInput.value = "";
    });


document.addEventListener("DOMContentLoaded", () => {
    cargarVentas();
    cargarProductos();

    const btnGuardarVenta = document.getElementById("btnGuardarVenta");
    if (btnGuardarVenta) {
        btnGuardarVenta.addEventListener("click", guardarVenta);
    }
});


// Actualiza el máximo permitido en el input cantidad
selectProducto.addEventListener("change", () => {
    const option = selectProducto.selectedOptions[0]; // obtenemos el prod seleccionado

    if (!option || !option.dataset.stock) return; //validamos 

    const stock = parseInt(option.dataset.stock); // convertimos stock a numero 
    inputCantidad.max = stock; // establece el permitido 

    console.log("Stock disponible:", stock);
});


// Cada vez que el usuario escribe o cambia la cantidad.
inputCantidad.addEventListener("input", () => {
    const option = selectProducto.selectedOptions[0]; // obtenemos el prod seleccionado 
    if (!option) return; // validamos si no hacemos nada

    const stock = parseInt(option.dataset.stock); // obtenemos stock y cantidad
    const cantidad = parseInt(inputCantidad.value);

    if (cantidad > stock) { // validamos
        inputCantidad.classList.add("is-invalid");
    } else {
        inputCantidad.classList.remove("is-invalid");
    }
});

// para mostrar error al cargar mas cantidad que el stock
const errorStock = document.getElementById("errorStock");

if (cantidad > stock) {
    inputCantidad.classList.add("is-invalid");
    errorStock.textContent = `Stock disponible: ${stock}`;
} else {
    inputCantidad.classList.remove("is-invalid");
    errorStock.textContent = "";
}





