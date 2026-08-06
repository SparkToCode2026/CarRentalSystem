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

        //Foreign Key Relationships
        public ICollection<Car> Cars { get; set; } = new List<Car>();               //FK: Rental → Car (Many-to-One)
        public ICollection<User> Users { get; set; } = new List<User>();          //FK: Rental → User (Many-to-One)
        public ICollection<Branch> Branches { get; set; } = new List<Branch>();  //FK: Rental → Branch (Many-to-One)
        public ICollection<Payments> Payments { get; set; } = new List<Payments>();               //FK: Rental → Payments (One-to-One)
        //public ICollection<Insurance> Insurances { get; set; } = new List<Insurance>();        //FK: Rental → Insurance (One-to-Many)  
        //public ICollection<DamageReport> DamageReports { get; set; } = new List<DamageReport>();              //FK: Rental → DamageReport (One-to-Many)
        //Public ICollection<RentalDiscount> RentalDiscounts { get; set; } = new List<RentalDiscount>();       //FK: Rental → RentalDiscount (One-to-Many)
        //public IList<DriverProfile> DriverProfiles { get; set; } = new List<DriverProfile>();               // FK: Rental → DriverProfile (Many-to-One)
        
    }
}
//============IMPORTANT NOTE:==========
//needs to be updated later since this branch dosent have the insurance, damage report, rental discount, and driver profile models yet.