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

        public BranchController(
            CarRentalSystemContext context)
        {
            _context = context;
        }


        // ========================================
        // 1. GET ALL
        // GET /api/Branch
        // ========================================

        [HttpGet]
        public async Task<IActionResult> GetBranches()
        {
            var branches =
                await _context.Branches

                    .Select(b => new
                    {
                        id = b.Id,

                        name = b.Name,

                        city = b.City,

                        address = b.Address,

                        carsCount =
                            b.Cars.Count(),

                        rentalsCount =
                            b.PickupRentals.Count()
                    })

                    .ToListAsync();


            return Ok(branches);
        }


        // ========================================
        // 2. GET BY ID
        // GET /api/Branch/5
        // ========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBranch(
            int id)
        {
            var branch =
                await _context.Branches

                    .Where(b => b.Id == id)

                    .Select(b => new
                    {
                        id = b.Id,

                        name = b.Name,

                        city = b.City,

                        address = b.Address,

                        carsCount =
                            b.Cars.Count(),

                        rentalsCount =
                            b.PickupRentals.Count()
                    })

                    .FirstOrDefaultAsync();


            if (branch == null)
            {
                return NotFound(
                    "Branch not found."
                );
            }


            return Ok(branch);
        }


        // ========================================
        // 3. CREATE
        // POST /api/Branch
        // ========================================

        [HttpPost]
        public async Task<IActionResult> CreateBranch(
            Branch branch)
        {
            if (
                string.IsNullOrWhiteSpace(
                    branch.Name
                )
            )
            {
                return BadRequest(
                    "Branch name is required."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    branch.City
                )
            )
            {
                return BadRequest(
                    "City is required."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    branch.Address
                )
            )
            {
                return BadRequest(
                    "Address is required."
                );
            }


            _context.Branches.Add(
                branch
            );


            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Branch created successfully.",

                id =
                    branch.Id
            });
        }


        // ========================================
        // 4. UPDATE
        // PUT /api/Branch/5
        // ========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            Branch updatedBranch)
        {
            var branch =
                await _context.Branches
                    .FindAsync(id);


            if (branch == null)
            {
                return NotFound(
                    "Branch not found."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    updatedBranch.Name
                ) ||
                string.IsNullOrWhiteSpace(
                    updatedBranch.City
                ) ||
                string.IsNullOrWhiteSpace(
                    updatedBranch.Address
                )
            )
            {
                return BadRequest(
                    "Name, city and address are required."
                );
            }


            branch.Name =
                updatedBranch.Name;

            branch.City =
                updatedBranch.City;

            branch.Address =
                updatedBranch.Address;


            await _context.SaveChangesAsync();


            return Ok(
                "Branch updated successfully."
            );
        }


        // ========================================
        // 5. UPDATE CITY ONLY
        // PUT /api/Branch/5/city?city=Muscat
        // ========================================

        [HttpPut("{id}/city")]
        public async Task<IActionResult> UpdateCity(
            int id,
            string city)
        {
            var branch =
                await _context.Branches
                    .FindAsync(id);


            if (branch == null)
            {
                return NotFound(
                    "Branch not found."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    city
                )
            )
            {
                return BadRequest(
                    "City is required."
                );
            }


            branch.City =
                city;


            await _context.SaveChangesAsync();


            return Ok(
                "Branch city updated successfully."
            );
        }


        // ========================================
        // 6. DELETE
        // DELETE /api/Branch/5
        // ========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBranch(
            int id)
        {
            var branch =
                await _context.Branches
                    .FindAsync(id);


            if (branch == null)
            {
                return NotFound(
                    "Branch not found."
                );
            }


            // Check if cars use the branch
            bool hasCars =
                await _context.Cars
                    .AnyAsync(
                        c => c.BranchId == id
                    );


            // Check if rentals use the branch
            bool hasRentals =
                await _context.Rentals
                    .AnyAsync(
                        r => r.BranchId == id
                    );


            if (
                hasCars ||
                hasRentals
            )
            {
                return BadRequest(
                    "This branch cannot be deleted because it has related cars or rentals."
                );
            }


            _context.Branches.Remove(
                branch
            );


            await _context.SaveChangesAsync();


            return Ok(
                "Branch deleted successfully."
            );
        }


        // ========================================
        // 7. FILTER BY CITY
        // GET /api/Branch/filter?city=Muscat
        // ========================================

        [HttpGet("filter")]
        public async Task<IActionResult> Filter(
            string? city)
        {
            var query =
                _context.Branches
                    .AsQueryable();


            if (
                !string.IsNullOrWhiteSpace(
                    city
                )
            )
            {
                query =
                    query.Where(
                        b =>
                            b.City.Contains(city)
                    );
            }


            var branches =
                await query

                    .Select(b => new
                    {
                        id = b.Id,

                        name = b.Name,

                        city = b.City,

                        address = b.Address,

                        carsCount =
                            b.Cars.Count(),

                        rentalsCount =
                            b.PickupRentals.Count()
                    })

                    .ToListAsync();


            return Ok(branches);
        }


        // ========================================
        // 8. SORT
        // GET /api/Branch/sort
        // ========================================

        [HttpGet("sort")]
        public async Task<IActionResult> Sort(
            string sortBy = "name",
            bool descending = false)
        {
            var query =
                _context.Branches
                    .AsQueryable();


            if (
                sortBy.ToLower() == "city"
            )
            {
                query =
                    descending

                        ? query.OrderByDescending(
                            b => b.City
                        )

                        : query.OrderBy(
                            b => b.City
                        );
            }
            else
            {
                query =
                    descending

                        ? query.OrderByDescending(
                            b => b.Name
                        )

                        : query.OrderBy(
                            b => b.Name
                        );
            }


            var branches =
                await query

                    .Select(b => new
                    {
                        id = b.Id,

                        name = b.Name,

                        city = b.City,

                        address = b.Address,

                        carsCount =
                            b.Cars.Count(),

                        rentalsCount =
                            b.PickupRentals.Count()
                    })

                    .ToListAsync();


            return Ok(branches);
        }


        // ========================================
        // 9. SUMMARY
        // GET /api/Branch/summary
        // ========================================

        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var branches =
                await _context.Branches
                    .ToListAsync();


            return Ok(new
            {
                totalBranches =
                    branches.Count,

                cities =
                    branches
                        .Select(
                            b => b.City
                        )
                        .Distinct()
                        .Count()
            });
        }
    }
}