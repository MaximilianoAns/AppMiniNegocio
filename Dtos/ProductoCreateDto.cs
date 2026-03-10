using System.ComponentModel.DataAnnotations;


namespace AppMiniNegocio.Dtos
{
    public class ProductoCreateDto
    {
        //DTO PARA CREAR PRODUCTOS

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = String.Empty;

        [Range(1, 1000000)]
        public decimal Precio { get; set; }

        [Range(0, 10000)]
        public int Stock { get; set; }
    }
}
