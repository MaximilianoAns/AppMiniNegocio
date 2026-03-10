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
        private readonly UserManager<IdentityUser> _userManager; // PARA OBTENER USUARIO LOGUEADO


        public VentasController(AppDbContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ===============================
        // OBTENER VENTA POR ID
        // ===============================
        [HttpGet("{id}")]
        public async Task<ActionResult<Venta>> GetVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Detalles)
                    .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null)
                return NotFound();

            return venta;
        }

        // ===============================
        // VENTAS POR FECHA (NO CANCELADAS)
        // ===============================
        [HttpGet("por-fecha")]
        public async Task<IActionResult> VentasPorFecha(DateTime desde, DateTime hasta)
        {
            var ventas = await _context.Ventas
                .Where(v => v.Fecha >= desde &&
                            v.Fecha <= hasta &&
                            v.Estado != EstadoVenta.Cancelada)
                .ToListAsync();

            return Ok(ventas);
        }

        // ===============================
        // TOTAL VENDIDO (SIN CANCELADAS)
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
        // RESUMEN VENTAS (CON ESTADO)
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
        // CREAR VENTA
        // ===============================
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CrearVenta(VentasCreateDto dto)
        {
            // 1️ero OBTENER USUARIO LOGUEADO
            //var usuario = await _userManager.GetUserAsync(User);
            var usuario = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (usuario == null)
                return Unauthorized("Usuario no autenticado");

            // 2️do VALIDAR DTO
            if (dto == null || dto.Detalles == null || !dto.Detalles.Any())
                return BadRequest("La venta debe tener al menos un producto.");

            // 3️ero CREAR VENTA (UNA SOLA)
            var venta = new Venta
            {
                Fecha = DateTime.Now,
                Estado = EstadoVenta.Pendiente,   // siempre inicia pendiente
                UsuarioId = usuario,           // 👈 clave
                Detalles = new List<DetalleVenta>()
            };

            decimal total = 0;

            // 4️to PROCESAR DETALLES
            foreach (var d in dto.Detalles)
            {
                var producto = await _context.Productos
                    .FirstOrDefaultAsync(p => p.Id == d.ProductoId);

                if (producto == null)
                    return BadRequest("Producto inexistente");

                if (producto.Stock < d.Cantidad)
                    return BadRequest("Stock insuficiente");

                producto.Stock -= d.Cantidad;

                venta.Detalles.Add(new DetalleVenta
                {
                    ProductoId = producto.Id,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = producto.Precio
                });

                total += producto.Precio * d.Cantidad;
            }

            // 5️to TOTAL
            venta.Total = total;

            // 6️to GUARDAR
            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();

            // 7️to RESPUESTA
            return Ok(new
            {
                venta.Id,
                venta.Fecha,
                venta.Total,
                venta.Estado
            });
        }
        // ===============================
        // CAMBIAR ESTADO (CON VALIDACIÓN)
        // ===============================
        [HttpPut("cambiar-estado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, EstadoVenta nuevoEstado)
        {
            var venta = await _context.Ventas.FindAsync(id);

            if (venta == null)
                return NotFound();

            // No permitir modificar si ya está entregada
            if (venta.Estado == EstadoVenta.Entregada)
                return BadRequest("No se puede modificar una venta entregada.");

            // No permitir retroceder estado
            if ((int)nuevoEstado < (int)venta.Estado)
                return BadRequest("No se puede retroceder el estado.");

            // Cancelar solo si no esta entregada
            if (nuevoEstado == EstadoVenta.Cancelada &&
                venta.Estado == EstadoVenta.Entregada)
                return BadRequest("No se puede cancelar una venta entregada.");

            venta.Estado = nuevoEstado;

            await _context.SaveChangesAsync();

            return Ok(venta);
        }

       





    }
}


        // ANULAR VENTA

        /*[HttpPut("anular/{id}")]
        public async Task<IActionResult> AnularVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null)
                return NotFound();

            if (venta.Anulada)
                return BadRequest("La venta ya está anulada");

            // 🔄 DEVOLVER STOCK
            foreach (var d in venta.Detalles)
            {
                d.Producto.Stock += d.Cantidad;
            }

            venta.Anulada = true;
            // ❌ NO tocar venta.Total

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Venta anulada correctamente" });
        }

        // Para NO mostrar anuladas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ventas>>> GetVentas()
        {
            return await _context.Ventas
                .Where(v => !v.Anulada)
                .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
                .ToListAsync();
        }

            // GET: api/Ventas/{id}/detalle
            [HttpGet("{id}/detalle")]
            public async Task<IActionResult> GetDetalleVenta(int id)
            {
                var venta = await _context.Ventas
                    .Include(v => v.Detalles)
                        .ThenInclude(d => d.Producto)
                    .FirstOrDefaultAsync(v => v.Id == id);

                if (venta == null)
                    return NotFound("Venta no encontrada");

                var response = new
                {
                    venta.Id,
                    venta.Fecha,
                    venta.Total,
                    venta.Anulada,
                    Detalles = venta.Detalles.Select(d => new DetalleVentaDto
                    {
                        Producto = d.Producto?.Nombre ?? "(Producto eliminado)",
                        Cantidad = d.Cantidad,
                        PrecioUnitario = d.PrecioUnitario,
                        Subtotal = d.Cantidad * d.PrecioUnitario
                    }).ToList()
                };

                return Ok(response);
            }*/

    



