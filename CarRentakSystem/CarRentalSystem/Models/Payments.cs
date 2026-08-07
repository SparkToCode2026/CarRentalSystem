using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalSystem.Models
{
    public class Payments
    {

        public int Payment_ID { get; set; }
        public decimal Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public DateTime PaidAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;

        //FK with Rental model (Many-to-one)
        [ForeignKey("Rental")]
        public int Rental_ID { get; set; }
        public Rental Rental { get; set; } = null!;
    }
}
