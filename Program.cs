using AppMiniNegocio.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;


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



//builder.Services.AddEndpointsApiExplorer(); //  para explorar los endpoints de la API
//builder.Services.AddSwaggerGen(); // para generar la documentación de la API con Swagger

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingresá el token así: Bearer {tu token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
// Configuración de CORS...

// Configuración de CORS para permitir solicitudes desde cualquier origen (ajustar según necesidades)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});


//  configuracion de autenticador
/*builder.Services.AddAuthentication(options =>
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
});*/


//  configuracion de autenticador

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("La clave JWT no está configurada.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("El Issuer JWT no está configurado.");
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("El Audience JWT no está configurado.");

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
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };
});




var app = builder.Build();


// Si la aplicación está en desarrollo, se habilita Swagger para la documentación de la API.
// En producción, se configura un manejador de excepciones global para devolver un mensaje de error genérico en
// caso de errores internos del servidor,
// lo que mejora la seguridad al no exponer detalles tecnicos a los clientes.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler(appError =>
    {
        appError.Run(async context =>
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Ocurrió un error interno en el servidor."
            });
        });
    });
}

app.UseStaticFiles(); // para servir archivos estáticos como imágenes, CSS o JavaScript desde la carpeta wwwroot, lo que es útil para alojar recursos relacionados con la API o la interfaz de usuario.

app.UseCors("AllowAll"); // para habilitar la política de CORS que permite solicitudes desde cualquier origen, lo que es útil para el desarrollo y pruebas de la API desde diferentes clientes o dominios.


app.UseHttpsRedirection(); // para redirigir automáticamente las solicitudes HTTP a HTTPS, lo que mejora la seguridad de la aplicación al cifrar la comunicación entre el cliente y el servidor.

app.UseAuthentication(); // para habilitar la autenticación en la aplicación, lo que permite a los usuarios iniciar sesión y acceder a recursos protegidos según sus roles y permisos.
app.UseAuthorization(); // para habilitar la autorización, lo que garantiza que solo los usuarios autenticados con los permisos adecuados puedan acceder a ciertos endpoints o recursos en la API.

app.MapControllers(); // para mapear los controladores a las rutas de la API, lo que permite que las solicitudes HTTP se dirijan a los métodos correspondientes en los controladores.

app.Run(); // para iniciar la aplicación y comenzar a escuchar las solicitudes entrantes.
