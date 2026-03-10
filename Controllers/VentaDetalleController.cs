using AppMiniNegocio.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace AppMiniNegocio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentaDetalleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VentaDetalleController(AppDbContext context)
        {
            _context = context;
        }

        /*// GET api/VentaDetalle/venta/29
        [HttpGet("venta/{ventaId}")]
        public async Task<IActionResult> GetByVenta(int ventaId)
        {
            var detalles = await _context.VentaDetalles
                .Where(d => d.VentaId == ventaId)
                .ToListAsync();

            return Ok(detalles);
        }*/

        [HttpGet("venta/{ventaId}")]
        async Task<IActionResult> GetByVenta(int ventaId)
        {
            var detalles = await _context.VentaDetalles
                .Include(d => d.Producto)
                .Where(d => d.VentaId == ventaId)
                .Select(d => new
                {
                    productoNombre = d.Producto.Nombre,
                    cantidad = d.Cantidad,
                    precioUnitario = d.PrecioUnitario,
                    subtotal = d.Cantidad * d.PrecioUnitario
                })
                .ToListAsync();

            return Ok(detalles);
        }



        // Endpoint de prueba
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("VentaDetalle API OK");
        }
    }
}

