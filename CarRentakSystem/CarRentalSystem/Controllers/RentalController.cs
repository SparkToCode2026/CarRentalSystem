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
        public IActionResult AddRental(Rental rental)
        {
            context.Rentals.Add(rental);
            context.SaveChanges();

            return Ok(rental.Rental_ID);
        }

        [HttpPut("UpdateRental")]
        public IActionResult UpdateRental(int id, Rental newRental)
        {
            Rental? rental = context.Rentals
                .FirstOrDefault(r => r.Rental_ID == id);

            if (rental == null)
            {
                return NotFound("Rental record not found");
            }

            // Check dates first
            if (newRental.DueDate <= newRental.StartDate)
            {
                return BadRequest("Due date must be after start date");
            }

            rental.StartDate = newRental.StartDate;
            rental.DueDate = newRental.DueDate;
            rental.ReturnAtUtc = newRental.ReturnAtUtc;
            rental.Status = newRental.Status;

            // Calculate TotalDays automatically
            rental.TotalDays =
                (newRental.DueDate.Date - newRental.StartDate.Date).Days;

            rental.CarId = newRental.CarId;
            rental.userId = newRental.userId;
            rental.BranchId = newRental.BranchId;
            rental.DriverProfile_ID = newRental.DriverProfile_ID;

            context.SaveChanges();

            return Ok("Updated successfully");
        }

        // 3. PATCH: Quick single-field status update
        [HttpPatch("UpdateRentalStatus")]
        public IActionResult UpdateRentalStatus(int id, string status)
        {
            Rental? rental = context.Rentals
                .FirstOrDefault(r => r.Rental_ID == id);

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
            Rental? rental = context.Rentals
                .FirstOrDefault(r => r.Rental_ID == id);

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
                .Include(r => r.DriverProfile)
                .ToList();

            return Ok(rentals);
        }

        // 6. GET BY ID: Fetch single rental
        [HttpGet("GetRentalById")]
        public IActionResult GetRentalById(int id)
        {
            Rental? rental = context.Rentals
                .Include(r => r.Car)
                .Include(r => r.User)
                .Include(r => r.Branch)
                .Include(r => r.DriverProfile)
                .FirstOrDefault(r => r.Rental_ID == id);

            if (rental == null)
            {
                return NotFound("Rental record not found");
            }

            return Ok(rental);
        }

        // 7. GET (Filter): Filter by status, car, or user
        [HttpGet("FilterRentals")]
        public IActionResult FilterRentals(
            string? status,
            int? carId,
            int? userId)
        {
            var query = context.Rentals.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            if (carId.HasValue)
            {
                query = query.Where(r => r.CarId == carId.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(r => r.userId == userId.Value);
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

            int totalRentals = context.Rentals.Count();

            int totalDaysRented = totalRentals > 0
                ? context.Rentals.Sum(r => r.TotalDays)
                : 0;

            double averageDays = totalRentals > 0
                ? context.Rentals.Average(r => r.TotalDays)
                : 0;

            return Ok(new
            {
                TotalRentals = totalRentals,
                TotalDaysRented = totalDaysRented,
                AverageDaysPerRental = averageDays,
                Rentals = sortedRentals
            });
        }
    }

    
}