using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Models
{
    public class Car
    {
        [Key]
        public int CarId { get; set; }
        
        public string PlateNumber { get; set; }
        
        public string Make { get; set; }
        
        public string Model { get; set; }
        
        public int year { get; set; }
        
        [Precision(10, 2)]
        public decimal DailyRate { get; set; }
        
        public bool IsAvailable { get; set; }


        // One-to-many: a Car is rented out across many Rentals
        [JsonIgnore]
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
        // Many-to-one: many Cars belong to one CarCategory
        [ForeignKey("CarCategory")]
        public int CarCategoryId { get; set; }
        [JsonIgnore]
        public CarCategory ? CarCategory { get; set; }  // Navigation property 

        // Many-to-one: many Cars are stationed at one Branch
        [ForeignKey("Branch")]
        public int BranchId { get; set; }
        [JsonIgnore]
        public Branch ? Branch { get; set; }

        // One-to-many: a Car is serviced across many Maintenance records
        [JsonIgnore]
        public ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();

        // One-to-many: a Car can have many DamageReports
        [JsonIgnore]
        public ICollection<DamageReport> DamageReports { get; set; } = new List<DamageReport>();

        // One-to-many: a Car can have many reviews
        [JsonIgnore]
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

    }
}
