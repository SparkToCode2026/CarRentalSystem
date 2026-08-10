using System.Text.Json.Serialization;

namespace CarRentalSystem.Models
{
    public class Branch
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        [JsonIgnore]
        public ICollection<Car> Cars { get; set; } = new List<Car>();
        [JsonIgnore]
        public ICollection<Rental> PickupRentals { get; set; } = new List<Rental>();
    }
}