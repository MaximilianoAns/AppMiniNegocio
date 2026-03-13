namespace AppMiniNegocio.Dtos
{
    public class ComboCreateDto
    {
        public int Peso { get; set; }
        public decimal Precio { get; set; }
        public int MinimoGustos { get; set; }
    }

    public class ComboUpdateDto
    {
        public decimal Precio { get; set; }
        public int MinimoGustos { get; set; }
        public bool Activo { get; set; }
    }
}
