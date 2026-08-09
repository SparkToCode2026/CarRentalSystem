using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarCategoryController : ControllerBase
    {
        private readonly CarRentalSystemContext _context;

        public CarCategoryController(CarRentalSystemContext context)
        {
            _context = context;
        }

        // GET: api/CarCategory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarCategory>>> GetAll()
        {
            var categories = await _context.CarCategories
                .Include(c => c.Cars)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/CarCategory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CarCategory>> GetById(int id)
        {
            var category = await _context.CarCategories
                .Include(c => c.Cars)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }
        
        // POST: api/CarCategory
        [HttpPost]
        public async Task<ActionResult<CarCategory>> Create(CarCategory category)
        {
            _context.CarCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = category.Id },
                category);
        }

        // PUT: api/CarCategory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            CarCategory category)
        {
            if (id != category.Id)
            {
                return BadRequest("ID does not match.");
            }

            var existingCategory = await _context.CarCategories
                .FindAsync(id);

            if (existingCategory == null)
            {
                return NotFound();
            }

            existingCategory.Name = category.Name;
            existingCategory.DefaultDailyRate = category.DefaultDailyRate;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/CarCategory/5/rate
        [HttpPut("{id}/rate")]
        public async Task<IActionResult> UpdateRate(
            int id,
            decimal dailyRate)
        {
            var category = await _context.CarCategories
                .FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            category.DefaultDailyRate = dailyRate;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        // DELETE: api/CarCategory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.CarCategories
                .FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            _context.CarCategories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // GET: api/CarCategory/filter?name=SUV
        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<CarCategory>>> Filter(string? name)
        {
            var query = _context.CarCategories
                .Include(c => c.Cars)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(c => c.Name.Contains(name));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/CarCategory/sort
        [HttpGet("sort")]
        public async Task<ActionResult<IEnumerable<CarCategory>>> Sort(
            string sortBy = "name",
            bool descending = false)
        {
            var query = _context.CarCategories.AsQueryable();

            if (sortBy.ToLower() == "rate")
            {
                query = descending
                    ? query.OrderByDescending(c => c.DefaultDailyRate)
                    : query.OrderBy(c => c.DefaultDailyRate);
            }
            else
            {
                query = descending
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name);
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/CarCategory/summary
        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var result = await _context.CarCategories
                .GroupBy(c => 1)
                .Select(g => new
                {
                    TotalCategories = g.Count(),
                    AverageDailyRate = g.Average(c => c.DefaultDailyRate),
                    MinimumDailyRate = g.Min(c => c.DefaultDailyRate),
                    MaximumDailyRate = g.Max(c => c.DefaultDailyRate)
                })
                .FirstOrDefaultAsync();

            return Ok(result);
        }
    }
}