const API = 'https://localhost:7264/api';

// ── Hamburguesa ──────────────────────────────────────
const btnHam = document.getElementById('btnHamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
btnHam.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('active'); });
overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });

// ── Logout ───────────────────────────────────────────
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// ── Badge estado ─────────────────────────────────────
function badgeEstado(estado) {
    const map = {
        'Pendiente': 'background:rgba(249,199,79,.15);color:#b45309;',
        'Confirmada': 'background:rgba(67,97,238,.15);color:#4361ee;',
        'EnPreparacion': 'background:rgba(76,201,240,.15);color:#0369a1;',
        'Enviada': 'background:rgba(114,9,183,.15);color:#7209b7;',
        'Entregada': 'background:rgba(6,214,160,.15);color:#047857;',
        'Cancelada': 'background:rgba(247,37,133,.15);color:#f72585;',
    };
    const style = map[estado] || 'background:#eee;color:#333;';
    return `<span style="padding:.3rem .75rem;border-radius:50px;font-size:.75rem;font-weight:800;${style}">${estado}</span>`;
}

// ── Gráfico barras ───────────────────────────────────
let chartBarras, chartDona;

function buildChartBarras(labels, data) {
    if (chartBarras) chartBarras.destroy();
    chartBarras = new Chart(document.getElementById('chartBarras'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ventas $', data,
                backgroundColor: 'rgba(247,37,133,.18)',
                borderColor: '#f72585', borderWidth: 2, borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(247,37,133,.06)' }, ticks: { font: { family: 'Nunito', weight: '700' } } },
                x: { grid: { display: false }, ticks: { font: { family: 'Nunito', weight: '700' } } }
            }
        }
    });
}

// ── Gráfico dona ─────────────────────────────────────
function buildChartDona(counts) {
    if (chartDona) chartDona.destroy();
    chartDona = new Chart(document.getElementById('chartDona'), {
        type: 'doughnut',
        data: {
            labels: ['Pendiente', 'Entregada', 'En prep.', 'Cancelada'],
            datasets: [{
                data: [counts.Pendiente, counts.Entregada, counts.EnPreparacion, counts.Cancelada],
                backgroundColor: ['rgba(249,199,79,.8)', 'rgba(6,214,160,.8)', 'rgba(76,201,240,.8)', 'rgba(247,37,133,.8)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '68%',
            plugins: { legend: { display: false } }
        }
    });
}

// ── Tendencia estados ────────────────────────────────
function buildTendencia(counts) {
    const estados = [
        { nombre: 'Pendiente', color: '#f9c74f', count: counts.Pendiente, clase: 't-down', icono: '↑', texto: 'requieren atención' },
        { nombre: 'Entregada', color: '#06d6a0', count: counts.Entregada, clase: 't-up', icono: '✓', texto: 'completadas' },
        { nombre: 'En preparación', color: '#4cc9f0', count: counts.EnPreparacion, clase: 't-same', icono: '→', texto: 'en proceso' },
        { nombre: 'Cancelada', color: '#f72585', count: counts.Cancelada, clase: 't-down', icono: '↓', texto: 'canceladas' },
    ];

    document.getElementById('tendenciaEstados').innerHTML = estados.map(e => `
    <div class="trend-row">
      <div class="trend-dot" style="background:${e.color};"></div>
      <span class="trend-name">${e.nombre}</span>
      <span class="trend-count" style="color:${e.color};">${e.count}</span>
      <span class="trend-badge ${e.clase}">${e.icono} ${e.texto}</span>
    </div>
  `).join('');
}

// ── Ventas últimos 7 días ────────────────────────────
function buildVentasPorDia(ventas) {
    const hoy = new Date();
    const dias = [], totales = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() - i);
        dias.push(d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }));
        const total = ventas
            .filter(v => new Date(v.fecha).toDateString() === d.toDateString())
            .reduce((acc, v) => acc + (v.total || 0), 0);
        totales.push(total);
    }

    buildChartBarras(dias, totales);
}

// ── CARGAR TODO ──────────────────────────────────────
async function cargarDashboard() {
    try {
        const [resVentas, resCompras, resProductos] = await Promise.all([
            fetch(`${API}/Ventas`),
            fetch(`${API}/Compras`),
            fetch(`${API}/Productos`)
        ]);

        const ventas = await resVentas.json();
        const compras = await resCompras.json();
        const productos = await resProductos.json();

        // Stats
        const totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
        const pendientes = ventas.filter(v => v.estado === 'Pendiente').length;
        const totalCompras = compras.reduce((acc, c) => acc + (c.total || 0), 0);
        const productosActivos = productos.filter(p => p.activo !== false).length;

        document.getElementById('statTotalVentas').textContent = `$${totalVentas.toLocaleString('es-AR')}`;
        document.getElementById('statPendientes').textContent = pendientes;
        document.getElementById('statTotalCompras').textContent = `$${totalCompras.toLocaleString('es-AR')}`;
        document.getElementById('statProductos').textContent = productosActivos;

        // Conteo por estado
        const counts = {
            Pendiente: ventas.filter(v => v.estado === 'Pendiente').length,
            Entregada: ventas.filter(v => v.estado === 'Entregada').length,
            EnPreparacion: ventas.filter(v => v.estado === 'EnPreparacion').length,
            Cancelada: ventas.filter(v => v.estado === 'Cancelada').length,
        };

        buildVentasPorDia(ventas);
        buildChartDona(counts);
        buildTendencia(counts);

        // Tabla últimas 5
        const tbody = document.getElementById('tbodyVentas');
        const ultimas = ventas.slice(0, 5);

        if (ultimas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3" style="color:#9b8ab8;">Sin ventas registradas aún</td></tr>`;
            return;
        }

        tbody.innerHTML = ultimas.map(v => `
      <tr>
        <td><strong>#${v.id}</strong></td>
        <td>${new Date(v.fecha).toLocaleDateString('es-AR')}</td>
        <td style="font-size:.85rem;color:#9b8ab8;">${v.usuario || '-'}</td>
        <td><strong style="color:#f72585;">$${(v.total || 0).toLocaleString('es-AR')}</strong></td>
        <td>${badgeEstado(v.estado)}</td>
      </tr>
    `).join('');

    } catch (err) {
        console.error('Error cargando dashboard:', err);
        ['statTotalVentas', 'statPendientes', 'statTotalCompras', 'statProductos']
            .forEach(id => document.getElementById(id).textContent = '—');
        document.getElementById('tbodyVentas').innerHTML =
            `<tr><td colspan="5" class="text-center py-3" style="color:#f72585;">No se pudo conectar con el servidor</td></tr>`;
    }
}

cargarDashboard();