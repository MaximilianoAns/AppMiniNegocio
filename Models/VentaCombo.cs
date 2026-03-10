using System.ComponentModel.DataAnnotations;

namespace AppMiniNegocio.Models
{
    public class VentaCombo
    {
        public int Id { get; set; }

        public int Peso { get; set; }
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }
        public decimal Subtotal { get; set; }

        public int VentaId { get; set; }
        public Venta Venta { get; set; }

        public List<VentaComboGusto> Gustos { get; set; }
    }
}
