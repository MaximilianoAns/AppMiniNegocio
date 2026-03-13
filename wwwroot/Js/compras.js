const API = 'https://localhost:7264/api';

let comprasData = [];
let itemsNuevaCompra = [];
let filaAbierta = null;

// ── Hamburguesa ──────────────────────────────────────
document.getElementById('btnHamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
});

// ── Logout ───────────────────────────────────────────
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// ── Toggle panel nueva compra ─────────────────────────
function togglePanel() {
    const panel = document.getElementById('panelCompra');
    const btn = document.getElementById('btnNuevaCompra');
    const visible = panel.style.display !== 'none';

    panel.style.display = visible ? 'none' : 'block';
    btn.textContent = visible ? '➕ Nueva Compra' : '✕ Cancelar';

    if (visible) resetForm();
}

function resetForm() {
    itemsNuevaCompra = [];
    document.getElementById('listaItems').innerHTML =
        `<div class="empty-msg" id="emptyMsg">Todavía no agregaste productos a esta compra</div>`;
    document.getElementById('totalPreview').textContent = '$0';
    document.getElementById('selProducto').value = '';
    document.getElementById('inputGramos').value = '';
    document.getElementById('inputPrecio').value = '';
}

// ── Cargar productos en el select ────────────────────
async function cargarProductosSelect() {
    try {
        const res = await fetch(`${API}/Productos`);
        const productos = await res.json();
        const sel = document.getElementById('selProducto');
        sel.innerHTML = `<option value="">Seleccioná un producto...</option>`;
        productos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando productos:', err);
    }
}

// ── Agregar item a la lista ───────────────────────────
function agregarItem() {
    const sel = document.getElementById('selProducto');
    const gramos = parseInt(document.getElementById('inputGramos').value);
    const precio = parseFloat(document.getElementById('inputPrecio').value);

    if (!sel.value || !gramos || !precio) {
        alert('Completá todos los campos');
        return;
    }
    if (gramos <= 0) { alert('Los gramos deben ser mayor a 0'); return; }
    if (precio <= 0) { alert('El precio debe ser mayor a 0'); return; }

    const nombre = sel.options[sel.selectedIndex].text;
    const id = Date.now();

    itemsNuevaCompra.push({
        _uiId: id,
        productoId: parseInt(sel.value),
        nombre,
        cantidadGramos: gramos,
        precioTotal: precio
    });

    const lista = document.getElementById('listaItems');
    const empty = document.getElementById('emptyMsg');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = 'item-agregado';
    div.id = `item-${id}`;
    div.innerHTML = `
    <span class="item-nombre">${nombre}</span>
    <span class="item-gr">${gramos.toLocaleString('es-AR')} gr</span>
    <span class="item-precio">$${precio.toLocaleString('es-AR')}</span>
    <button class="btn-quitar" onclick="quitarItem(${id})">✕</button>
  `;
    lista.appendChild(div);

    // Reset campos
    sel.value = '';
    document.getElementById('inputGramos').value = '';
    document.getElementById('inputPrecio').value = '';

    actualizarTotal();
}

// ── Quitar item ───────────────────────────────────────
function quitarItem(id) {
    itemsNuevaCompra = itemsNuevaCompra.filter(i => i._uiId !== id);
    document.getElementById(`item-${id}`).remove();
    if (itemsNuevaCompra.length === 0) {
        document.getElementById('listaItems').innerHTML =
            `<div class="empty-msg" id="emptyMsg">Todavía no agregaste productos a esta compra</div>`;
    }
    actualizarTotal();
}

// ── Actualizar total ──────────────────────────────────
function actualizarTotal() {
    const total = itemsNuevaCompra.reduce((acc, i) => acc + i.precioTotal, 0);
    document.getElementById('totalPreview').textContent = '$' + total.toLocaleString('es-AR');
}

// ── Guardar compra ────────────────────────────────────
async function guardarCompra() {
    if (itemsNuevaCompra.length === 0) {
        alert('Agregá al menos un producto');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sesión expirada, volvé a iniciar sesión');
        window.location.href = 'login.html';
        return;
    }

    const dto = {
        detalles: itemsNuevaCompra.map(i => ({
            productoId: i.productoId,
            cantidadGramos: i.cantidadGramos,
            precioTotal: i.precioTotal
        }))
    };

    try {
        const res = await fetch(`${API}/Compras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const msg = await res.text();
            alert(msg || 'No se pudo guardar la compra');
            return;
        }

        togglePanel();
        await cargarCompras();

    } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor');
    }
}

// ── Render tabla ──────────────────────────────────────
function renderTabla(compras) {
    const tbody = document.getElementById('tbodyCompras');

    if (compras.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4" style="color:#9b8ab8;">No hay compras registradas</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    filaAbierta = null;

    compras.forEach(c => {
        // Resumen de productos para la columna
        const tagsHtml = c.detalles.map(d =>
            `<span class="prod-tag">${d.productoNombre} <span class="gr-pill">${d.cantidadGramos.toLocaleString('es-AR')}gr</span></span>`
        ).join('');

        // Fila principal
        const tr = document.createElement('tr');
        tr.id = `fila-${c.id}`;
        tr.innerHTML = `
      <td><strong>#${c.id}</strong></td>
      <td>${new Date(c.fecha).toLocaleDateString('es-AR')}</td>
      <td>${tagsHtml || '<span style="color:#9b8ab8;">Sin detalle</span>'}</td>
      <td><strong style="color:#f72585;">$${(c.total || 0).toLocaleString('es-AR')}</strong></td>
      <td><button class="btn-ver" onclick="toggleDetalle(${c.id})">👁 Ver</button></td>
    `;
        tbody.appendChild(tr);

        // Fila detalle
        const trDet = document.createElement('tr');
        trDet.id = `detalle-${c.id}`;
        trDet.className = 'fila-expand';
        trDet.style.display = 'none';

        const detalleHtml = c.detalles.length > 0
            ? c.detalles.map(d => `
          <div class="detalle-row">
            <span class="detalle-nombre">${d.productoNombre}</span>
            <span class="detalle-gr">${d.cantidadGramos.toLocaleString('es-AR')} gr</span>
            <span class="detalle-precio">$${(d.precioTotal || 0).toLocaleString('es-AR')}</span>
          </div>
        `).join('')
            : `<p style="color:#9b8ab8;font-size:.88rem;margin:0;">Sin detalle registrado</p>`;

        trDet.innerHTML = `
      <td colspan="5">
        <div class="expand-inner">
          <div style="font-weight:800;color:#2d1b4e;margin-bottom:.75rem;">
            📦 Detalle compra #${c.id} — ${new Date(c.fecha).toLocaleDateString('es-AR')}
          </div>
          ${detalleHtml}
          <div class="total-bar">
            <span>Total compra</span>
            <span>$${(c.total || 0).toLocaleString('es-AR')}</span>
          </div>
        </div>
      </td>
    `;
        tbody.appendChild(trDet);
    });
}

// ── Toggle fila expandible ────────────────────────────
function toggleDetalle(id) {
    const filaDetalle = document.getElementById(`detalle-${id}`);
    const btn = document.querySelector(`#fila-${id} .btn-ver`);
    const visible = filaDetalle.style.display !== 'none';

    // Cerrar fila anterior
    if (filaAbierta && filaAbierta !== id) {
        const otraFila = document.getElementById(`detalle-${filaAbierta}`);
        const otroBtn = document.querySelector(`#fila-${filaAbierta} .btn-ver`);
        if (otraFila) otraFila.style.display = 'none';
        if (otroBtn) { otroBtn.textContent = '👁 Ver'; otroBtn.classList.remove('abierto'); }
    }

    filaDetalle.style.display = visible ? 'none' : 'table-row';
    btn.textContent = visible ? '👁 Ver' : '🔼 Cerrar';
    btn.classList.toggle('abierto', !visible);
    filaAbierta = visible ? null : id;
}

// ── Cargar compras ────────────────────────────────────
async function cargarCompras() {
    try {
        const res = await fetch(`${API}/Compras`);
        comprasData = await res.json();
        renderTabla(comprasData);
    } catch (err) {
        console.error(err);
        document.getElementById('tbodyCompras').innerHTML =
            `<tr><td colspan="5" class="text-center py-4" style="color:#f72585;">No se pudo conectar con el servidor</td></tr>`;
    }
}

// ── Init ──────────────────────────────────────────────
cargarCompras();
cargarProductosSelect();