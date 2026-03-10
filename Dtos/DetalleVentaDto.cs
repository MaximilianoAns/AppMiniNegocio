namespace AppMiniNegocio.Dtos
{
    public class DetalleVentaDto
    {

        public string Producto { get; set; } = "";
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}
