using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Insurance")]
    public class InsuranceController : ControllerBase
    {
        private CarRentalSystemContext context;

        public InsuranceController(CarRentalSystemContext _context)
        {
            context = _context;
        }


        // 1. POST - Create Insurance
        [HttpPost("AddInsurance")]
        public IActionResult AddInsurance(Insurance insurance)
        {
            // Check Rental exists
            bool rentalExists =
                context.Rentals.Any(
                    r => r.Rental_ID == insurance.Rental_ID
                );

            if (!rentalExists)
            {
                return BadRequest(
                    "The selected Rental ID does not exist."
                );
            }

            // Validate Policy Type
            if (string.IsNullOrWhiteSpace(insurance.PolicyType))
            {
                return BadRequest(
                    "Policy type is required."
                );
            }

            // Validate Coverage
            if (string.IsNullOrWhiteSpace(insurance.Coverage))
            {
                return BadRequest(
                    "Coverage is required."
                );
            }

            // Validate Premium
            if (insurance.Premium < 0)
            {
                return BadRequest(
                    "Premium cannot be negative."
                );
            }

            insurance.Rental = null!;

            context.Insurances.Add(insurance);

            context.SaveChanges();

            return Ok(new
            {
                message = "Insurance added successfully.",
                insuranceId = insurance.Insurance_ID
            });
        }


        // 2. PUT - Update Insurance
        [HttpPut("UpdateInsurance")]
        public IActionResult UpdateInsurance(
    int id,
    Insurance newInsurance)
        {
            Insurance? insurance =
                context.Insurances
                    .FirstOrDefault(
                        i => i.Insurance_ID == id
                    );

            if (insurance == null)
            {
                return NotFound(
                    "Insurance not found."
                );
            }

            // Check Rental exists
            bool rentalExists =
                context.Rentals.Any(
                    r =>
                        r.Rental_ID ==
                        newInsurance.Rental_ID
                );

            if (!rentalExists)
            {
                return BadRequest(
                    "The selected Rental ID does not exist."
                );
            }

            // Validate Policy Type
            if (string.IsNullOrWhiteSpace(
                newInsurance.PolicyType))
            {
                return BadRequest(
                    "Policy type is required."
                );
            }

            // Validate Coverage
            if (string.IsNullOrWhiteSpace(
                newInsurance.Coverage))
            {
                return BadRequest(
                    "Coverage is required."
                );
            }

            // Validate Premium
            if (newInsurance.Premium < 0)
            {
                return BadRequest(
                    "Premium cannot be negative."
                );
            }

            insurance.PolicyType =
                newInsurance.PolicyType;

            insurance.Coverage =
                newInsurance.Coverage;

            insurance.Premium =
                newInsurance.Premium;

            insurance.Rental_ID =
                newInsurance.Rental_ID;

            context.SaveChanges();

            return Ok(
                "Insurance updated successfully."
            );
        }


        // 3. PATCH - Update specific field
        [HttpPatch("UpdateInsurancePremium")]
        public IActionResult UpdateInsurancePremium(
    int id,
    decimal newPremium)
        {
            Insurance? insurance =
                context.Insurances
                    .FirstOrDefault(
                        i => i.Insurance_ID == id
                    );

            if (insurance == null)
            {
                return NotFound(
                    "Insurance not found."
                );
            }

            if (newPremium < 0)
            {
                return BadRequest(
                    "Premium cannot be negative."
                );
            }

            insurance.Premium =
                newPremium;

            context.SaveChanges();

            return Ok(
                "Premium updated successfully."
            );
        }


        // 4. DELETE - Delete by ID
        [HttpDelete("RemoveInsurance")]
        public IActionResult RemoveInsurance(int id)
        {
            Insurance? insurance = context.Insurances
                .FirstOrDefault(i => i.Insurance_ID == id);

            if (insurance == null)
            {
                return NotFound("insurance not found");
            }

            context.Insurances.Remove(insurance);
            context.SaveChanges();

            return Ok("removed successfully");
        }


        // 5. GET ALL - Include related Rental data
        [HttpGet("GetAllInsurances")]
        public IActionResult GetAllInsurances()
        {
            List<Insurance> insurances = context.Insurances
                .Include(i => i.Rental)
                .ToList();

            return Ok(insurances);
        }


        // 6. GET BY ID
        [HttpGet("GetInsurance")]
        public IActionResult GetInsurance(int id)
        {
            Insurance? insurance = context.Insurances
                .FirstOrDefault(i => i.Insurance_ID == id);

            if (insurance == null)
            {
                return NotFound("insurance not found");
            }

            return Ok(insurance);
        }


        // 7. FILTER - Using Where()
        [HttpGet("GetByPolicyType")]
        public IActionResult GetByPolicyType(string policyType)
        {
            List<Insurance> insurances = context.Insurances
                .Where(i => i.PolicyType.Contains(policyType))
                .ToList();

            return Ok(insurances);
        }


        // 8. SORT - Using OrderBy()
        [HttpGet("SortByPremium")]
        public IActionResult SortByPremium()
        {
            List<Insurance> insurances = context.Insurances
                .OrderBy(i => i.Premium)
                .ToList();

            return Ok(insurances);
        }
    }
}