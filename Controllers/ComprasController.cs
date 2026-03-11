using AppMiniNegocio.Data;
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
        // Inyección de dependencia del contexto de la base de datos
        private readonly AppDbContext _context;

        // Constructor para inicializar el contexto
        public ComprasController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/Compras
        [HttpGet]
        public async Task<IActionResult> GetCompras()
        {
            return Ok(await _context.Compras.ToListAsync());
        }

        // POST: api/Compras
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CrearCompra(Compras compra)
        {
            if (compra == null)
                return BadRequest("La compra no puede estar vacía");

            if (compra.Total <= 0)
                return BadRequest("El total debe ser mayor a 0");

            
            compra.Fecha = DateTime.Now; // Establecer la fecha actual al crear una compra
            _context.Compras.Add(compra); // Agregar la compra al contexto
            await _context.SaveChangesAsync(); // Guardar los cambios en la base de datos
            return Ok(compra);
        }
    }
}

