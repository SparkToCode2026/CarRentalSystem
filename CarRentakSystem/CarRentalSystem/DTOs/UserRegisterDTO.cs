using static CarRentalSystem.Models.User;

namespace CarRentalSystem.DTOs
{
    public class UserRegisterDto
    {
        public string name { get; set; }
        public string email { get; set; }
        public string password { get; set; } // password input by user
        public UserRole role { get; set; }
    }
}