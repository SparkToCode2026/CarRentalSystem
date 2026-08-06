namespace CarRentalSystem.Models;

    public class Discount
    {
        public int Id { get; set; }

        public string Code { get; set; }

        public decimal Percent { get; set; }

        public DateTime ExpiresOn { get; set; }
    }
