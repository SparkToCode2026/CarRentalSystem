using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalSystem.Models
{
    public class Car
    {
        public int CarId { get; set; }
        public string PlateNumber { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public int year { get; set; }
        public decimal DailyRate { get; set; }
        public bool IsAvailable { get; set; }


        //rented_in relationship
        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();

        //Station relationship
        [ForeignKey("Branch")]
        public int Id { get; set; }
        public Branch Branch { get; set; } 


    }
}
