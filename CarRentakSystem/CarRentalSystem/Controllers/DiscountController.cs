using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Admin,staff")]
        [HttpPost("AddDiscount")]
        public IActionResult AddDiscount(Discount d)
        {
            if (string.IsNullOrWhiteSpace(d.Code))
            {
                return BadRequest(
                    "Discount code is required."
                );
            }

            if (d.Percent < 0 || d.Percent > 100)
            {
                return BadRequest(
                    "Discount percent must be between 0 and 100."
                );
            }

            bool codeExists =
                context.Discounts.Any(
                    x => x.Code == d.Code
                );

            if (codeExists)
            {
                return BadRequest(
                    "This discount code already exists."
                );
            }

            context.Discounts.Add(d);

            context.SaveChanges();

            return Ok(new
            {
                message = "Discount added successfully.",
                discountId = d.Discount_ID
            });
        }
        //2.PUT - Update full Discount
        [Authorize(Roles = "Admin,staff")]
        [HttpPut("UpdateDiscount")]
        public IActionResult UpdateDiscount(
    int discount_id,
    Discount newDiscount)
        {
            Discount? d =
                context.Discounts
                    .FirstOrDefault(
                        x => x.Discount_ID == discount_id
                    );

            if (d == null)
            {
                return NotFound(
                    "Discount not found."
                );
            }

            if (string.IsNullOrWhiteSpace(
                newDiscount.Code))
            {
                return BadRequest(
                    "Discount code is required."
                );
            }

            if (
                newDiscount.Percent < 0 ||
                newDiscount.Percent > 100
            )
            {
                return BadRequest(
                    "Discount percent must be between 0 and 100."
                );
            }

            bool duplicateCode =
                context.Discounts.Any(
                    x =>
                        x.Code == newDiscount.Code &&
                        x.Discount_ID != discount_id
                );

            if (duplicateCode)
            {
                return BadRequest(
                    "This discount code already exists."
                );
            }

            d.Code =
                newDiscount.Code;

            d.Percent =
                newDiscount.Percent;

            d.ExpiresOn =
                newDiscount.ExpiresOn;

            context.SaveChanges();

            return Ok(
                "Discount updated successfully."
            );
        }
        // 3.PATCH - Update Discount percentage 
        [Authorize(Roles = "Admin,staff")]
        [HttpPatch("UpdateDiscountPercent")]
        public IActionResult UpdateDiscountPercent(
    int discount_id,
    decimal newPercent)
        {
            Discount? d =
                context.Discounts
                    .FirstOrDefault(
                        x => x.Discount_ID == discount_id
                    );

            if (d == null)
            {
                return NotFound(
                    "Discount not found."
                );
            }

            if (
                newPercent < 0 ||
                newPercent > 100
            )
            {
                return BadRequest(
                    "Discount percent must be between 0 and 100."
                );
            }

            d.Percent =
                newPercent;

            context.SaveChanges();

            return Ok(
                "Discount percentage updated successfully."
            );
        }
        // 4.DELETE - Delete Discount by ID
        [Authorize(Roles = "Admin")]
        [HttpDelete("RemoveDiscount")]
        public IActionResult RemoveDiscount(
    int discount_id)
        {
            Discount? d =
                context.Discounts
                    .FirstOrDefault(
                        x => x.Discount_ID == discount_id
                    );

            if (d == null)
            {
                return NotFound(
                    "Discount not found."
                );
            }

            bool isUsed =
                context.RentalDiscounts.Any(
                    rd =>
                        rd.DiscountId ==
                        discount_id
                );

            if (isUsed)
            {
                return BadRequest(
                    "This discount cannot be deleted because it is used by rental records."
                );
            }

            context.Discounts.Remove(d);

            context.SaveChanges();

            return Ok(
                "Discount removed successfully."
            );
        }
        // 5.GET ALL - Include related RentalDiscounts
        [Authorize]
        [HttpGet("GetAllDiscount")]
        public IActionResult GetAllDiscount()
        {
            List<Discount> discounts = context.Discounts
                .Include(d => d.RentalDiscounts)
                .ToList();

            return Ok(discounts);
        }

        // 6.GET BY ID 
        [Authorize]
        [HttpGet("GetDiscount")]
        public IActionResult GetDiscount(int discount_id)
        {
            Discount? d = context.Discounts
                .Include(d => d.RentalDiscounts)
                .FirstOrDefault(d => d.Discount_ID == discount_id);

            if (d == null)
            {
                return NotFound("discount not found ");
                    
            }

            return Ok(d);
            
        }

        // 7.GET FILTER - filter by percetage 
        [Authorize]
        [HttpGet("GetByPercent")]
        public IActionResult GetByPercent(decimal percent)
        {
            List<Discount> discounts = context.Discounts
                .Where(d => d.Percent >= percent)
                .ToList();

            return Ok(discounts);
        }

        // 8.GET SORT - Sort by expiration date 
        [Authorize]
        [HttpGet("GetSortedByExpiry")]
        public IActionResult GetSortedByExpiry()
        {
            List<Discount> discounts = context.Discounts
                .OrderBy(d => d.ExpiresOn)
                .ToList();

            return Ok(discounts);
        }
    }
}
