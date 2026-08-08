

// =====================================================================
// PART 3: Controllers/InsuranceController.cs
// =====================================================================
using CarRentalSystem.Data;
using CarRentalSystem.DTOs;
using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsuranceController : ControllerBase
    {
        private readonly CarRentalSystemContext _context;

        public InsuranceController(CarRentalSystemContext context)
        {
            _context = context;
        }

        // -----------------------------------------------------------
        // 1. POST: api/Insurance
        // Create a new insurance policy
        // -----------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult<Insurance>> CreateInsurance(InsuranceCreateDto dto)
        {
            var rentalExists = await _context.Rentals.AnyAsync(r => r.Rental_ID == dto.Rental_ID);
            if (!rentalExists)
                return BadRequest($"Rental with Id {dto.Rental_ID} does not exist.");

            var insurance = new Insurance
            {
                PolicyType = dto.PolicyType,
                Coverage = dto.Coverage,
                Premium = dto.Premium,
                Rental_ID = dto.Rental_ID
            };

            _context.Insurances.Add(insurance);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInsuranceById), new { id = insurance.Insurance_ID }, insurance);
        }

        // -----------------------------------------------------------
        // 2. PUT: api/Insurance/5
        // Full update of PolicyType / Coverage / Premium
        // -----------------------------------------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInsurance(int id, InsuranceUpdateDto dto)
        {
            var insurance = await _context.Insurances.FindAsync(id);
            if (insurance == null)
                return NotFound($"Insurance with Id {id} was not found.");

            insurance.PolicyType = dto.PolicyType;
            insurance.Coverage = dto.Coverage;
            insurance.Premium = dto.Premium;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // -----------------------------------------------------------
        // 3. PATCH: api/Insurance/5/reassign-rental
        // Second, distinct update case: change the policy's Rental_ID
        // (update via the related entity's FK)
        // -----------------------------------------------------------
        [HttpPatch("{id}/reassign-rental")]
        public async Task<IActionResult> ReassignInsuranceToRental(int id, InsuranceRentalReassignDto dto)
        {
            var insurance = await _context.Insurances.FindAsync(id);
            if (insurance == null)
                return NotFound($"Insurance with Id {id} was not found.");

            var rentalExists = await _context.Rentals.AnyAsync(r => r.Rental_ID == dto.Rental_ID);
            if (!rentalExists)
                return BadRequest($"Rental with Id {dto.Rental_ID} does not exist.");

            insurance.Rental_ID = dto.Rental_ID;

            await _context.SaveChangesAsync();
            return Ok(insurance);
        }

        // -----------------------------------------------------------
        // 4. DELETE: api/Insurance/5
        // -----------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsurance(int id)
        {
            var insurance = await _context.Insurances.FindAsync(id);
            if (insurance == null)
                return NotFound($"Insurance with Id {id} was not found.");

            _context.Insurances.Remove(insurance);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // -----------------------------------------------------------
        // 5. GET: api/Insurance
        // Get all records, including the related Rental (Include)
        // -----------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Insurance>>> GetAllInsurances()
        {
            var insurances = await _context.Insurances
                .Include(i => i.Rental)
                .ToListAsync();

            return Ok(insurances);
        }

        // -----------------------------------------------------------
        // 6. GET: api/Insurance/5
        // Get a single record by Id, including related Rental
        // -----------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<ActionResult<Insurance>> GetInsuranceById(int id)
        {
            var insurance = await _context.Insurances
                .Include(i => i.Rental)
                .FirstOrDefaultAsync(i => i.Insurance_ID == id);

            if (insurance == null)
                return NotFound($"Insurance with Id {id} was not found.");

            return Ok(insurance);
        }

        // -----------------------------------------------------------
        // 7. GET: api/Insurance/filter?policyType=Full&minPremium=100
        // Filter using Where() on PolicyType and/or Premium range
        // -----------------------------------------------------------
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<Insurance>>> FilterInsurances(
            [FromQuery] string? policyType,
            [FromQuery] decimal? minPremium,
            [FromQuery] decimal? maxPremium)
        {
            var query = _context.Insurances.Include(i => i.Rental).AsQueryable();

            if (!string.IsNullOrWhiteSpace(policyType))
                query = query.Where(i => i.PolicyType == policyType);

            if (minPremium.HasValue)
                query = query.Where(i => i.Premium >= minPremium.Value);

            if (maxPremium.HasValue)
                query = query.Where(i => i.Premium <= maxPremium.Value);

            var result = await query.ToListAsync();
            return Ok(result);
        }

        // -----------------------------------------------------------
        // 8. GET: api/Insurance/summary
        // Sort/Aggregate: OrderBy, Count, Sum, Average, GroupBy
        // -----------------------------------------------------------
        [HttpGet("summary")]
        public async Task<ActionResult> GetInsuranceSummary()
        {
            var sortedByPremium = await _context.Insurances
                .Include(i => i.Rental)
                .OrderByDescending(i => i.Premium)
                .ToListAsync();

            var totalCount = await _context.Insurances.CountAsync();
            var totalPremium = await _context.Insurances.SumAsync(i => i.Premium);
            var averagePremium = totalCount > 0
                ? await _context.Insurances.AverageAsync(i => i.Premium)
                : 0;

            var groupedByPolicyType = await _context.Insurances
                .GroupBy(i => i.PolicyType)
                .Select(g => new
                {
                    PolicyType = g.Key,
                    Count = g.Count(),
                    TotalPremium = g.Sum(i => i.Premium),
                    AveragePremium = g.Average(i => i.Premium)
                })
                .ToListAsync();

            var summary = new
            {
                TotalPolicies = totalCount,
                TotalPremium = totalPremium,
                AveragePremium = averagePremium,
                GroupedByPolicyType = groupedByPolicyType,
                SortedByPremiumDescending = sortedByPremium
            };

            return Ok(summary);
        }
    }
}