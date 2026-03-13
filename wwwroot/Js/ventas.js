const API = 'https://localhost:7264/api';

let ventasData = [];
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

// ── Badge de estado ───────────────────────────────────
function badgeEstado(estado) {
    const clases = {
        'Pendiente': 'badge-pendiente',
        'Confirmada': 'badge-confirmada',
        'EnPreparacion': 'badge-enpreparacion',
        'Enviada': 'badge-enviada',
        'Entregada': 'badge-entregada',
        'Cancelada': 'badge-cancelada',
    };
    const labels = {
        'Pendiente': 'Pendiente',
        'Confirmada': 'Confirmada',
        'EnPreparacion': 'En preparación',
        'Enviada': 'Enviada',
        'Entregada': 'Entregada',
        'Cancelada': 'Cancelada',
    };
    const cls = clases[estado] || '';
    return `<span class="badge-estado ${cls}">${labels[estado] || estado}</span>`;
}

// ── Render tabla ──────────────────────────────────────
function renderTabla(ventas) {
    const tbody = document.getElementById('tbodyVentas');

    if (ventas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4" style="color:#9b8ab8;">No se encontraron ventas</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    filaAbierta = null;

    ventas.forEach(v => {
        // Fila principal
        const tr = document.createElement('tr');
        tr.id = `fila-${v.id}`;
        tr.innerHTML = `
      <td><strong>#${v.id}</strong></td>
      <td>${new Date(v.fecha).toLocaleDateString('es-AR')}</td>
      <td style="font-size:.85rem;color:#9b8ab8;">${v.usuario || '-'}</td>
      <td><strong style="color:#f72585;">$${(v.total || 0).toLocaleString('es-AR')}</strong></td>
      <td>${badgeEstado(v.estado)}</td>
      <td>
        <button class="btn-detalle" onclick="toggleDetalle(${v.id})">
          👁 Ver detalle
        </button>
      </td>
    `;
        tbody.appendChild(tr);

        // Fila de detalle (oculta)
        const trDetalle = document.createElement('tr');
        trDetalle.id = `detalle-${v.id}`;
        trDetalle.className = 'fila-expand';
        trDetalle.style.display = 'none';
        trDetalle.innerHTML = `
      <td colspan="6">
        <div class="expand-inner">

          <div class="expand-header">
            <span class="expand-title">🍬 Combos del pedido #${v.id}</span>
            <span style="font-size:.82rem;color:#9b8ab8;font-weight:700;">${v.usuario || ''} · ${new Date(v.fecha).toLocaleDateString('es-AR')}</span>
          </div>

          ${v.combos && v.combos.length > 0
                ? v.combos.map(c => `
                <div class="combo-pill">
                  <span class="combo-peso">${c.peso}gr</span>
                  <div class="combo-gustos">
                    ${c.gustos && c.gustos.length > 0
                        ? c.gustos.map(g => `<span class="gusto-tag">${g}</span>`).join('')
                        : '<span style="color:#9b8ab8;font-size:.82rem;">Sin gustos registrados</span>'
                    }
                  </div>
                  <span class="combo-precio">$${(c.subtotal || 0).toLocaleString('es-AR')}</span>
                </div>
              `).join('')
                : '<p style="color:#9b8ab8;font-size:.88rem;margin:0;">Sin combos registrados</p>'
            }

          <div class="estado-form">
            <select class="form-select form-select-sm estado-select" id="selectEstado-${v.id}">
              <option value="">Cambiar estado...</option>
              <option value="Pendiente"     ${v.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="Confirmada"    ${v.estado === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
              <option value="EnPreparacion" ${v.estado === 'EnPreparacion' ? 'selected' : ''}>En preparación</option>
              <option value="Enviada"       ${v.estado === 'Enviada' ? 'selected' : ''}>Enviada</option>
              <option value="Entregada"     ${v.estado === 'Entregada' ? 'selected' : ''}>Entregada</option>
              <option value="Cancelada"     ${v.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
            </select>
            <button class="btn-guardar-estado" onclick="cambiarEstado(${v.id})">
              💾 Guardar
            </button>
            ${v.estado === 'Entregada' || v.estado === 'Cancelada'
                ? `<span style="font-size:.78rem;color:#9b8ab8;font-weight:700;">⚠️ Estado final, no se puede modificar</span>`
                : ''
            }
          </div>

        </div>
      </td>
    `;
        tbody.appendChild(trDetalle);
    });
}

// ── Toggle expandir fila ──────────────────────────────
function toggleDetalle(id) {
    const filaDetalle = document.getElementById(`detalle-${id}`);
    const btn = document.querySelector(`#fila-${id} .btn-detalle`);
    const visible = filaDetalle.style.display !== 'none';

    // Cerrar la fila que estaba abierta antes
    if (filaAbierta && filaAbierta !== id) {
        const otraFila = document.getElementById(`detalle-${filaAbierta}`);
        const otroBtn = document.querySelector(`#fila-${filaAbierta} .btn-detalle`);
        if (otraFila) otraFila.style.display = 'none';
        if (otroBtn) { otroBtn.textContent = '👁 Ver detalle'; otroBtn.classList.remove('abierto'); }
    }

    if (visible) {
        filaDetalle.style.display = 'none';
        btn.textContent = '👁 Ver detalle';
        btn.classList.remove('abierto');
        filaAbierta = null;
    } else {
        filaDetalle.style.display = 'table-row';
        btn.textContent = '🔼 Cerrar';
        btn.classList.add('abierto');
        filaAbierta = id;
    }
}

// ── Cambiar estado ────────────────────────────────────
async function cambiarEstado(id) {
    const select = document.getElementById(`selectEstado-${id}`);
    const nuevoEstado = select.value;

    if (!nuevoEstado) {
        alert('Seleccioná un estado');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sesión expirada, volvé a iniciar sesión');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API}/Ventas/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const msg = await res.text();
            alert(msg || 'No se pudo cambiar el estado');
            return;
        }

        // Actualizar dato local y re-renderizar
        const venta = ventasData.find(v => v.id === id);
        if (venta) venta.estado = nuevoEstado;

        renderTabla(ventasData);
        // Volver a abrir la fila
        toggleDetalle(id);

    } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor');
    }
}

// ── Filtros ───────────────────────────────────────────
function aplicarFiltros() {
    const buscar = document.getElementById('inputBuscar').value.toLowerCase();
    const estado = document.getElementById('filtroEstado').value;

    const filtradas = ventasData.filter(v => {
        const matchBuscar = !buscar ||
            String(v.id).includes(buscar) ||
            (v.usuario || '').toLowerCase().includes(buscar);
        const matchEstado = !estado || v.estado === estado;
        return matchBuscar && matchEstado;
    });

    renderTabla(filtradas);
}

function limpiarFiltros() {
    document.getElementById('inputBuscar').value = '';
    document.getElementById('filtroEstado').value = '';
    renderTabla(ventasData);
}

// ── Cargar ventas ─────────────────────────────────────
async function cargarVentas() {
    try {
        const res = await fetch(`${API}/Ventas`);
        ventasData = await res.json();
        renderTabla(ventasData);
    } catch (err) {
        console.error(err);
        document.getElementById('tbodyVentas').innerHTML =
            `<tr><td colspan="6" class="text-center py-4" style="color:#f72585;">No se pudo conectar con el servidor</td></tr>`;
    }
}

// ── Enter en el buscador ──────────────────────────────
document.getElementById('inputBuscar').addEventListener('keydown', e => {
    if (e.key === 'Enter') aplicarFiltros();
});

// ── Init ──────────────────────────────────────────────
cargarVentas();