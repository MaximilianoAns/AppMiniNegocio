using AppMiniNegocio.Models.Enum;
using Microsoft.AspNetCore.Identity;

namespace AppMiniNegocio.Models
{
    using Microsoft.AspNetCore.Identity;
    using static Azure.Core.HttpHeader;

    public class Venta
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public EstadoVenta Estado { get; set; }

        public string UsuarioId { get; set; } = string.Empty;
        public IdentityUser? Usuario { get; set; }

        public List<DetalleVenta> Detalles { get; set; } = new();

        // Combos con gustos(ventas desde el carrito del cliente)
        public List<VentaCombo> Combos { get; set; } = new();
    }
}
