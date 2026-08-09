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

        // 3. PATCH - Update a specific field
        [HttpPatch("UpdateAppliedAmount")]
        public IActionResult UpdateAppliedAmount(
    int rentalId,
    int discountId,
    decimal newAmount)
        {
            RentalDiscount? rentalDiscount = context.RentalDiscounts
                .FirstOrDefault(rd =>
                    rd.Rental_ID == rentalId &&
                    rd.DiscountId == discountId);

            if (rentalDiscount == null)
            {
                return NotFound("rental discount not found");
            }

            rentalDiscount.AppliedAmount = newAmount;

            context.SaveChanges();

            return Ok("applied amount updated successfully");
        }
        // 4. DELETE - Delete using the composite key
        [HttpDelete("RemoveRentalDiscount")]
        public IActionResult RemoveRentalDiscount(
            int rentalId,
            int discountId)
        {
            RentalDiscount? rentalDiscount = context.RentalDiscounts
                .FirstOrDefault(rd =>
                    rd.Rental_ID == rentalId &&
                    rd.DiscountId == discountId);

            if (rentalDiscount == null)
            {
                return NotFound("rental discount not found");
            }

            context.RentalDiscounts.Remove(rentalDiscount);
            context.SaveChanges();

            return Ok("removed successfully");
        }

        // 5. GET ALL + Include related data
        [HttpGet("GetAllRentalDiscounts")]
        public IActionResult GetAllRentalDiscounts()
        {
            List<RentalDiscount> rentalDiscounts =
                context.RentalDiscounts
                    .Include(rd => rd.Rental)
                    .Include(rd => rd.Discount)
                    .ToList();

            return Ok(rentalDiscounts);
        }

        // 6. GET BY composite key
        [HttpGet("GetRentalDiscount")]
        public IActionResult GetRentalDiscount(
            int rentalId,
            int discountId)
        {
            RentalDiscount? rentalDiscount =
                context.RentalDiscounts
                    .Include(rd => rd.Rental)
                    .Include(rd => rd.Discount)
                    .FirstOrDefault(rd =>
                        rd.Rental_ID == rentalId &&
                        rd.DiscountId == discountId);

            if (rentalDiscount == null)
            {
                return NotFound("rental discount not found");
            }

            return Ok(rentalDiscount);
        }

        // 7. FILTER - Using Where()
        [HttpGet("GetByRental")]
        public IActionResult GetByRental(int rentalId)
        {
            List<RentalDiscount> rentalDiscounts =
                context.RentalDiscounts
                    .Where(rd => rd.Rental_ID == rentalId)
                    .ToList();

            return Ok(rentalDiscounts);
        }

        // 8. SORT - Using OrderByDescending()
        [HttpGet("SortByAppliedAmount")]
        public IActionResult SortByAppliedAmount()
        {
            List<RentalDiscount> rentalDiscounts =
                context.RentalDiscounts
                    .OrderByDescending(rd => rd.AppliedAmount)
                    .ToList();

            return Ok(rentalDiscounts);
        }




    }
}