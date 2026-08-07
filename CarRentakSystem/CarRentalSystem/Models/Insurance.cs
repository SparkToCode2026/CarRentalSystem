using System.ComponentModel.DataAnnotations.Schema;
namespace CarRentalSystem.Models
{
    public class Insurance
    {
        public int Insurance_ID { get; set; }
        public string PolicyType { get; set; }
        public string Coverage { get; set; }
        public decimal Premium { get; set; }

        // many-to-one: an Insurance policy belongs to exactly one Rental
        [ForeignKey("Rental")]
        public int Rental_ID { get; set; }  
        public Rental Rental { get; set; }
    }
}
