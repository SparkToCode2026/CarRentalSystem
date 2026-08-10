using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
namespace CarRentalSystem.Models
{
    public class DamageReport
    {
        [Key]
        [JsonIgnore]
        public int DamageReport_ID { get; set; }

        public string Description { get; set; } = string.Empty;

        public DateTime ReportedAtUtc { get; set; }
        [Precision(10, 2)]
        public decimal RepairCost { get; set; }

        // Relationship: DamageReport -> Car (Many-to-One)
        // // A damage report belongs to one car.
        [ForeignKey("Car")] 
        public int CarId { get; set; }
        [JsonIgnore]
        public Car ? Car { get; set; } = null!;

        // Relationship: DamageReport -> Rental (Many-to-One)
        // A damage report belongs to one rental.
        [ForeignKey("Rental")]
        public int Rental_ID { get; set; }
        [JsonIgnore]
        public Rental? Rental { get; set; } = null!;

    }

}