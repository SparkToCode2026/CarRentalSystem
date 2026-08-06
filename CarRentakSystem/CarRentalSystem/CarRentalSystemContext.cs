using CarRentalSystem.Models;

namespace CarRentalSystem
{
    public class CarRentalSystemContext
    {
        public DbSet<CarCategory> CarCategories { get; set; }

        public DbSet<Branch> Branches { get; set; }  
    }
}

