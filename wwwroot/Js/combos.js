const API = 'https://localhost:7264/api';

let combosData = [];
let modoEdicion = false;

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

// ── Toggle panel ─────────────────────────────────────
function togglePanel(combo = null) {
    const panel = document.getElementById('panelCombo');
    const btn = document.getElementById('btnNuevoCombo');
    const visible = panel.style.display !== 'none';

    if (visible) {
        panel.style.display = 'none';
        btn.textContent = '➕ Nuevo Combo';
        resetForm();
        return;
    }

    // Si viene combo es edición
    if (combo) {
        modoEdicion = true;
        document.getElementById('panelTitulo').textContent = `✏️ Editar combo ${combo.peso}gr`;
        document.getElementById('comboEditId').value = combo.id;
        document.getElementById('inputPeso').value = combo.peso;
        document.getElementById('inputPeso').disabled = true; // no se puede cambiar el peso
        document.getElementById('inputPrecio').value = combo.precio;
        document.getElementById('inputMinimoGustos').value = combo.minimoGustos;
    } else {
        modoEdicion = false;
        document.getElementById('panelTitulo').textContent = '🍬 Nuevo combo';
        document.getElementById('inputPeso').disabled = false;
        resetForm();
    }

    panel.style.display = 'block';
    btn.textContent = '✕ Cancelar';
}

function resetForm() {
    document.getElementById('comboEditId').value = '';
    document.getElementById('inputPeso').value = '';
    document.getElementById('inputPeso').disabled = false;
    document.getElementById('inputPrecio').value = '';
    document.getElementById('inputMinimoGustos').value = '';
    modoEdicion = false;
}

// ── Guardar combo (crear o editar) ───────────────────
async function guardarCombo() {
    const peso = parseInt(document.getElementById('inputPeso').value);
    const precio = parseFloat(document.getElementById('inputPrecio').value);
    const minimoGustos = parseInt(document.getElementById('inputMinimoGustos').value);

    if (!peso || !precio || !minimoGustos) {
        alert('Completá todos los campos');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sesión expirada, volvé a iniciar sesión');
        window.location.href = 'login.html';
        return;
    }

    try {
        let res;

        if (modoEdicion) {
            const id = document.getElementById('comboEditId').value;
            const combo = combosData.find(c => c.id === parseInt(id));
            res = await fetch(`${API}/Combos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ precio, minimoGustos, activo: combo?.activo ?? true })
            });
        } else {
            res = await fetch(`${API}/Combos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ peso, precio, minimoGustos })
            });
        }

        if (!res.ok) {
            const msg = await res.text();
            alert(msg || 'No se pudo guardar el combo');
            return;
        }

        togglePanel();
        await cargarCombos();

    } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor');
    }
}

// ── Toggle activo/inactivo ────────────────────────────
async function toggleActivo(id) {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const res = await fetch(`${API}/Combos/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const msg = await res.text();
            alert(msg || 'No se pudo cambiar el estado');
            return;
        }

        await cargarCombos();

    } catch (err) {
        console.error(err);
        alert('Error al conectar con el servidor');
    }
}

// ── Render tabla ──────────────────────────────────────
function renderTabla(combos) {
    const tbody = document.getElementById('tbodyCombos');

    if (combos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4" style="color:#9b8ab8;">No hay combos configurados aún</td></tr>`;
        return;
    }

    tbody.innerHTML = combos.map(c => `
    <tr class="${!c.activo ? 'fila-inactiva' : ''}">
      <td><span class="peso-pill">${c.peso}gr</span></td>
      <td><strong style="color:#f72585;font-size:1.05rem;">$${(c.precio || 0).toLocaleString('es-AR')}</strong></td>
      <td><span style="font-weight:800;color:#7209b7;">${c.minimoGustos} gustos</span></td>
      <td>
        ${c.activo
            ? `<span class="badge-activo">✓ Activo</span>`
            : `<span class="badge-inactivo">✕ Inactivo</span>`
        }
      </td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn-editar" onclick="togglePanel(${JSON.stringify(c).replace(/"/g, '&quot;')})">✏️ Editar</button>
          ${c.activo
            ? `<button class="btn-desactivar" onclick="toggleActivo(${c.id})">🚫 Desactivar</button>`
            : `<button class="btn-activar"    onclick="toggleActivo(${c.id})">✓ Activar</button>`
        }
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Cargar combos ─────────────────────────────────────
async function cargarCombos() {
    try {
        const res = await fetch(`${API}/Combos`);
        combosData = await res.json();
        renderTabla(combosData);
    } catch (err) {
        console.error(err);
        document.getElementById('tbodyCombos').innerHTML =
            `<tr><td colspan="5" class="text-center py-4" style="color:#f72585;">No se pudo conectar con el servidor</td></tr>`;
    }
}

// ── Init ──────────────────────────────────────────────
cargarCombos();