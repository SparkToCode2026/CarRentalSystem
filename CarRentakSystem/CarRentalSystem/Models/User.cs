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

        // One-to-many: a User makes many Rentals
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();

        // One-to-one: a User may have one DriverProfile 
        public DriverProfile DriverProfile_ID { get; set; }  // Navigation property 

        // One-to-many: a User writes many Reviews
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
