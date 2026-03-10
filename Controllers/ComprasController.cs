using AppMiniNegocio.Data;
using AppMiniNegocio.Models;
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

        [HttpGet]
        public async Task<IActionResult> GetCompras()
        {
            return Ok(await _context.Compras.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> CrearCompra(Compras compra)
        {
            compra.Fecha = DateTime.Now;

            _context.Compras.Add(compra);
            await _context.SaveChangesAsync();

            return Ok(compra);
        }
    }
}
