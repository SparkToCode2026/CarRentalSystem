using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Payments")]
    public class PaymentsController : ControllerBase
    {
        private CarRentalSystemContext context;

        public PaymentsController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        // 1. POST: Create a new record
        [Authorize]
        [HttpPost("AddPayment")]
        public IActionResult AddPayment(Payments payment)
        {
            if (payment.Amount < 0)
            {
                return BadRequest(
                    "Payment amount cannot be negative."
                );
            }

            if (string.IsNullOrWhiteSpace(payment.Method))
            {
                return BadRequest(
                    "Payment method is required."
                );
            }

            if (string.IsNullOrWhiteSpace(payment.Status))
            {
                return BadRequest(
                    "Payment status is required."
                );
            }

            bool rentalExists =
                context.Rentals.Any(
                    r => r.Rental_ID == payment.Rental_ID
                );

            if (!rentalExists)
            {
                return BadRequest(
                    "The selected Rental ID does not exist."
                );
            }

            payment.Rental = null!;

            context.Payments.Add(payment);

            context.SaveChanges();

            return Ok(new
            {
                message = "Payment added successfully.",
                paymentId = payment.Payment_ID
            });
        }

        // 2. PUT: Update an existing record
        [Authorize(Roles = "Admin,staff")]
        [HttpPut("UpdatePayment")]
        public IActionResult UpdatePayment(
    int id,
    Payments updatedPayment)
        {
            Payments? payment =
                context.Payments
                    .FirstOrDefault(
                        p => p.Payment_ID == id
                    );

            if (payment == null)
            {
                return NotFound(
                    "Payment not found"
                );
            }


            // Validate amount
            if (updatedPayment.Amount < 0)
            {
                return BadRequest(
                    "Payment amount cannot be negative."
                );
            }


            // Validate payment method
            if (string.IsNullOrWhiteSpace(
                updatedPayment.Method))
            {
                return BadRequest(
                    "Payment method is required."
                );
            }


            // Validate status
            if (string.IsNullOrWhiteSpace(
                updatedPayment.Status))
            {
                return BadRequest(
                    "Payment status is required."
                );
            }


            // Check Rental exists
            bool rentalExists =
                context.Rentals.Any(
                    r =>
                        r.Rental_ID ==
                        updatedPayment.Rental_ID
                );


            if (!rentalExists)
            {
                return BadRequest(
                    "The selected Rental ID does not exist."
                );
            }


            // Update values
            payment.Amount =
                updatedPayment.Amount;

            payment.Method =
                updatedPayment.Method;

            payment.PaidAtUtc =
                updatedPayment.PaidAtUtc;

            payment.Status =
                updatedPayment.Status;

            payment.Rental_ID =
                updatedPayment.Rental_ID;


            context.SaveChanges();


            return Ok(
                "Payment updated successfully"
            );
        }

        // 3. PATCH: Second distinct update case (Status update)
        [Authorize(Roles = "Admin,staff")]
        [HttpPatch("UpdateStatus")]
        public IActionResult UpdateStatus(int id, string status)
        {
            Payments? payment =
                context.Payments
                    .FirstOrDefault(p => p.Payment_ID == id);

            if (payment == null)
            {
                return NotFound("Payment not found");
            }

            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest("Status is required.");
            }

            payment.Status = status;

            context.SaveChanges();

            return Ok("Status updated successfully");
        }

        // 4. DELETE: Delete by ID[cite: 1]
        [Authorize(Roles = "Admin")]
        [HttpDelete("DeletePayment")]
        public IActionResult DeletePayment(int id)
        {
            Payments? payment = context.Payments.FirstOrDefault(p => p.Payment_ID == id);
            if (payment == null)
            {
                return NotFound("Payment not found");
            }

            context.Payments.Remove(payment);
            context.SaveChanges();
            return Ok("Deleted successfully");
        }

        // 5. GET ALL: List records including related entity via Include()
        [Authorize]
        [HttpGet("GetAllPayments")]
        public IActionResult GetAllPayments()
        {
            var payments = context.Payments
                .Include(p => p.Rental)
                .ToList();

            return Ok(payments);
        }

        // 6. GET BY ID: Find a single record by ID
        [Authorize]
        [HttpGet("GetPaymentById")]
        public IActionResult GetPaymentById(int id)
        {
            Payments? payment = context.Payments
                .Include(p => p.Rental)
                .FirstOrDefault(p => p.Payment_ID == id);

            if (payment == null)
            {
                return NotFound("Payment not found");
            }

            return Ok(payment);
        }

        // 7. GET (Filter): Filter records using LINQ Where()
        [Authorize]
        [HttpGet("FilterPayments")]
        public IActionResult FilterPayments(string? status, string? method)
        {
            var query = context.Payments.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status);
            }

            if (!string.IsNullOrEmpty(method))
            {
                query = query.Where(p => p.Method == method);
            }

            return Ok(query.ToList());
        }

        // 8. GET (Sort/Aggregate): Sort and aggregate records
        [Authorize]
        [HttpGet("PaymentAnalytics")]
        public IActionResult PaymentAnalytics()
        {
            var sortedPayments =
                context.Payments
                    .OrderByDescending(p => p.Amount)
                    .ToList();

            int totalCount =
                context.Payments.Count();

            decimal totalRevenue =
                totalCount > 0
                    ? context.Payments.Sum(p => p.Amount)
                    : 0;

            return Ok(new
            {
                TotalCount = totalCount,
                TotalRevenue = totalRevenue,
                Payments = sortedPayments
            });
        }
    }
}