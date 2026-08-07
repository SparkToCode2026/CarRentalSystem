using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalSystem.Models
{
    public class DriverProfile
    {
        [Key]
        public int DriverProfile_ID { get; set; }
        
        public int LicenseNumber { get; set; }

        public DateOnly LicenseExpiryDate { get; set; }

        // One-to-one: a DriverProfile belongs to exactly one User
        [ForeignKey("User")]
        public int userId { get; set; } 
        public User User { get; set; } 

        // One-to-many: a DriverProfile drives many Rentals
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();

    }
}
