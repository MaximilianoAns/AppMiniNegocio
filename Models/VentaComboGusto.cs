namespace AppMiniNegocio.Models
{
    public class VentaComboGusto
    {
        public int Id { get; set; }
        public string NombreGusto { get; set; }

        public int VentaComboId { get; set; }
        public VentaCombo VentaCombo { get; set; }
    }
}
