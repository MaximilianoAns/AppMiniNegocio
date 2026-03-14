using AppMiniNegocio.Data;
using AppMiniNegocio.Dtos;
using AppMiniNegocio.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Azure.Core.HttpHeader;

namespace AppMiniNegocio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CombosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CombosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Combos — todos (público, lo usa el catálogo)
        [HttpGet]
        public async Task<IActionResult> GetCombos()
        {
            var combos = await _context.Combos
                .OrderBy(c => c.Peso)
                .ToListAsync();
            return Ok(combos);
        }

        // GET: api/Combos/activos — solo activos (público, lo usa el carrito)
        [HttpGet("activos")]
        public async Task<IActionResult> GetCombosActivos()
        {
            var combos = await _context.Combos
                .Where(c => c.Activo)
                .OrderBy(c => c.Peso)
                .ToListAsync();
            return Ok(combos);
        }

        // POST: api/Combos — crear nuevo combo (solo admin)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CrearCombo(ComboCreateDto dto)
        {
            if (dto.Peso <= 0)
                return BadRequest("El peso debe ser mayor a 0.");

            if (dto.Precio <= 0)
                return BadRequest("El precio debe ser mayor a 0.");

            if (dto.MinimoGustos <= 0)
                return BadRequest("El mínimo de gustos debe ser mayor a 0.");

            // No permitir dos combos con el mismo peso
            var existe = await _context.Combos.AnyAsync(c => c.Peso == dto.Peso);
            if (existe)
                return BadRequest($"Ya existe un combo de {dto.Peso}gr.");

            var combo = new Combo
            {
                Peso = dto.Peso,
                Precio = dto.Precio,
                MinimoGustos = dto.MinimoGustos,
                Activo = true
            };

            _context.Combos.Add(combo);
            await _context.SaveChangesAsync();
            return Ok(combo);
        }

        // PUT: api/Combos/{id} — editar precio, mínimo gustos y estado (solo admin)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarCombo(int id, ComboUpdateDto dto)
        {
            var combo = await _context.Combos.FindAsync(id);
            if (combo == null)
                return NotFound("Combo no encontrado.");

            if (dto.Precio <= 0)
                return BadRequest("El precio debe ser mayor a 0.");

            if (dto.MinimoGustos <= 0)
                return BadRequest("El mínimo de gustos debe ser mayor a 0.");

            combo.Precio = dto.Precio;
            combo.MinimoGustos = dto.MinimoGustos;
            combo.Activo = dto.Activo;

            await _context.SaveChangesAsync();
            return Ok(combo);
        }

        // PATCH: api/Combos/{id}/toggle — activar o desactivar (solo admin)
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleActivo(int id)
        {
            var combo = await _context.Combos.FindAsync(id);
            if (combo == null)
                return NotFound("Combo no encontrado.");

            combo.Activo = !combo.Activo;
            await _context.SaveChangesAsync();
            return Ok(combo);
        }
    }
}