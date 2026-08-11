using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.DTOs
{
    public class UserRegisterDto // DTO for user registration
    {
        [Required]
        public string name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string email { get; set; } = string.Empty;

        [Required]
        public string password { get; set; } = string.Empty;
    }
}
