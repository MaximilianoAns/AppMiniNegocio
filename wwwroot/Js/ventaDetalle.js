const API_URL = "https://localhost:7264/api";


const params = new URLSearchParams(window.location.search);
const ventaId = params.get("id");




async function cargarVenta() {
    try {
        const res = await fetch(`${API_URL}/Ventas/${ventaId}`);

        if (!res.ok) {
            alert("No se pudo cargar la venta");
            return;
        }

        const venta = await res.json();

        document.getElementById("ventaId").textContent = venta.id;
        document.getElementById("ventaFecha").textContent =
            new Date(venta.fecha).toLocaleDateString();
        document.getElementById("ventaTotal").textContent =
            venta.total.toFixed(2);

    } catch (error) {
        console.error("Error al cargar venta:", error);
    }
}



async function cargarDetalleVenta() {

    const params = new URLSearchParams(window.location.search);
    const ventaId = params.get("id"); // cargamos el ID

    if (!ventaId) {
        alert("No se recibió el ID de la venta");
        return;
    } // VALIDAMOS

    try {
        const response = await fetch(`${API_URL}/Ventas/${ventaId}`); // LAMAMOS A LA API

        if (!response.ok) {
            throw new Error("No se pudo cargar la venta"); // VALIDAMOS 
        }

        const venta = await response.json();  // TRAEMOS LOS DATOS EN JSON
        console.log("Venta completa:", venta);

        const tbody = document.getElementById("tablaDetalle"); //TRAEMOS LOS DATOS A LA TABLA 
        tbody.innerHTML = "";

        venta.detalles.forEach(d => { // MOSTRAMOS CON EL FOR
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${d.producto?.nombre ?? "Producto eliminado"}</td>
                <td>${d.cantidad}</td>
                <td>$ ${d.precioUnitario.toFixed(2)}</td>
                <td>$ ${d.subtotal.toFixed(2)}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        alert("No se pudo cargar el detalle de la venta");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    cargarVenta();
    cargarDetalleVenta();
});

