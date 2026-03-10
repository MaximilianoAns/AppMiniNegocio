using AppMiniNegocio.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


// Este es el punto de entrada de la aplicación, donde se configura el host, los servicios y el pipeline de middleware.
var builder = WebApplication.CreateBuilder(args);


///  Registramos el contexto en el contenedor de dependencias
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuración de Identity para autenticación y autorización
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();


// Configuración para evitar ciclos de referencia en la serialización JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });



builder.Services.AddEndpointsApiExplorer(); //  para explorar los endpoints de la API
builder.Services.AddSwaggerGen(); // para generar la documentación de la API con Swagger

// Configuración de CORS para permitir solicitudes desde cualquier origen (ajustar según necesidades)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});


//  configuracion de autenticador
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
        )
    };
});




var app = builder.Build();

// Configure the HTTP request pipeline.
// Aquí se configura el pipeline de middleware que manejará las solicitudes HTTP entrantes. El orden de los middleware es importante, ya que determina cómo se procesan las solicitudes y respuestas.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(); // para servir archivos estáticos como imágenes, CSS o JavaScript desde la carpeta wwwroot, lo que es útil para alojar recursos relacionados con la API o la interfaz de usuario.

app.UseCors("AllowAll"); // para habilitar la política de CORS que permite solicitudes desde cualquier origen, lo que es útil para el desarrollo y pruebas de la API desde diferentes clientes o dominios.


app.UseHttpsRedirection(); // para redirigir automáticamente las solicitudes HTTP a HTTPS, lo que mejora la seguridad de la aplicación al cifrar la comunicación entre el cliente y el servidor.

app.UseAuthentication(); // para habilitar la autenticación en la aplicación, lo que permite a los usuarios iniciar sesión y acceder a recursos protegidos según sus roles y permisos.
app.UseAuthorization(); // para habilitar la autorización, lo que garantiza que solo los usuarios autenticados con los permisos adecuados puedan acceder a ciertos endpoints o recursos en la API.

app.MapControllers(); // para mapear los controladores a las rutas de la API, lo que permite que las solicitudes HTTP se dirijan a los métodos correspondientes en los controladores.

app.Run(); // para iniciar la aplicación y comenzar a escuchar las solicitudes entrantes.
