using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Serialization;


namespace CarRentalSystem.Models
{
    public class Rental
    {
        [Key]
        public int Rental_ID { get; set; }
        public DateOnly StartDate { get; set; } //= new DateOnly();
        public DateOnly DueDate { get; set; }
        public DateTime ReturnAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalDays { get; set; }


        //Foreign Key Relationships

        // FK: Rental → Car (Many-to-One): one rental is for exactly one car
        [ForeignKey("Car")]
        public int Car_ID { get; set; }
        public Car Car { get; set; } = null!;

        // FK: Rental → User (Many-to-One): one rental belongs to exactly one user

        [ForeignKey("User")]
        public int User_ID { get; set; }
        public User User { get; set; } = null!;

        // FK: Rental → Branch (Many-to-One): one rental is tied to exactly one branch

        [ForeignKey("Branch")]
        public int Branch_ID { get; set; }
        public Branch Branch { get; set; } = null!;

        //FK: Rental → DriverProfile 
        [ForeignKey("DriverProfile")]
        public int DriverProfile_ID { get; set; }
        public DriverProfile DriverProfile { get; set; } = null!;

        //
        public ICollection<Payments> Payments { get; set; } = new List<Payments>();                            //FK: Rental → Payment (One-to-Many)
        public ICollection<Insurance> Insurances { get; set; } = new List<Insurance>();                        //FK: Rental → Insurance (One-to-Many)  
        public ICollection<DamageReport> DamageReports { get; set; } = new List<DamageReport>();              //FK: Rental → DamageReport (One-to-Many)
        public ICollection<RentalDiscount> RentalDiscounts { get; set; } = new List<RentalDiscount>();       //FK: Rental → RentalDiscount (One-to-Many)
    }
}