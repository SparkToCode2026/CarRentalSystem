using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CarRentalSystem.Models
{
    public class Payments
    {
        [Key]
        public int Payment_ID { get; set; }
        [Precision(10, 2)]
        public decimal Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public DateTime PaidAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;

        //FK with Rental model (Many-to-one)
        [ForeignKey("Rental")]
        public int Rental_ID { get; set; }
        [JsonIgnore]
        public Rental Rental { get; set; } = null!;
    }
}
