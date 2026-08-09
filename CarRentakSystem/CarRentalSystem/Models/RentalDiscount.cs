using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Models
{
    [PrimaryKey(nameof(Rental_ID), nameof(DiscountId))]
    public class RentalDiscount
    {
        [Precision(10, 2)]
        public decimal AppliedAmount { get; set; }

        [ForeignKey("Rental")]
        public int Rental_ID { get; set; }
        [JsonIgnore]
        public Rental ?Rental { get; set; }

        [ForeignKey("Discount")]
        public int DiscountId { get; set; }
        [JsonIgnore]
        public Discount? Discount { get; set; }
    }
}
