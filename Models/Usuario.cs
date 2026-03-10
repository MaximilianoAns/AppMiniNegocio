namespace AppMiniNegocio.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public virtual string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string Rol { get; set; } = "Cliente";
        public bool Activo { get; set; } = true;

        public Cliente? Cliente { get; set; }
    }
}
