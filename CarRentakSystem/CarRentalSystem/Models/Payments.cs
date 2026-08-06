namespace CarRentalSystem.Models
{
    public class Payments
    {

        public int Payment_ID { get; set; }
        public string Amount { get; set; }
        public string Method { get; set; }
        public DateTime PaidAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;

        //FK with Rental model (one-to-one)
        public IList<Rental> Rentals { get; set; } = new List<Rental>();
    }
}
