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
    }
}