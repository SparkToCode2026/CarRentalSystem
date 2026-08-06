namespace CarRentalSystem.Models
{
    public class User
    {
        public enum UserRole
        {
            Admin,
            Customer,
            staff
        }
        public string userId { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string passwordHash { get; set; }
        public UserRole role { get; set; }
        public DateTime CreatedAtUtc { get; set; }

        //books relationship
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();


    }
}
