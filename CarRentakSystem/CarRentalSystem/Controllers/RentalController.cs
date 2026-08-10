using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalSystem.Models;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Rental")]
    public class RentalController : ControllerBase
    {
        private readonly CarRentalSystemContext context;

        public RentalController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        // 1. POST: Clean JSON request body
        [HttpPost("AddRental")]
        public IActionResult AddRental(CreateRentalDto dto)
        {
            Rental rental = new Rental
            {
                StartDate = DateOnly.FromDateTime(dto.StartDate),
                DueDate = DateOnly.FromDateTime(dto.DueDate),
                ReturnAtUtc = dto.ReturnAtUtc,
                Status = dto.Status,
                TotalDays = dto.TotalDays,
                Car_ID = dto.Car_ID,
                User_ID = dto.User_ID,
                Branch_ID = dto.Branch_ID,
                DriverProfile_ID = dto.DriverProfile_ID
            };

            context.Rentals.Add(rental);
            context.SaveChanges();

            return Ok(rental.Rental_ID);
        }

        // 2. PUT: Clean full update body
        [HttpPut("UpdateRental")]
        public IActionResult UpdateRental(int id, UpdateRentalDto dto)
        {
            Rental rental = context.Rentals.FirstOrDefault(r => r.Rental_ID == id);
            if (rental == null)
            {
                return NotFound("Rental record not found");
            }

            rental.StartDate = DateOnly.FromDateTime(dto.StartDate);
            rental.DueDate = DateOnly.FromDateTime(dto.DueDate);
            rental.ReturnAtUtc = dto.ReturnAtUtc;
            rental.Status = dto.Status;
            rental.TotalDays = dto.TotalDays;
            rental.Car_ID = dto.Car_ID;
            rental.User_ID = dto.User_ID;
            rental.Branch_ID = dto.Branch_ID;
            rental.DriverProfile_ID = dto.DriverProfile_ID;

            context.SaveChanges();
            return Ok("Updated successfully");
        }

        // 3. PATCH: Quick single-field status update
        [HttpPatch("UpdateRentalStatus")]
        public IActionResult UpdateRentalStatus(int id, string status)
        {
            Rental rental = context.Rentals.FirstOrDefault(r => r.Rental_ID == id);
            if (rental == null)
            {
                return NotFound("Rental record not found");
            }

            rental.Status = status;
            context.SaveChanges();

            return Ok("Status updated successfully");
        }

        // 4. DELETE: Remove record by ID
        [HttpDelete("DeleteRental")]
        public IActionResult DeleteRental(int id)
        {
            Rental rental = context.Rentals.FirstOrDefault(r => r.Rental_ID == id);
            if (rental == null)
            {
                return NotFound("Rental record not found");
            }

            context.Rentals.Remove(rental);
            context.SaveChanges();

            return Ok("Deleted successfully");
        }

        // 5. GET ALL: Fetch all records with related entities
        [HttpGet("GetAllRentals")]
        public IActionResult GetAllRentals()
        {
            var rentals = context.Rentals
                .Include(r => r.Car)
                .Include(r => r.User)
                .Include(r => r.Branch)
                .ToList();

            return Ok(rentals);
        }

        // 6. GET BY ID: Fetch single rental
        [HttpGet("GetRentalById")]
        public IActionResult GetRentalById(int id)
        {
            Rental rental = context.Rentals
                .Include(r => r.Car)
                .Include(r => r.User)
                .Include(r => r.Branch)
                .FirstOrDefault(r => r.Rental_ID == id);

            if (rental == null)
            {
                return NotFound("Rental record not found");
            }

            return Ok(rental);
        }

        // 7. GET (Filter): Filter by status, car, or user
        [HttpGet("FilterRentals")]
        public IActionResult FilterRentals(string? status, int? carId, int? userId)
        {
            var query = context.Rentals.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            if (carId.HasValue)
            {
                query = query.Where(r => r.Car_ID == carId.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(r => r.User_ID == userId.Value);
            }

            return Ok(query.ToList());
        }

        // 8. GET (Analytics): Aggregated rental statistics
        [HttpGet("RentalAnalytics")]
        public IActionResult RentalAnalytics()
        {
            var sortedRentals = context.Rentals
                .OrderByDescending(r => r.TotalDays)
                .ToList();

            var totalRentals = context.Rentals.Count();
            var totalDaysRented = totalRentals > 0 ? context.Rentals.Sum(r => r.TotalDays) : 0;
            var averageDays = totalRentals > 0 ? context.Rentals.Average(r => r.TotalDays) : 0;

            return Ok(new
            {
                TotalRentals = totalRentals,
                TotalDaysRented = totalDaysRented,
                AverageDaysPerRental = averageDays,
                Rentals = sortedRentals
            });
        }
    }

    // Clean DTOs for Swagger Input Blocks
    public class CreateRentalDto
    {
        public DateTime StartDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime ReturnAtUtc { get; set; }
        public string Status { get; set; } = "Active";
        public int TotalDays { get; set; }
        public int Car_ID { get; set; }
        public int User_ID { get; set; }
        public int Branch_ID { get; set; }
        public int DriverProfile_ID { get; set; }
    }

    public class UpdateRentalDto : CreateRentalDto { }
}