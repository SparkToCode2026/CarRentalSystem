using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Models
{
    public class CarCategory
    {
        [JsonIgnore]
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        [Precision(10, 2)]
        public decimal DefaultDailyRate { get; set; }

        [JsonIgnore]
        public ICollection<Car> Cars { get; set; } = new List<Car>();
    }
}