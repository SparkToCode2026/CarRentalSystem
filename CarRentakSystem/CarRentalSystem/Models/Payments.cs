namespace CarRentalSystem.Models
{
    public class Payments
    {

        public int Payment_ID { get; set; }
        public string Amount { get; set; }
        public string Method { get; set; }
        public DateTime PaidAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
