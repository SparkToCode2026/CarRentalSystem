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
        
    }
}
