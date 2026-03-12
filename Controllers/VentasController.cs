using AppMiniNegocio.Data;
using AppMiniNegocio.Dtos;
using AppMiniNegocio.Models;
using AppMiniNegocio.Models.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppMiniNegocio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentasController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;

        public VentasController(AppDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ===============================
        // OBTENER TODAS LAS VENTAS (admin)
        // ===============================
        [HttpGet]
        public async Task<IActionResult> GetVentas()
        {
            var ventas = await _context.Ventas
                .Include(v => v.Combos)
                    .ThenInclude(c => c.Gustos)
                .Include(v => v.Usuario)
                .OrderByDescending(v => v.Fecha)
                .Select(v => new
                {
                    v.Id,
                    v.Fecha,
                    v.Total,
                    Estado = v.Estado.ToString(),
                    Usuario = v.Usuario != null ? v.Usuario.Email : "Sin usuario",
                    Combos = v.Combos.Select(c => new
                    {
                        c.Peso,
                        c.Cantidad,
                        c.PrecioUnitario,
                        c.Subtotal,
                        Gustos = c.Gustos.Select(g => g.NombreGusto).ToList()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ventas);
        }

        // ===============================
        // OBTENER VENTA POR ID
        // ===============================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Combos)
                    .ThenInclude(c => c.Gustos)
                .Include(v => v.Usuario)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null)
                return NotFound();

            return Ok(new
            {
                venta.Id,
                venta.Fecha,
                venta.Total,
                Estado = venta.Estado.ToString(),
                Usuario = venta.Usuario != null ? venta.Usuario.Email : "Sin usuario",
                Combos = venta.Combos.Select(c => new
                {
                    c.Peso,
                    c.Cantidad,
                    c.PrecioUnitario,
                    c.Subtotal,
                    Gustos = c.Gustos.Select(g => g.NombreGusto).ToList()
                }).ToList()
            });
        }

        // ===============================
        // CREAR VENTA DESDE CARRITO (cliente)
        // ===============================
        [Authorize]
        [HttpPost("desde-carrito")]
        public async Task<IActionResult> CrearVentaDesdeCarrito(VentaComboCreateDto dto)
        {
            // 1 — Usuario logueado
            var usuarioId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (usuarioId == null)
                return Unauthorized("Usuario no autenticado");

            // 2 — Validar que venga al menos un combo
            if (dto == null || !dto.Combos.Any())
                return BadRequest("El pedido debe tener al menos un combo.");

            // 3 — Crear la venta
            var venta = new Venta
            {
                Fecha = DateTime.Now,
                Estado = EstadoVenta.Pendiente,
                UsuarioId = usuarioId,
                Combos = new List<VentaCombo>()
            };

            decimal total = 0;

            // 4 — Procesar cada combo con sus gustos
            foreach (var comboDto in dto.Combos)
            {
                var subtotal = comboDto.PrecioUnitario * comboDto.Cantidad;
                total += subtotal;

                var combo = new VentaCombo
                {
                    Peso = comboDto.Peso,
                    Cantidad = comboDto.Cantidad,
                    PrecioUnitario = comboDto.PrecioUnitario,
                    Subtotal = subtotal,
                    Gustos = comboDto.Gustos.Select(g => new VentaComboGusto
                    {
                        NombreGusto = g
                    }).ToList()
                };

                venta.Combos.Add(combo);
            }

            venta.Total = total;

            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                venta.Id,
                venta.Fecha,
                venta.Total,
                Estado = venta.Estado.ToString()
            });
        }

        // ===============================
        // RESUMEN VENTAS
        // ===============================
        [HttpGet("resumen")]
        public async Task<IActionResult> ResumenVentas()
        {
            var ventas = await _context.Ventas
                .Select(v => new VentasResumenDto
                {
                    Id = v.Id,
                    Fecha = v.Fecha,
                    Total = v.Total,
                    Estado = v.Estado
                })
                .ToListAsync();

            return Ok(ventas);
        }

        // ===============================
        // TOTAL VENDIDO
        // ===============================
        [HttpGet("total")]
        public async Task<IActionResult> TotalVendido()
        {
            var total = await _context.Ventas
                .Where(v => v.Estado != EstadoVenta.Cancelada)
                .SumAsync(v => v.Total);

            return Ok(new { total });
        }

        // ===============================
        // CAMBIAR ESTADO
        // ===============================
        [Authorize]
        [HttpPut("cambiar-estado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, EstadoVenta nuevoEstado)
        {
            var venta = await _context.Ventas.FindAsync(id);
            if (venta == null)
                return NotFound();

            if (venta.Estado == EstadoVenta.Entregada)
                return BadRequest("No se puede modificar una venta entregada.");

            if ((int)nuevoEstado < (int)venta.Estado)
                return BadRequest("No se puede retroceder el estado.");

            venta.Estado = nuevoEstado;
            await _context.SaveChangesAsync();
            return Ok(venta);
        }
    }
}