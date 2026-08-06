using System.ComponentModel.DataAnnotations.Schema;

namespace CarRentalSystem.Models
{
    public class Maintenance
    {
        public int Maintenane_ID { get; set; }
        public DateOnly ServiceDate { get; set; }
        public string Description { get; set; }
        public decimal Cost { get; set; }
        public string Status { get; set; }

        //Foreign key to the Car entity Many-to-One relationship
        [ForeignKey("Car")]
        public int Carid { get; set; }
        public Car Car { get; set; }



        
    }
}
