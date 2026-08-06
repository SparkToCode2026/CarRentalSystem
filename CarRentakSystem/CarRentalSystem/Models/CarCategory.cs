using System.Collections.Generic;

namespace CarRentalSystem.Models
{
    public class CarCategory
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal DefaultDailyRate { get; set; }

        
        public ICollection<Car> Cars { get; set; } = new List<Car>();
    }
}