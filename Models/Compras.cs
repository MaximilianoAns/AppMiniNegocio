namespace AppMiniNegocio.Models
{
    public class Compras
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; } = 0;

        public List<DetalleCompra> Detalles { get; set; } = new();
    }
}
