using AppMiniNegocio.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager; 
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _config;

    public AuthController(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration config)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _config = config;
    }

    // =========================
    // REGISTRO
    // =========================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new IdentityUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // Asignar rol "User" por defecto al registrarse
        if (!await _roleManager.RoleExistsAsync("User"))
            await _roleManager.CreateAsync(new IdentityRole("User"));

        await _userManager.AddToRoleAsync(user, "User");

        return Ok("Usuario registrado correctamente");
    }

    // =========================
    // LOGIN (JWT)
    // =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
            return Unauthorized("Credenciales incorrectas");

        var passwordOk = await _userManager.CheckPasswordAsync(user, dto.Password);

        if (!passwordOk)
            return Unauthorized("Credenciales incorrectas");

        // Obtener roles del usuario
        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        // CLAIMS — incluimos el rol
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Role, role)
        };

        // KEY
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // TOKEN
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"]!,
            audience: _config["Jwt:Audience"]!,
            claims: claims,
            expires: DateTime.Now.AddMinutes(
                double.Parse(_config["Jwt:DurationInMinutes"]!)
            ),
            signingCredentials: creds
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token)
        });
    }

    // =========================
    // CREAR ROL ADMIN (usar una sola vez)
    // =========================
    [HttpPost("seed-admin")]
    public async Task<IActionResult> SeedAdmin([FromBody] RegisterDto dto)
    {
        // Crear rol Admin si no existe
        if (!await _roleManager.RoleExistsAsync("Admin"))
            await _roleManager.CreateAsync(new IdentityRole("Admin"));

        // Buscar si el usuario ya existe
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            user = new IdentityUser { UserName = dto.Email, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
        }

        // Asignar rol Admin
        if (!await _userManager.IsInRoleAsync(user, "Admin"))
            await _userManager.AddToRoleAsync(user, "Admin");

        return Ok($"{dto.Email} ahora es Admin");
    }
}