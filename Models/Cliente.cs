using Microsoft.AspNetCore.Identity;

namespace AppMiniNegocio.Models
{
    public class Cliente
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Localidad { get; set; }
        public string Direccion { get; set; }
        public string Telefono { get; set; }

        public string UsuarioId { get; set; }
        public IdentityUser Usuario { get; set; }
       
    }
}
