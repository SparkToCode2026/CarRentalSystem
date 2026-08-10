using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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
        [Key]
        public int userId { get; set; }
        [Required]
        public string name { get; set; }
        [Required]
        public string email { get; set; }
        [Required]
        public string passwordHash { get; set; }
        [Required]
        public UserRole role { get; set; }
        [Required]
        public DateTime CreatedAtUtc { get; set; }

        // One-to-many: a User makes many Rentals
        [JsonIgnore]
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();

        // One-to-one: a User may have one DriverProfile 
        [JsonIgnore]
        public DriverProfile ? DriverProfile { get; set; }  // Navigation property 

        // One-to-many: a User writes many Reviews
        [JsonIgnore]
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
