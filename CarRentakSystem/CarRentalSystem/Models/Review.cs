namespace CarRentalSystem.Models
{
    public class Review
    {
        public int Review_ID { get; set; }
        public DateOnly ReviewDate{ get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }

        //Foreign key to the Car entity Many-to-One relationship
        public int Carid { get; set; }
        public Car Car { get; set; }
        //foreign key to the User entity Many-to-One relationship
        public int Userid { get; set; }
        public User User { get; set; }
    }
}
