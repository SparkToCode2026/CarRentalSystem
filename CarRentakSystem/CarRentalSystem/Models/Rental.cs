using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Serialization;


namespace CarRentalSystem.Models
{
    public class Rental
    {
        [Key]
        [JsonIgnore]
        public int Rental_ID { get; set; }
        public DateTime StartDate { get; set; } //= new DateOnly();
        public DateTime DueDate { get; set; }
        public DateTime ReturnAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalDays { get; set; }


        //Foreign Key Relationships

        // FK: Rental → Car (Many-to-One): one rental is for exactly one car
        [ForeignKey("Car")]
        public int CarId { get; set; }
        [JsonIgnore]
        public Car? Car { get; set; } = null!;

        // FK: Rental → User (Many-to-One): one rental belongs to exactly one user

        [ForeignKey("User")]
        public int userId { get; set; }
        [JsonIgnore]
        public User? User { get; set; } = null!;

        // FK: Rental → Branch (Many-to-One): one rental is tied to exactly one branch

        [ForeignKey("Branch")]
        public int BranchId { get; set; }
        [JsonIgnore]
        public Branch? Branch { get; set; } = null!;

        //FK: Rental → DriverProfile 
        [ForeignKey("DriverProfile")]
        public int DriverProfile_ID { get; set; }
        [JsonIgnore]
        public DriverProfile? DriverProfile { get; set; } = null!;

        [JsonIgnore]
        public ICollection<Payments> Payments { get; set; } = new List<Payments>();                            //FK: Rental → Payment (One-to-Many)
        [JsonIgnore]
        public ICollection<Insurance> Insurances { get; set; } = new List<Insurance>();                        //FK: Rental → Insurance (One-to-Many)  
        [JsonIgnore]
        public ICollection<DamageReport> DamageReports { get; set; } = new List<DamageReport>();              //FK: Rental → DamageReport (One-to-Many)
        [JsonIgnore]
        public ICollection<RentalDiscount> RentalDiscounts { get; set; } = new List<RentalDiscount>();       //FK: Rental → RentalDiscount (One-to-Many)
    }
}