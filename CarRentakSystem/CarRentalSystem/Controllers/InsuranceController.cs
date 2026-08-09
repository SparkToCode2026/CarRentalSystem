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
            context.Insurances.Add(insurance);
            context.SaveChanges();

            return Ok(insurance.Insurance_ID);
        }


        // 2. PUT - Update Insurance
        [HttpPut("UpdateInsurance")]
        public IActionResult UpdateInsurance(int id, Insurance newInsurance)
        {
            Insurance? insurance = context.Insurances
                .FirstOrDefault(i => i.Insurance_ID == id);

            if (insurance == null)
            {
                return NotFound("insurance not found");
            }

            insurance.PolicyType = newInsurance.PolicyType;
            insurance.Coverage = newInsurance.Coverage;
            insurance.Premium = newInsurance.Premium;
            insurance.Rental_ID = newInsurance.Rental_ID;

            context.SaveChanges();

            return Ok("insurance updated successfully");
        }


        // 3. PATCH - Update specific field
        [HttpPatch("UpdateInsurancePremium")]
        public IActionResult UpdateInsurancePremium(int id, decimal newPremium)
        {
            Insurance? insurance = context.Insurances
                .FirstOrDefault(i => i.Insurance_ID == id);

            if (insurance == null)
            {
                return NotFound("insurance not found");
            }

            insurance.Premium = newPremium;

            context.SaveChanges();

            return Ok("premium updated successfully");
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