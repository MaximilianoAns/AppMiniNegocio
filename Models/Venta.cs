using AppMiniNegocio.Models.Enum;
using Microsoft.AspNetCore.Identity;

namespace AppMiniNegocio.Models
{
    using Microsoft.AspNetCore.Identity;

    public class Venta
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public EstadoVenta Estado { get; set; }

        public string UsuarioId { get; set; }
        public IdentityUser Usuario { get; set; }

        public List<DetalleVenta> Detalles { get; set; }
    }
}
