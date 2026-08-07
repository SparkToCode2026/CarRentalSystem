using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Models
{
    public class CarCategory
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        [Precision(10, 2)]
        public decimal DefaultDailyRate { get; set; }

        
        public ICollection<Car> Cars { get; set; } = new List<Car>();
    }
}