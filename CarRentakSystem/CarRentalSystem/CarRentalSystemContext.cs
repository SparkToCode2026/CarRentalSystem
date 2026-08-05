using CarRentalSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem
{
    public class CarRentalSystemContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Car> Car { get; set; }

    }
}
