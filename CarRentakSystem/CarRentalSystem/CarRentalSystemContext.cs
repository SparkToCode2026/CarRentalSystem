using CarRentalSystem.Models;
using Microsoft.EntityFrameworkCore;


namespace CarRentalSystem
{
    public class CarRentalSystemContext : DbContext
    {
        public DbSet<CarCategory> CarCategories { get; set; }
        public DbSet<Branch> Branches { get; set; }  
        public DbSet<User> Users { get; set; }
        public DbSet<Car> Car { get; set; }
        public DbSet<Rental> Rentals { get; set; }
        public DbSet<Payments> Payments { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<DamageReport> DamageReports { get; set; }

        public DbSet<Maintenance> Maintenances { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<DriverProfile> DriverProfiles { get; set; }
        public DbSet<Insurance> Insurance { get; set; }
    }
}

