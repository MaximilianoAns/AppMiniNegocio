using AppMiniNegocio.Data;
using AppMiniNegocio.Dtos;
using AppMiniNegocio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppMiniNegocio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComprasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComprasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Compras
        [HttpGet]
        public async Task<IActionResult> GetCompras()
        {
            var compras = await _context.Compras
                .Include(c => c.Detalles)
                    .ThenInclude(d => d.Producto)
                .OrderByDescending(c => c.Fecha)
                .Select(c => new
                {
                    c.Id,
                    c.Fecha,
                    c.Total,
                    Detalles = c.Detalles.Select(d => new
                    {
                        d.Id,
                        d.ProductoId,
                        ProductoNombre = d.Producto.Nombre,
                        d.CantidadGramos,
                        d.PrecioTotal
                    }).ToList()
                })
                .ToListAsync();

            return Ok(compras);
        }

        // POST: api/Compras
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CrearCompra(CompraCreateDto dto)
        {
            if (dto == null || !dto.Detalles.Any())
                return BadRequest("La compra debe tener al menos un producto.");

            var compra = new Compras
            {
                Fecha = DateTime.Now,
                Detalles = new List<DetalleCompra>()
            };

            decimal total = 0;

            foreach (var item in dto.Detalles)
            {
                // Validar que el producto existe
                var producto = await _context.Productos.FindAsync(item.ProductoId);
                if (producto == null)
                    return BadRequest($"El producto con ID {item.ProductoId} no existe.");

                total += item.PrecioTotal;

                compra.Detalles.Add(new DetalleCompra
                {
                    ProductoId = item.ProductoId,
                    CantidadGramos = item.CantidadGramos,
                    PrecioTotal = item.PrecioTotal
                });

                // Sumar gramos al stock del producto
                producto.Stock += item.CantidadGramos;
            }

            compra.Total = total;

            _context.Compras.Add(compra);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                compra.Id,
                compra.Fecha,
                compra.Total,
                Detalles = compra.Detalles.Count
            });
        }
    }
}