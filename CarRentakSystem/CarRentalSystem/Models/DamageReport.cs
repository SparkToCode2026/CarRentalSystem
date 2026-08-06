using System.ComponentModel.DataAnnotations.Schema;
namespace CarRentalSystem.Models
{
    public class DamageReport
    {
        public int DamageReport_ID { get; set; }

        public string Description { get; set; } = string.Empty;

        public DateTime ReortedAtUtc { get; set; }

        public decimal RepairCost { get; set; }

        // Relationship: DamageReport -> Car (Many-to-One)
        // // A damage report belongs to one car.
        [ForeignKey("Car")] public int CarId { get; set; }

        public Car Car { get; set; } = null!;

        // Relationship: DamageReport -> Rental (Many-to-One)
        // A damage report belongs to one rental.
        public int Rental_ID { get; set; }

        public Rental Rental { get; set; } = null!;

    }

}