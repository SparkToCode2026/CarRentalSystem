using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Models
{
    public class Maintenance
    {
        [Key]
        public int Maintenane_ID { get; set; }
        public DateOnly ServiceDate { get; set; }
        public string Description { get; set; }
        [Precision(10, 2)]
        public decimal Cost { get; set; }
        public string Status { get; set; }

        //Foreign key to the Car entity Many-to-One relationship
        [ForeignKey("Car")]
        public int Carid { get; set; }
        public Car Car { get; set; }



        
    }
}
