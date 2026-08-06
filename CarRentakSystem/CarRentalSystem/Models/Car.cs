using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalSystem.Models
{
    public class Car
    {
        public int CarId { get; set; }
        public string PlateNumber { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public int year { get; set; }
        public decimal DailyRate { get; set; }
        public bool IsAvailable { get; set; }


        // One-to-many: a Car is rented out across many Rentals
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
        // Many-to-one: many Cars belong to one CarCategory
        [ForeignKey("CarCategory")]
        public int CarCategoryId { get; set; } 
        public CarCategory CarCategory { get; set; }  // Navigation property 

        // Many-to-one: many Cars are stationed at one Branch
        [ForeignKey("Branch")]
        public int BranchId { get; set; }
        public Branch Branch { get; set; }

        // One-to-many: a Car is serviced across many Maintenance records
        public ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();

        // One-to-many: a Car can have many DamageReports
        public ICollection<DamageReport> DamageReports { get; set; } = new List<DamageReport>();

        // One-to-many: a Car can have many reviews
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

    }
}
