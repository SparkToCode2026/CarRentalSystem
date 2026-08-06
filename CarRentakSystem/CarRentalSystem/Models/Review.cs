namespace CarRentalSystem.Models
{
    public class Review
    {
        public int Review_ID { get; set; }
        public DateOnly ReviewDate{ get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }

        //Foreign key to the Car entity Many-to-One relationship
        public ICollection<Car> Cars { get; set; } = new List<Car>();
        //foreign key to the User entity Many-to-One relationship
        public ICollection<User> Users { get; set; } = new List<User>();    
    }
}
