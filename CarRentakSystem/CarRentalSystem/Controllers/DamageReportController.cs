using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("DamageReport")]
    public class DamageReportController : ControllerBase
    {
        private CarRentalSystemContext context;

        public DamageReportController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        // 1.POST - Create a new DamageReport
        [Authorize]
        [HttpPost("AddDamageReport")]
        public IActionResult AddDamageReport(DamageReport d)
        {
            bool carExists =
                context.Cars.Any(c => c.CarId == d.CarId);

            if (!carExists)
            {
                return BadRequest(
                    "The selected car does not exist."
                );
            }

            bool rentalExists =
                context.Rentals.Any(
                    r => r.Rental_ID == d.Rental_ID
                );

            if (!rentalExists)
            {
                return BadRequest(
                    "The selected rental does not exist."
                );
            }

            if (string.IsNullOrWhiteSpace(d.Description))
            {
                return BadRequest(
                    "Description is required."
                );
            }

            if (d.RepairCost < 0)
            {
                return BadRequest(
                    "Repair cost cannot be negative."
                );
            }

            context.DamageReports.Add(d);
            context.SaveChanges();

            return Ok(new
            {
                message = "Damage report added successfully.",
                damageReportId = d.DamageReport_ID
            });
        }

        // 2.PUT - Update full DamageReport
        [Authorize(Roles = "Admin,staff")]
        [HttpPut("UpdateDamageReport")]
        public IActionResult UpdateDamageReport(
    int id,
    DamageReport newDamageReport)
        {
            DamageReport? d =
                context.DamageReports
                    .FirstOrDefault(
                        d => d.DamageReport_ID == id
                    );

            if (d == null)
            {
                return NotFound(
                    "Damage report not found."
                );
            }

            bool carExists =
                context.Cars.Any(
                    c => c.CarId == newDamageReport.CarId
                );

            if (!carExists)
            {
                return BadRequest(
                    "The selected car does not exist."
                );
            }

            bool rentalExists =
                context.Rentals.Any(
                    r =>
                        r.Rental_ID ==
                        newDamageReport.Rental_ID
                );

            if (!rentalExists)
            {
                return BadRequest(
                    "The selected rental does not exist."
                );
            }

            if (string.IsNullOrWhiteSpace(
                newDamageReport.Description))
            {
                return BadRequest(
                    "Description is required."
                );
            }

            if (newDamageReport.RepairCost < 0)
            {
                return BadRequest(
                    "Repair cost cannot be negative."
                );
            }

            d.Description =
                newDamageReport.Description;

            d.ReportedAtUtc =
                newDamageReport.ReportedAtUtc;

            d.RepairCost =
                newDamageReport.RepairCost;

            d.CarId =
                newDamageReport.CarId;

            d.Rental_ID =
                newDamageReport.Rental_ID;

            context.SaveChanges();

            return Ok(
                "Damage report updated successfully."
            );
        }
        // 3.PATCH -Update RepairCost only
        [Authorize(Roles = "Admin,staff")]
        [HttpPatch("UpdateRepairCost")]
        public IActionResult UpdateRepairCost(
    int id,
    decimal newRepairCost)
        {
            DamageReport? d =
                context.DamageReports
                    .FirstOrDefault(
                        d => d.DamageReport_ID == id
                    );

            if (d == null)
            {
                return NotFound(
                    "Damage report not found."
                );
            }

            if (newRepairCost < 0)
            {
                return BadRequest(
                    "Repair cost cannot be negative."
                );
            }

            d.RepairCost =
                newRepairCost;

            context.SaveChanges();

            return Ok(
                "Repair cost updated successfully."
            );
        }

        // 4.DELETE -Delete DamageReport by ID
        [Authorize(Roles = "Admin")]
        [HttpDelete("RemoveDamageReport")]
        public IActionResult RemoveDamageReport(int id)
        {
            DamageReport? d = context.DamageReports
                .FirstOrDefault(d => d.DamageReport_ID == id);

            if (d == null)
            {
                return NotFound("damage report not found ");
            }

            context.DamageReports.Remove(d);
            context.SaveChanges();

            return Ok("damage report removed successfully ");
        }


        // 5.GET ALL - Include related Car and Rental
        [Authorize]
        [HttpGet("GetAllDamageReports")]
        public IActionResult GetAllDamageReports()
        {
            List<DamageReport> damageReports = context.DamageReports
                .Include(d => d.Car)
                .Include(d => d.Rental)
                .ToList();

            return Ok(damageReports);
        }
        // 6.GET BY ID -Include related Car and Rental
        [Authorize]
        [HttpGet("GetDamageReport")]
        public IActionResult GetDamageReport(int id)
        {
            DamageReport? d = context.DamageReports
                .Include(d => d.Car)
                .Include(d => d.Rental)
                .FirstOrDefault(d => d.DamageReport_ID == id);

            if (d == null)
            {
                return NotFound("damage report not found ");
            }

            return Ok(d);
        }

        // 7.FILTER - Filter by Car
        [Authorize]
        [HttpGet("GetByCar")]
        public IActionResult GetByCar(int carId)
        {
            List<DamageReport> damageReports = context.DamageReports
                .Where(d => d.CarId == carId)
                .ToList();

            return Ok(damageReports);
        }

        // 8.SORT -Sort by RepairCost
        [Authorize]
        [HttpGet("GetSortedByRepairCost")]
        public IActionResult GetSortedByRepairCost()
        {
            List<DamageReport> damageReports = context.DamageReports
                .OrderByDescending(d => d.RepairCost)
                .ToList();

            return Ok(damageReports);
        }
        
    }
}
