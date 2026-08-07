using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalSystem.Models
{
    public class Review
    {
        [Key]
        public int Review_ID { get; set; }
        public DateOnly ReviewDate{ get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }

        //Foreign key to the Car entity Many-to-One relationship
        [ForeignKey("Car")]
        public int Carid { get; set; }
        public Car Car { get; set; }
        //foreign key to the User entity Many-to-One relationship
        [ForeignKey("User")]
        public int Userid { get; set; }
        public User User { get; set; }
    }
}
