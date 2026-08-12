using System.ComponentModel.DataAnnotations;

namespace CarRentalSystem.DTOs
{
    public class UserLoginDto
    {
        [Required]
        [EmailAddress]
        public string email { get; set; } = string.Empty;

        [Required]
        public string password { get; set; } = string.Empty;
    }
}