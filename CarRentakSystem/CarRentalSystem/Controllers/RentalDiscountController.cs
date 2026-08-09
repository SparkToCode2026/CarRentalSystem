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
        // 2. PUT - Update the full RentalDiscount
        [HttpPut("UpdateRentalDiscount")]
        public IActionResult UpdateRentalDiscount(int rentalId,
            int DiscountId,
            RentalDiscount newRentalDiscount)
        {
            RentalDiscount? rentalDiscount = context.RentalDiscounts
                .FirstOrDefault(rd =>
                rd.Rental_ID == rentalId &&
                rd.DiscountId == DiscountId);
            rentalDiscount.AppliedAmount = newRentalDiscount.AppliedAmount;
            if(rentalDiscount == null)
            {
                return NotFound("rental discount not found");
            }
            rentalDiscount.AppliedAmount = newRentalDiscount.AppliedAmount;
            context.SaveChanges();
            return Ok("rental discount updated successfully");


        }






    }
}