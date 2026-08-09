using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalSystem.Models;

namespace CarRentalSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BranchController : ControllerBase
    {
        private readonly CarRentalSystemContext _context;

        public BranchController(CarRentalSystemContext context)
        {
            _context = context;
        }
        
        // GET: api/Branch
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Branch>>> GetBranches()
        {
            return await _context.Branches
                .Include(b => b.Cars)
                .Include(b => b.PickupRentals)
                .ToListAsync();
        }

        // GET: api/Branch/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Branch>> GetBranch(int id)
        {
            var branch = await _context.Branches
                .Include(b => b.Cars)
                .Include(b => b.PickupRentals)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (branch == null)
            {
                return NotFound();
            }

            return Ok(branch);
        }
        // POST: api/Branch
        [HttpPost]
        public async Task<ActionResult<Branch>> CreateBranch(Branch branch)
        {
            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetBranch),
                new { id = branch.Id },
                branch);
        }

// PUT: api/Branch/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBranch(
            int id,
            Branch branch)
        {
            if (id != branch.Id)
            {
                return BadRequest("ID does not match.");
            }

            var existingBranch = await _context.Branches
                .FindAsync(id);

            if (existingBranch == null)
            {
                return NotFound();
            }

            existingBranch.Name = branch.Name;
            existingBranch.City = branch.City;
            existingBranch.Address = branch.Address;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Branch/5/city
        [HttpPut("{id}/city")]
        public async Task<IActionResult> UpdateCity(
            int id,
            string city)
        {
            var branch = await _context.Branches
                .FindAsync(id);

            if (branch == null)
            {
                return NotFound();
            }

            branch.City = city;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        // DELETE: api/Branch/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBranch(int id)
        {
            var branch = await _context.Branches
                .FindAsync(id);

            if (branch == null)
            {
                return NotFound();
            }

            _context.Branches.Remove(branch);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}