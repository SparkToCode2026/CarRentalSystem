namespace CarRentalSystem.Models;

    public class Discount
    {
        public int Discount_ID { get; set; }

        public string Code { get; set; }

        public decimal Percent { get; set; }

        public DateTime ExpiresOn { get; set; }
    }
