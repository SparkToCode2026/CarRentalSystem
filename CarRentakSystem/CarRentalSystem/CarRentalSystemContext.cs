using CarRentalSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem
{
    public class CarRentalSystemContext : DbContext
    {
        public CarRentalSystemContext(
            DbContextOptions<CarRentalSystemContext> options)
            : base(options)
        {
        }

        public DbSet<CarCategory> CarCategories { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<Rental> Rentals { get; set; }
        public DbSet<Payments> Payments { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<DamageReport> DamageReports { get; set; }
        public DbSet<Maintenance> Maintenances { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<DriverProfile> DriverProfiles { get; set; }
        public DbSet<Insurance> Insurances { get; set; }
        public DbSet<RentalDiscount> RentalDiscounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Car)
                .WithMany(c => c.Rentals)
                .HasForeignKey(r => r.CarId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Rental>()
                .HasOne(r => r.User)
                .WithMany(u => u.Rentals)
                .HasForeignKey(r => r.userId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Rental>()
                .HasOne(r => r.DriverProfile)
                .WithMany(d => d.Rentals)
                .HasForeignKey(r => r.DriverProfile_ID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Rental>()
                .HasOne(r => r.Branch)
                .WithMany(b => b.PickupRentals)
                .HasForeignKey(r => r.BranchId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}