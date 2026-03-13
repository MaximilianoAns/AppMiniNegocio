using AppMiniNegocio.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using static Azure.Core.HttpHeader;

namespace AppMiniNegocio.Data
{
    public class AppDbContext : IdentityDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
            //  Este paso conecta Entity Framework con SQL Server y habilita la inyección de dependencias del DbContex en la API.
            public DbSet<Producto> Productos { get; set; }

            // pasamos a tener el DbSet de Compras para mostrar las compras en la base de datos            
            public DbSet<Compras> Compras { get; set; }

            public DbSet<DetalleCompra> CompraDetalles { get; set; }

            // pasamos a tener el DbSet de Ventas para mostrar las compras en la base de datos
            public DbSet<Venta> Ventas { get; set; }

            // pasamos a tener el DbSet de Usuarios para mostrar los usuarios en la base de datos, aunque no es necesario porque Identity ya maneja esto,
            // pero lo dejamos por si queremos hacer consultas directas a la tabla de usuarios
           
            public DbSet<Cliente> Clientes { get; set; } 
            
            // DbSet para las entidades relacionadas con combos
            public DbSet<VentaCombo> VentaCombos { get; set; }
            
            // DbSet para la entidad que relaciona combos con gustos
            public DbSet<VentaComboGusto> VentaComboGustos { get; set; }
            
            // DbSet para el detalle de venta, que relaciona ventas con productos
            public DbSet<DetalleVenta> VentaDetalles { get; set; }

            public DbSet<Combo> Combos { get; set; }






        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<DetalleVenta>()
                .HasOne(d => d.Venta)
                .WithMany(v => v.Detalles)
                .HasForeignKey(d => d.VentaId);

            modelBuilder.Entity<DetalleVenta>()
                .HasOne(d => d.Producto)
                .WithMany()
                .HasForeignKey(d => d.ProductoId);

            modelBuilder.Entity<Venta>()
                .Property(v => v.Estado)
                .HasConversion<string>();

            //  RELACIÓN VENTA → IDENTITY USER
            modelBuilder.Entity<Venta>()
                .HasOne(v => v.Usuario)
                .WithMany()
                .HasForeignKey(v => v.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            //  RELACIÓN CLIENTE → IDENTITY USER
            modelBuilder.Entity<Cliente>()
                .HasOne(c => c.Usuario)
                .WithOne()
                .HasForeignKey<Cliente>(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Producto>()
                .Property(p => p.Precio)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Venta>()
                .Property(v => v.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DetalleVenta>()
                .Property(d => d.PrecioUnitario)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Compras>()
                .Property(c => c.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<VentaCombo>()
                .Property(vc => vc.PrecioUnitario)
                .HasPrecision(18, 2);

            modelBuilder.Entity<VentaCombo>()
                .Property(vc => vc.Subtotal)
                .HasPrecision(18, 2);


            // Relación Compras → CompraDetalle
            modelBuilder.Entity<DetalleCompra>()
                .HasOne(d => d.Compra)
                .WithMany(c => c.Detalles)
                .HasForeignKey(d => d.CompraId);

            modelBuilder.Entity<DetalleCompra>()
                .HasOne(d => d.Producto)
                .WithMany()
                .HasForeignKey(d => d.ProductoId);

            modelBuilder.Entity<DetalleCompra>()
                .Property(d => d.PrecioTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Compras>()
                .Property(c => c.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Combo>()
            .Property(c => c.Precio)
            .HasPrecision(18, 2);
        }
    }
}
