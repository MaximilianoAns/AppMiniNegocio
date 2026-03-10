using System.ComponentModel.DataAnnotations.Schema;

namespace AppMiniNegocio.Models
{
    [Table("VentaDetalles")]
    public class DetalleVenta
    {
        public int Id { get; set; }

        // 🔗 Relación con Venta
        public int VentaId { get; set; }
        public Venta Venta { get; set; }  // EL SIGNO ? ES DE QUE PUEDE SER NULL

        //  Relación con Producto
        public int ProductoId { get; set; }
        public Producto? Producto { get; set; } 

        //  Datos de la venta
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }

        //  Subtotal (NO se guarda en DB)
        public decimal Subtotal => Cantidad * PrecioUnitario;
    }
}
