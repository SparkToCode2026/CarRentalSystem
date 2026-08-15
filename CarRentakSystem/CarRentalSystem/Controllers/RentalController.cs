using CarRentalSystem.Models;
using CarRentalSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Rental")]
    public class RentalController : ControllerBase
    {
        private readonly CarRentalSystemContext context;
        private readonly IEmailService emailService;

        public RentalController(
            CarRentalSystemContext _context,
            IEmailService _emailService)
        {
            context = _context;
            emailService = _emailService;
        }


        // ========================================
        // 1. ADD RENTAL
        // POST /Rental/AddRental
        // ========================================
        [Authorize]
        [HttpPost("AddRental")]
        public async Task<IActionResult> AddRental(
            Rental rental)
        {
            // Check dates
            if (rental.DueDate <= rental.StartDate)
            {
                return BadRequest(
                    "Due date must be after start date."
                );
            }


            // Check Car exists
            bool carExists =
                await context.Cars
                    .AnyAsync(c =>
                        c.CarId == rental.CarId);

            if (!carExists)
            {
                return BadRequest(
                    "Selected car does not exist."
                );
            }


            // Check User exists
            bool userExists =
                await context.Users
                    .AnyAsync(u =>
                        u.userId == rental.userId);

            if (!userExists)
            {
                return BadRequest(
                    "Selected user does not exist."
                );
            }


            // Check Branch exists
            bool branchExists =
                await context.Branches
                    .AnyAsync(b =>
                        b.Id == rental.BranchId);

            if (!branchExists)
            {
                return BadRequest(
                    "Selected branch does not exist."
                );
            }


            // Check Driver Profile exists
            bool driverExists =
                await context.DriverProfiles
                    .AnyAsync(d =>
                        d.DriverProfile_ID ==
                        rental.DriverProfile_ID);

            if (!driverExists)
            {
                return BadRequest(
                    "Selected driver profile does not exist."
                );
            }


            // Calculate days automatically
            rental.TotalDays =
                (rental.DueDate.Date -
                 rental.StartDate.Date).Days;


            // Default status
            if (string.IsNullOrWhiteSpace(rental.Status))
            {
                rental.Status = "Active";
            }


            context.Rentals.Add(rental);

            await context.SaveChangesAsync();


            // ====================================
            // Load related data for email
            // ====================================

            var savedRental =
                await context.Rentals

                    .Include(r => r.User)

                    .Include(r => r.Car)

                    .Include(r => r.Branch)

                    .FirstOrDefaultAsync(
                        r =>
                            r.Rental_ID ==
                            rental.Rental_ID
                    );


            if (savedRental == null)
            {
                return NotFound(
                    "Rental was not found after saving."
                );
            }


            // ====================================
            // EMAIL
            // ====================================

            try
            {
                if (
                    !string.IsNullOrWhiteSpace(
                        savedRental.User?.email
                    )
                )
                {
                    string emailBody = $"""
                        <h2>Rental Confirmation</h2>

                        <p>Hello {savedRental.User.name},</p>

                        <p>Your car rental has been successfully confirmed.</p>

                        <h3>Rental Details</h3>

                        <p><strong>Rental ID:</strong>
                        {savedRental.Rental_ID}</p>

                        <p><strong>Car:</strong>
                        {savedRental.Car?.Make}
                        {savedRental.Car?.Model}</p>

                        <p><strong>Pickup Branch:</strong>
                        {savedRental.Branch?.Name}</p>

                        <p><strong>Start Date:</strong>
                        {savedRental.StartDate:dd MMM yyyy}</p>

                        <p><strong>Due Date:</strong>
                        {savedRental.DueDate:dd MMM yyyy}</p>

                        <p>Thank you for using RoadKey.</p>
                        """;


                    await emailService.SendEmailAsync(
                        savedRental.User.email,
                        "Rental Confirmation - RoadKey",
                        emailBody
                    );
                }
            }
            catch (Exception ex)
            {
                // Rental stays saved even if email fails
                Console.WriteLine(
                    "EMAIL ERROR: " + ex.Message
                );
            }


            return Ok(new
            {
                message =
                    "Rental created successfully.",

                rentalId =
                    savedRental.Rental_ID
            });
        }


        // ========================================
        // 2. UPDATE RENTAL
        // PUT /Rental/UpdateRental?id=1
        // ========================================
        [Authorize(Roles = "Admin,staff")]
        [HttpPut("UpdateRental")]
        public async Task<IActionResult> UpdateRental(
            int id,
            Rental newRental)
        {
            var rental =
                await context.Rentals
                    .FirstOrDefaultAsync(
                        r =>
                            r.Rental_ID == id
                    );


            if (rental == null)
            {
                return NotFound(
                    "Rental record not found."
                );
            }


            if (
                newRental.DueDate <=
                newRental.StartDate
            )
            {
                return BadRequest(
                    "Due date must be after start date."
                );
            }


            // Check related IDs
            bool carExists =
                await context.Cars
                    .AnyAsync(c =>
                        c.CarId ==
                        newRental.CarId);

            bool userExists =
                await context.Users
                    .AnyAsync(u =>
                        u.userId ==
                        newRental.userId);

            bool branchExists =
                await context.Branches
                    .AnyAsync(b =>
                        b.Id ==
                        newRental.BranchId);

            bool driverExists =
                await context.DriverProfiles
                    .AnyAsync(d =>
                        d.DriverProfile_ID ==
                        newRental.DriverProfile_ID);


            if (
                !carExists ||
                !userExists ||
                !branchExists ||
                !driverExists
            )
            {
                return BadRequest(
                    "One or more selected related records do not exist."
                );
            }


            rental.StartDate =
                newRental.StartDate;

            rental.DueDate =
                newRental.DueDate;

            rental.ReturnAtUtc =
                newRental.ReturnAtUtc;

            rental.Status =
                newRental.Status;

            rental.TotalDays =
                (newRental.DueDate.Date -
                 newRental.StartDate.Date).Days;

            rental.CarId =
                newRental.CarId;

            rental.userId =
                newRental.userId;

            rental.BranchId =
                newRental.BranchId;

            rental.DriverProfile_ID =
                newRental.DriverProfile_ID;


            await context.SaveChangesAsync();


            return Ok(
                "Rental updated successfully."
            );
        }


        // ========================================
        // 3. UPDATE STATUS
        // PATCH
        // /Rental/UpdateRentalStatus?id=1&status=Completed
        // ========================================
        [Authorize(Roles = "Admin,staff")]
        [HttpPatch("UpdateRentalStatus")]
        public async Task<IActionResult> UpdateRentalStatus(
            int id,
            string status)
        {
            var rental =
                await context.Rentals
                    .FirstOrDefaultAsync(
                        r =>
                            r.Rental_ID == id
                    );


            if (rental == null)
            {
                return NotFound(
                    "Rental record not found."
                );
            }


            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(
                    "Status is required."
                );
            }


            rental.Status = status;


            await context.SaveChangesAsync();


            return Ok(
                "Status updated successfully."
            );
        }


        // ========================================
        // 4. DELETE
        // DELETE /Rental/DeleteRental?id=1
        // ========================================
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteRental")]
        public async Task<IActionResult> DeleteRental(
            int id)
        {
            var rental =
                await context.Rentals
                    .FirstOrDefaultAsync(
                        r =>
                            r.Rental_ID == id
                    );


            if (rental == null)
            {
                return NotFound(
                    "Rental record not found."
                );
            }


            try
            {
                context.Rentals.Remove(rental);

                await context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return BadRequest(
                    "This rental cannot be deleted because it has related records."
                );
            }


            return Ok(
                "Rental deleted successfully."
            );
        }


        // ========================================
        // 5. GET ALL
        // GET /Rental/GetAllRentals
        // ========================================
        [Authorize]
        [HttpGet("GetAllRentals")]
        public async Task<IActionResult> GetAllRentals()
        {
            var rentals =
                await context.Rentals

                    .Select(r => new
                    {
                        rental_ID =
                            r.Rental_ID,

                        startDate =
                            r.StartDate,

                        dueDate =
                            r.DueDate,

                        returnAtUtc =
                            r.ReturnAtUtc,

                        status =
                            r.Status,

                        totalDays =
                            r.TotalDays,


                        carId =
                            r.CarId,

                        carName =
                            r.Car != null
                                ? r.Car.Make + " " +
                                  r.Car.Model
                                : null,

                        plateNumber =
                            r.Car != null
                                ? r.Car.PlateNumber
                                : null,


                        userId =
                            r.userId,

                        customerName =
                            r.User != null
                                ? r.User.name
                                : null,


                        branchId =
                            r.BranchId,

                        branchName =
                            r.Branch != null
                                ? r.Branch.Name
                                : null,


                        driverProfile_ID =
                            r.DriverProfile_ID,

                        driverLicenseNumber =
                            r.DriverProfile != null
                                ? r.DriverProfile
                                    .LicenseNumber
                                : 0
                    })

                    .ToListAsync();


            return Ok(rentals);
        }


        // ========================================
        // 6. GET BY ID
        // GET /Rental/GetRentalById?id=1
        // ========================================
        [Authorize]
        [HttpGet("GetRentalById")]
        public async Task<IActionResult> GetRentalById(
            int id)
        {
            var rental =
                await context.Rentals

                    .Where(r =>
                        r.Rental_ID == id)

                    .Select(r => new
                    {
                        rental_ID =
                            r.Rental_ID,

                        startDate =
                            r.StartDate,

                        dueDate =
                            r.DueDate,

                        returnAtUtc =
                            r.ReturnAtUtc,

                        status =
                            r.Status,

                        totalDays =
                            r.TotalDays,


                        carId =
                            r.CarId,

                        carName =
                            r.Car != null
                                ? r.Car.Make + " " +
                                  r.Car.Model
                                : null,

                        plateNumber =
                            r.Car != null
                                ? r.Car.PlateNumber
                                : null,


                        userId =
                            r.userId,

                        customerName =
                            r.User != null
                                ? r.User.name
                                : null,


                        branchId =
                            r.BranchId,

                        branchName =
                            r.Branch != null
                                ? r.Branch.Name
                                : null,


                        driverProfile_ID =
                            r.DriverProfile_ID,

                        driverLicenseNumber =
                            r.DriverProfile != null
                                ? r.DriverProfile
                                    .LicenseNumber
                                : 0
                    })

                    .FirstOrDefaultAsync();


            if (rental == null)
            {
                return NotFound(
                    "Rental record not found."
                );
            }


            return Ok(rental);
        }


        // ========================================
        // 7. FILTER
        // GET /Rental/FilterRentals
        // ========================================
        [Authorize]
        [HttpGet("FilterRentals")]
        public async Task<IActionResult> FilterRentals(
            string? status,
            int? carId,
            int? userId)
        {
            var query =
                context.Rentals
                    .AsQueryable();


            if (!string.IsNullOrWhiteSpace(status))
            {
                query =
                    query.Where(
                        r =>
                            r.Status == status
                    );
            }


            if (carId.HasValue)
            {
                query =
                    query.Where(
                        r =>
                            r.CarId ==
                            carId.Value
                    );
            }


            if (userId.HasValue)
            {
                query =
                    query.Where(
                        r =>
                            r.userId ==
                            userId.Value
                    );
            }


            var rentals =
                await query

                    .Select(r => new
                    {
                        rental_ID =
                            r.Rental_ID,

                        startDate =
                            r.StartDate,

                        dueDate =
                            r.DueDate,

                        status =
                            r.Status,

                        totalDays =
                            r.TotalDays,

                        carId =
                            r.CarId,

                        carName =
                            r.Car != null
                                ? r.Car.Make + " " +
                                  r.Car.Model
                                : null,

                        userId =
                            r.userId,

                        customerName =
                            r.User != null
                                ? r.User.name
                                : null
                    })

                    .ToListAsync();


            return Ok(rentals);
        }


        // ========================================
        // 8. ANALYTICS / SORT
        // GET /Rental/RentalAnalytics
        // ========================================
        [Authorize]
        [HttpGet("RentalAnalytics")]
        public async Task<IActionResult> RentalAnalytics()
        {
            int totalRentals =
                await context.Rentals.CountAsync();


            int totalDaysRented =
                totalRentals > 0

                    ? await context.Rentals
                        .SumAsync(
                            r => r.TotalDays
                        )

                    : 0;


            double averageDays =
                totalRentals > 0

                    ? await context.Rentals
                        .AverageAsync(
                            r => r.TotalDays
                        )

                    : 0;


            var rentals =
                await context.Rentals

                    .OrderByDescending(
                        r => r.TotalDays
                    )

                    .Select(r => new
                    {
                        rental_ID =
                            r.Rental_ID,

                        startDate =
                            r.StartDate,

                        dueDate =
                            r.DueDate,

                        status =
                            r.Status,

                        totalDays =
                            r.TotalDays,

                        carId =
                            r.CarId,

                        userId =
                            r.userId
                    })

                    .ToListAsync();


            return Ok(new
            {
                totalRentals,
                totalDaysRented,
                averageDaysPerRental =
                    averageDays,

                rentals
            });
        }
    }
}