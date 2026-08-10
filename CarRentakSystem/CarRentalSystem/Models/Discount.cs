using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Models;

    public class Discount
    {
        [Key]
        public int Discount_ID { get; set; }

        public string Code { get; set; } = string.Empty;
        [Precision(5, 2)]
        public decimal Percent { get; set; }

        public DateTime ExpiresOn { get; set; }

    // Relationship: Discount -> RentalDiscount (One-to-Many)
    // // One discount can be applied to many rental discounts.
    [JsonIgnore]
    public ICollection<RentalDiscount> RentalDiscounts { get; set; } = new List<RentalDiscount>();
        
    }
