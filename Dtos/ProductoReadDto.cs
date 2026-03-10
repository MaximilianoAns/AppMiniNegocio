using System.ComponentModel.DataAnnotations;

namespace AppMiniNegocio.Dtos
{
    public class ProductoReadDto
    {
        //DTO PARA LEER PRODUCTOS
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int Stock { get; set; }
    }
}

