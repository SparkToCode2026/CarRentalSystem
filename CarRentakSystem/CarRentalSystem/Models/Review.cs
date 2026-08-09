using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CarRentalSystem.Models
{
    public class Review
    {
        [Key]
        [JsonIgnore]
        public int Review_ID { get; set; }
        public DateTime ReviewDate { get; set; }
        public string Comment { get; set; }
        public int Rating { get; set; }

        //Foreign key to the Car entity Many-to-One relationship
        [ForeignKey("Car")]
        public int Carid { get; set; }
        [JsonIgnore]
        public Car ? Car { get; set; }
        //foreign key to the User entity Many-to-One relationship
        [ForeignKey("User")]
        public int Userid { get; set; }
        [JsonIgnore]
        public User ? User { get; set; }
    }
}
