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
    public class ProductosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductosController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoReadDto>>> GetProductos()
        {
            var productos = await _context.Productos
                .Select(p => new ProductoReadDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Precio = p.Precio,
                    Stock = p.Stock
                })
                .ToListAsync();

            return Ok(productos);
        }

        // 🔹 GET: api/Productos/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoReadDto>> GetProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
                return NotFound();

            return Ok(new ProductoReadDto
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Precio = producto.Precio,
                Stock = producto.Stock
            });
        }

        // 🔹 POST: api/Productos
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ProductoReadDto>> PostProducto(ProductoCreateDto dto)
        {
            // 🔴 VALIDACIONES
            if (dto == null)
                return BadRequest("Producto inválido");

            if (string.IsNullOrWhiteSpace(dto.Nombre))
                return BadRequest("El nombre es obligatorio");

            if (dto.Precio <= 0)
                return BadRequest("El precio debe ser mayor a 0");

            if (dto.Stock < 0)
                return BadRequest("El stock no puede ser negativo");

            // ✅ MAPEO DTO → ENTIDAD
            var producto = new Producto
            {
                Nombre = dto.Nombre.Trim(),
                Precio = dto.Precio,
                Stock = dto.Stock
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            // ✅ RESPUESTA
            return CreatedAtAction(
                nameof(GetProducto),
                new { id = producto.Id },
                new ProductoReadDto
                {
                    Id = producto.Id,
                    Nombre = producto.Nombre,
                    Precio = producto.Precio,
                    Stock = producto.Stock
                }
            );
        }

        // 🔹 PUT: api/Productos/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, ProductoUpdateDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID incorrecto");

            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
                return NotFound();

            producto.Nombre = dto.Nombre;
            producto.Precio = dto.Precio;
            producto.Stock = dto.Stock;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 🔹 DELETE: api/Productos/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
                return NotFound();

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
