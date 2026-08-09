using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalSystem.Models;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("RentalDiscount")]
    public class RentalDiscountController : ControllerBase
    {
        private CarRentalSystemContext context;

        public RentalDiscountController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        // POST - Create a new RentalDiscount record
        [HttpPost("CreateRentalDiscount")]
        public IActionResult CreateRentalDiscount([FromBody] RentalDiscount rentalDiscount)
        {
            context.RentalDiscounts.Add(rentalDiscount);
            context.SaveChanges();
            return Ok(new
            {
                rentalDiscount.Rental_ID,
                rentalDiscount.DiscountId
            });
        }





    }
}