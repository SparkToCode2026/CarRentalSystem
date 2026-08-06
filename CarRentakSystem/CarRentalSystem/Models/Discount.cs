namespace CarRentalSystem.Models;

    public class Discount
    {
        public int Discount_ID { get; set; }

        public string Code { get; set; } = string.Empty;

        public decimal Percent { get; set; }

        public DateTime ExpiresOn { get; set; }
        
        // Relationship: Discount -> RentalDiscount (One-to-Many)
        // // One discount can be applied to many rental discounts.
        public ICollection<RentalDiscount> RentalDiscounts { get; set; } = new List<RentalDiscount>();
        
    }
