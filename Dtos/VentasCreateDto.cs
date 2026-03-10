namespace AppMiniNegocio.Dtos
{
    public class VentasCreateDto
    {

        public List<VentaCreateDetalleDto> Detalles { get; set; } = new List<VentaCreateDetalleDto>();

        public class VentaCreateDetalleDto
        {
            public int ProductoId { get; set; }
            public int Cantidad { get; set; }
        }
    }
}
