using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CarRentalSystem.Models
{
    public class DriverProfile
    {
        [Key]
        [JsonIgnore]
        public int DriverProfile_ID { get; set; }
        
        public int LicenseNumber { get; set; }

        public DateTime LicenseExpiryDate { get; set; }

        // One-to-one: a DriverProfile belongs to exactly one User
        [ForeignKey("User")]
        public int userId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }

        // One-to-many: a DriverProfile drives many Rentals
        [JsonIgnore]
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();

    }
}
