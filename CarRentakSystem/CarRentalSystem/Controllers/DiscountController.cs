using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Discount")]
    public class DiscountController : ControllerBase
    {
        private CarRentalSystemContext context;

        public DiscountController(CarRentalSystemContext _context)
        {
            context = _context;
        }
        //1.POST - Create a New Discount 
        [HttpPost("AddDiscount")]
        public IActionResult AddDiscount(Discount d)
        {
            context.Discounts.Add(d);
            context.SaveChanges();

            return Ok(d.Discount_ID);
        }
        
    }
}
