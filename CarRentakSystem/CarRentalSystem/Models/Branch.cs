namespace CarRentalSystem.Models
{
    public class Branch
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
    public ICollection<Car> Cars { get; set; } = new List<Car>();

    public ICollection<Rental> PickupRentals { get; set; } = new List<Rental>();
}