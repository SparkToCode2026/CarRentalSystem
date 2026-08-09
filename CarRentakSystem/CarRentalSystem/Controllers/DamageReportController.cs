using CarRentalSystem.Models;
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
        [HttpPost("AddDamageReport")]
        public IActionResult AddDamageReport(DamageReport d)
        {
            context.DamageReports.Add(d);
            context.SaveChanges();

            return Ok(d.DamageReport_ID);
        }
        
        // 2.PUT - Update full DamageReport
        [HttpPut("UpdateDamageReport")]
        public IActionResult UpdateDamageReport(int id, DamageReport newDamagereport)
        {
            DamageReport? d = context.DamageReports
                .FirstOrDefault(d => d.DamageReport_ID == id);

            if (d == null)
            {
                return NotFound("damage report not found ");
            }

            d.Description = newDamagereport.Description;
            d.ReportedAtUtc = newDamagereport.ReportedAtUtc;
            d.RepairCost = newDamagereport.RepairCost;
            d.CarId = newDamagereport.CarId;
            d.Rental_ID = newDamagereport.Rental_ID;

            context.SaveChanges();

            return Ok("damage report updated successfully");
        }
        // 3.PATCH -Update RepairCost only
        [HttpPatch("UpdateRepairCost")]
        public IActionResult UpdateRepairCost(int id, decimal newRepairCost)
        {
            DamageReport? d = context.DamageReports
                .FirstOrDefault(d => d.DamageReport_ID == id);

            if (d == null)
            {
                return NotFound("damage report not found ");
            }

            d.RepairCost = newRepairCost;

            context.SaveChanges();

            return Ok("repair cost updated successfully ");
        }
        
        // 4.DELETE -Delete DamageReport by ID
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
        
    }
}
