using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace CarRentalSystem.Models
{
    public class Rental
    {
        
        public int Rental_ID { get; set; }
        public DateOnly StartDate { get; set; } //= new DateOnly();
        public DateOnly DueDate { get; set; }
        public DateTime ReturnAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalDays { get; set; }
        
        // Relationship: Rental -> User (Many-to-One)
        // A rental belongs to one user.
        [ForeignKey("User")]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        // Relationship: Rental -> Car (Many-to-One)
        // A rental belongs to one car.
        [ForeignKey("Car")]
        public int CarId { get; set; }

        public Car Car { get; set; } = null!;
        
        // Relationship: Rental -> DriverProfile (Many-to-One)
        // A rental belongs to one driver profile.
        [ForeignKey("DriverProfile")]
        public int DriverProfileId { get; set; }
        public DriverProfile DriverProfile { get; set; } = null!;
        
        
        // Relationship: Rental -> PickupBranch (Many-to-One)
        // A rental is picked up from one branch.
        [ForeignKey("PickupBranch")]
        public int PickupBranchId { get; set; }

        public Branch PickupBranch { get; set; } = null!;
        
        // Relationship: Rental -> Payment (One-to-One)
        // One rental has one payment.
        public Payment Payment { get; set; } = null!;
        
        // Relationship: Rental -> Insurance (One-to-Many)
        // One rental can have multiple insurance records.

        public ICollection<Insurance> Isurances { get; set; } = new ICollection<Insurance>(); 
        
        // Relationship: Rental -> DamageReport (One-to-Many)
        // One rental can have multiple damage reports
        
        public ICollection<DamageReport> DamageReports { get; set; } = new List<DamageReport>();

        
        // Relationship: Rental -> RentalDiscount (One-to-Many)
        // One rental can have multiple rental discounts.
        public ICollection<RentalDiscount> RentalDiscounts { get; set; } = new List<RentalDiscount>();
    }
}
