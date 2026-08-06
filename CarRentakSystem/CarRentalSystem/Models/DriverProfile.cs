namespace CarRentalSystem.Models
{
    public class DriverProfile
    {
        public int DriverProfile_ID { get; set; }
        
        public int LicenseNumber { get; set; }

        public DateOnly LicenseExpiryDate { get; set; }
    }
}
