namespace AppMiniNegocio.Models
{
    public class DetalleCompra
    {
        public int Id { get; set; }

        public int CompraId { get; set; }
        public Compras Compra { get; set; } = null!;

        public int ProductoId { get; set; }
        public Producto Producto { get; set; } = null!;

        public int CantidadGramos { get; set; }
        public decimal PrecioTotal { get; set; }
    }
}
