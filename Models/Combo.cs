namespace AppMiniNegocio.Models
{
    public class Combo
    {
        public int Id { get; set; }
        public int Peso { get; set; }
        public decimal Precio { get; set; }
        public int MinimoGustos { get; set; }
        public bool Activo { get; set; } = true;
    }
}
