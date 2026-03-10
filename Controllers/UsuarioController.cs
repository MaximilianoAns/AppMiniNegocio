using AppMiniNegocio.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AppMiniNegocio.Controllers
{
    [ApiController]
    [Route("api/usuario")]
    public class UsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuarioController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("perfil")]
        public IActionResult Perfil()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email))
            {
                return Unauthorized();
            }

            var usuario = _context.Users
                .Where(u => u.Email == email)
                .Select(u => new
                {
                    nombre = u.UserName,
                    email = u.Email
                })
                .FirstOrDefault();

            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            return Ok(usuario);
        }
    }
}
