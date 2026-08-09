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
        //2.PUT - Update full Discount
        [HttpPut("UpdateDiscount")]
        public IActionResult UpdateDiscout(int discount_id, Discount newDiscount)
        {
            Discount? d = context.Discounts
                .FirstOrDefault(d => d.Discount_ID == discount_id);

            if (d == null)
            {
                return NotFound("discount not found");
            }

            d.Code = newDiscount.Code;
            d.Percent = newDiscount.Percent;
            d.ExpiresOn = newDiscount.ExpiresOn;

            context.SaveChanges();

            return Ok("discount updated successfully");
            
        }
        // 3.PATCH - Update Discount percentage 
        [HttpPatch("UpdateDiscountPercent")]
        public IActionResult UpdateDiscountPercent(int discount_id, decimal newPercent)
        {
            Discount? d = context.Discounts
                .FirstOrDefault(d => d.Discount_ID == discount_id);

            if (d == null)
            {
                return NotFound("discount not found ");
            }

            d.Percent = newPercent;

            context.SaveChanges();

            return Ok("discount percentage updated successfully");
        }
        // 4.DELETE - Delete Discount by ID
        [HttpDelete("RemoveDiscount")]
        public IActionResult RemoveDiscount(int discount_id)
        {
            Discount? d = context.Discounts
                .FirstOrDefault(d => d.Discount_ID == discount_id);

            if (d == null)
            {
                return NotFound("discount not found ");
            }

            context.Discounts.Remove(d);
            context.SaveChanges();

            return Ok("discount removed successfully ");
        }
        // 5.GET ALL - Include related RentalDiscounts
        [HttpGet("GetAllDiscount")]
        public IActionResult GetAllDiscount()
        {
            List<Discount> discounts = context.Discounts
                .Include(d => d.RentalDiscounts)
                .ToList();

            return Ok(discounts);
        }
        
    }
}
