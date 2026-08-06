using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace CarRentalSystem.Models
{
    public class Rental
    {
        
        public int Rental_ID { get; set; }
        public DateOnly StartDate { get; set; } //= new DateOnly();
        public DateOnly DueDate { get; set; }
        public DateTime ReturnAtUtc { get; set; }
        public string Status { get; set; } = string.Empty;
        public int TotalDays { get; set; }
        
    }
}
