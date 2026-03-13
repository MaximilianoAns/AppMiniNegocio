namespace AppMiniNegocio.Dtos
{
    public class CompraCreateDto
    {
        public List<CompraDetalleDto> Detalles { get; set; } = new();
    }
    public class CompraDetalleDto
    {
        public int ProductoId { get; set; }
        public int CantidadGramos { get; set; }
        public decimal PrecioTotal { get; set; }
    }
}
