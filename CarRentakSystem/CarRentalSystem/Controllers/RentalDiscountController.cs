using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        [Authorize(Roles = "Admin,staff")]
        [HttpPost("CreateRentalDiscount")]
        public IActionResult CreateRentalDiscount(
    [FromBody] RentalDiscount rentalDiscount)
        {
            // Check Rental exists
            bool rentalExists =
                context.Rentals.Any(
                    r => r.Rental_ID == rentalDiscount.Rental_ID
                );

            if (!rentalExists)
            {
                return BadRequest(
                    "The selected rental does not exist."
                );
            }


            // Check Discount exists
            bool discountExists =
                context.Discounts.Any(
                    d => d.Discount_ID == rentalDiscount.DiscountId
                );

            if (!discountExists)
            {
                return BadRequest(
                    "The selected discount does not exist."
                );
            }


            // Prevent duplicate composite key
            bool alreadyExists =
                context.RentalDiscounts.Any(
                    rd =>
                        rd.Rental_ID == rentalDiscount.Rental_ID &&
                        rd.DiscountId == rentalDiscount.DiscountId
                );

            if (alreadyExists)
            {
                return BadRequest(
                    "This discount is already applied to this rental."
                );
            }


            if (rentalDiscount.AppliedAmount < 0)
            {
                return BadRequest(
                    "Applied amount cannot be negative."
                );
            }


            context.RentalDiscounts.Add(rentalDiscount);

            context.SaveChanges();


            return Ok(new
            {
                message = "Rental discount created successfully.",
                rentalId = rentalDiscount.Rental_ID,
                discountId = rentalDiscount.DiscountId
            });
        }
        // 2. PUT - Update the full RentalDiscount
        [Authorize(Roles = "Admin,staff")]
        [HttpPut("UpdateRentalDiscount")]
        public IActionResult UpdateRentalDiscount(
    int rentalId,
    int discountId,
    RentalDiscount newRentalDiscount)
        {
            RentalDiscount? rentalDiscount =
                context.RentalDiscounts
                    .FirstOrDefault(
                        rd =>
                            rd.Rental_ID == rentalId &&
                            rd.DiscountId == discountId
                    );

            if (rentalDiscount == null)
            {
                return NotFound(
                    "Rental discount not found."
                );
            }


            if (newRentalDiscount.AppliedAmount < 0)
            {
                return BadRequest(
                    "Applied amount cannot be negative."
                );
            }


            rentalDiscount.AppliedAmount =
                newRentalDiscount.AppliedAmount;


            context.SaveChanges();


            return Ok(
                "Rental discount updated successfully."
            );
        }

        // 3. PATCH - Update a specific field
        [Authorize(Roles = "Admin,staff")]
        [HttpPatch("UpdateAppliedAmount")]
        public IActionResult UpdateAppliedAmount(
    int rentalId,
    int discountId,
    decimal newAmount)
        {
            RentalDiscount? rentalDiscount =
                context.RentalDiscounts
                    .FirstOrDefault(
                        rd =>
                            rd.Rental_ID == rentalId &&
                            rd.DiscountId == discountId
                    );

            if (rentalDiscount == null)
            {
                return NotFound(
                    "Rental discount not found."
                );
            }


            if (newAmount < 0)
            {
                return BadRequest(
                    "Applied amount cannot be negative."
                );
            }


            rentalDiscount.AppliedAmount =
                newAmount;


            context.SaveChanges();


            return Ok(
                "Applied amount updated successfully."
            );
        }
        // 4. DELETE - Delete using the composite key
        [Authorize(Roles = "Admin")]
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
        [Authorize]
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
        [Authorize]
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
        [Authorize]
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
        [Authorize]
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