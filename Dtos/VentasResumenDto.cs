using AppMiniNegocio.Models.Enum;

namespace AppMiniNegocio.Dtos
{
    public class VentasResumenDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }

        public EstadoVenta Estado { get; set; }
    }
}
