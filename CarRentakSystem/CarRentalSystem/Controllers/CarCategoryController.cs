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

        public CarCategoryController(
            CarRentalSystemContext context)
        {
            _context = context;
        }


        // ========================================
        // 1. GET ALL
        // GET /api/CarCategory
        // ========================================

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories =
                await _context.CarCategories
                    .Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,

                        defaultDailyRate =
                            c.DefaultDailyRate,

                        carsCount =
                            c.Cars.Count()
                    })
                    .ToListAsync();

            return Ok(categories);
        }


        // ========================================
        // 2. GET BY ID
        // GET /api/CarCategory/5
        // ========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category =
                await _context.CarCategories

                    .Where(c => c.Id == id)

                    .Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,

                        defaultDailyRate =
                            c.DefaultDailyRate,

                        carsCount =
                            c.Cars.Count()
                    })

                    .FirstOrDefaultAsync();


            if (category == null)
            {
                return NotFound(
                    "Category not found."
                );
            }


            return Ok(category);
        }


        // ========================================
        // 3. ADD
        // POST /api/CarCategory
        // ========================================

        [HttpPost]
        public async Task<IActionResult> Create(
            CarCategory category)
        {
            if (
                string.IsNullOrWhiteSpace(
                    category.Name
                )
            )
            {
                return BadRequest(
                    "Category name is required."
                );
            }


            if (
                category.DefaultDailyRate < 0
            )
            {
                return BadRequest(
                    "Daily rate cannot be negative."
                );
            }


            _context.CarCategories.Add(
                category
            );


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Category created successfully.",

                id =
                    category.Id
            });
        }


        // ========================================
        // 4. UPDATE
        // PUT /api/CarCategory/5
        // ========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            CarCategory updatedCategory)
        {
            var category =
                await _context.CarCategories
                    .FindAsync(id);


            if (category == null)
            {
                return NotFound(
                    "Category not found."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    updatedCategory.Name
                )
            )
            {
                return BadRequest(
                    "Category name is required."
                );
            }


            if (
                updatedCategory.DefaultDailyRate < 0
            )
            {
                return BadRequest(
                    "Daily rate cannot be negative."
                );
            }


            category.Name =
                updatedCategory.Name;


            category.DefaultDailyRate =
                updatedCategory.DefaultDailyRate;


            await _context.SaveChangesAsync();


            return Ok(
                "Category updated successfully."
            );
        }


        // ========================================
        // 5. UPDATE RATE ONLY
        // PUT /api/CarCategory/5/rate
        // ========================================

        [HttpPut("{id}/rate")]
        public async Task<IActionResult> UpdateRate(
            int id,
            decimal dailyRate)
        {
            var category =
                await _context.CarCategories
                    .FindAsync(id);


            if (category == null)
            {
                return NotFound(
                    "Category not found."
                );
            }


            if (dailyRate < 0)
            {
                return BadRequest(
                    "Daily rate cannot be negative."
                );
            }


            category.DefaultDailyRate =
                dailyRate;


            await _context.SaveChangesAsync();


            return Ok(
                "Category rate updated successfully."
            );
        }


        // ========================================
        // 6. DELETE
        // DELETE /api/CarCategory/5
        // ========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id)
        {
            var category =
                await _context.CarCategories
                    .FindAsync(id);


            if (category == null)
            {
                return NotFound(
                    "Category not found."
                );
            }


            // Do not delete category
            // if cars are using it.

            bool hasCars =
                await _context.Cars
                    .AnyAsync(
                        c =>
                            c.CarCategoryId == id
                    );


            if (hasCars)
            {
                return BadRequest(
                    "This category cannot be deleted because cars are using it."
                );
            }


            _context.CarCategories.Remove(
                category
            );


            await _context.SaveChangesAsync();


            return Ok(
                "Category deleted successfully."
            );
        }


        // ========================================
        // 7. FILTER
        // GET /api/CarCategory/filter?name=SUV
        // ========================================

        [HttpGet("filter")]
        public async Task<IActionResult> Filter(
            string? name)
        {
            var query =
                _context.CarCategories
                    .AsQueryable();


            if (
                !string.IsNullOrWhiteSpace(
                    name
                )
            )
            {
                query =
                    query.Where(
                        c =>
                            c.Name.Contains(name)
                    );
            }


            var categories =
                await query

                    .Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,

                        defaultDailyRate =
                            c.DefaultDailyRate,

                        carsCount =
                            c.Cars.Count()
                    })

                    .ToListAsync();


            return Ok(categories);
        }


        // ========================================
        // 8. SORT
        // GET /api/CarCategory/sort
        // ========================================

        [HttpGet("sort")]
        public async Task<IActionResult> Sort(
            string sortBy = "name",
            bool descending = false)
        {
            var query =
                _context.CarCategories
                    .AsQueryable();


            if (
                sortBy.ToLower() == "rate"
            )
            {
                query =
                    descending

                        ? query.OrderByDescending(
                            c =>
                                c.DefaultDailyRate
                        )

                        : query.OrderBy(
                            c =>
                                c.DefaultDailyRate
                        );
            }

            else
            {
                query =
                    descending

                        ? query.OrderByDescending(
                            c => c.Name
                        )

                        : query.OrderBy(
                            c => c.Name
                        );
            }


            var categories =
                await query

                    .Select(c => new
                    {
                        id = c.Id,
                        name = c.Name,

                        defaultDailyRate =
                            c.DefaultDailyRate,

                        carsCount =
                            c.Cars.Count()
                    })

                    .ToListAsync();


            return Ok(categories);
        }


        // ========================================
        // 9. SUMMARY
        // GET /api/CarCategory/summary
        // ========================================

        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var categories =
                await _context.CarCategories
                    .ToListAsync();


            if (categories.Count == 0)
            {
                return Ok(new
                {
                    totalCategories = 0,

                    averageDailyRate = 0,

                    minimumDailyRate = 0,

                    maximumDailyRate = 0
                });
            }


            return Ok(new
            {
                totalCategories =
                    categories.Count,

                averageDailyRate =
                    categories.Average(
                        c =>
                            c.DefaultDailyRate
                    ),

                minimumDailyRate =
                    categories.Min(
                        c =>
                            c.DefaultDailyRate
                    ),

                maximumDailyRate =
                    categories.Max(
                        c =>
                            c.DefaultDailyRate
                    )
            });
        }
    }
}