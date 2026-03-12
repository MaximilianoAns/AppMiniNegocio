namespace AppMiniNegocio.Dtos
{
    public class VentaComboCreateDto
    {
        public List<ComboItemDto> Combos { get; set; } = new();

        // Representa un combo dentro del pedido (ej: 1 vaso de 650gr)
        public class ComboItemDto
        {
            public int Peso { get; set; }           // 650, 350 o 200
            public int Cantidad { get; set; }       // cuántos vasos de ese peso
            public decimal PrecioUnitario { get; set; }
            public List<string> Gustos { get; set; } = new(); // nombres de los gustos elegidos
        }
    }
}
