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
    }
}