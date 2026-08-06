namespace CarRentalSystem.Models
{
    public class Review
    {
        public int Review_ID { get; set; }
        public DateOnly ReviewDate{ get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }
    }
}
