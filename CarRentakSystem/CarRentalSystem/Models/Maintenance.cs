namespace CarRentalSystem.Models
{
    public class Maintenance
    {
        public int Maintenane_ID { get; set; }
        public DateOnly ServiceDate { get; set; }
        public string Description { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; }
    }
}
