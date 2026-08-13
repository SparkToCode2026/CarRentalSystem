using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("DriverProfile")]
    public class DriverProfileController : ControllerBase
    {
        private CarRentalSystemContext context;

        public DriverProfileController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        // 1. POST - Create
        [HttpPost("AddDriverProfile")]
        public IActionResult AddDriverProfile(DriverProfile d)
        {
            context.DriverProfiles.Add(d);
            context.SaveChanges();

            return Ok(d.DriverProfile_ID);
        }

        // 2. PUT - Update full record
        [HttpPut("UpdateDriverProfile")]
        public IActionResult UpdateDriverProfile(
            int id,
            DriverProfile newDriverProfile)
        {
            DriverProfile? d = context.DriverProfiles
                .FirstOrDefault(d => d.DriverProfile_ID == id);

            if (d == null)
            {
                return NotFound("driver profile not found");
            }

            d.LicenseNumber = newDriverProfile.LicenseNumber;
            d.LicenseExpiryDate = newDriverProfile.LicenseExpiryDate;
            d.userId = newDriverProfile.userId;

            context.SaveChanges();

            return Ok("driver profile updated successfully");
        }

        // 3. PATCH - Update specific field
        [HttpPatch("UpdateLicenseNumber")]
        public IActionResult UpdateLicenseNumber(int id, int newLicenseNumber)
        {
            DriverProfile? d = context.DriverProfiles
                .FirstOrDefault(d => d.DriverProfile_ID == id);

            if (d == null)
            {
                return NotFound("driver profile not found");
            }

            d.LicenseNumber = newLicenseNumber;

            context.SaveChanges();

            return Ok("license number updated successfully");
        }

        // 4. DELETE - Delete by ID
        [HttpDelete("RemoveDriverProfile")]
        public IActionResult RemoveDriverProfile(int id)
        {
            DriverProfile? d = context.DriverProfiles
                .FirstOrDefault(d => d.DriverProfile_ID == id);

            if (d == null)
            {
                return NotFound("driver profile not found");
            }

            bool hasRentals = context.Rentals
                .Any(r => r.DriverProfile_ID == id);

            if (hasRentals)
            {
                return BadRequest(
                    "This driver profile cannot be deleted because it has related rental records."
                );
            }

            context.DriverProfiles.Remove(d);
            context.SaveChanges();

            return Ok("removed successfully");
        }

        // 5. GET ALL + Include related User
        [HttpGet("GetAllDriverProfiles")]
        public IActionResult GetAllDriverProfiles()
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .Include(d => d.User)
                .ToList();

            return Ok(driverProfiles);
        }

        // 6. GET BY ID
        [HttpGet("GetDriverProfile")]
        public IActionResult GetDriverProfile(int id)
        {
            DriverProfile? d = context.DriverProfiles
                .FirstOrDefault(d => d.DriverProfile_ID == id);

            if (d == null)
            {
                return NotFound("driver profile not found");
            }

            return Ok(d);
        }

        // 7. FILTER - Where()
        [HttpGet("GetByUser")]
        public IActionResult GetByUser(int userId)
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .Where(d => d.userId == userId)
                .ToList();

            return Ok(driverProfiles);
        }

        // 8. SORT - OrderBy()
        [HttpGet("GetSortedByLicenseNumber")]
        public IActionResult GetSortedByLicenseNumber()
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .OrderBy(d => d.LicenseNumber)
                .ToList();

            return Ok(driverProfiles);
        }

        [HttpGet("GetDriverProfileWithRelatedData")]
        public IActionResult GetDriverProfileWithRelatedData(int id)
        {
            var d = context.DriverProfiles
                .Where(d => d.DriverProfile_ID == id)
                .Select(d => new
                {
                    d.DriverProfile_ID,
                    d.LicenseNumber,
                    d.LicenseExpiryDate,
                    d.userId,

                    UserName = d.User != null
                        ? d.User.name
                        : null,

                    RentalCount = d.Rentals.Count()
                })
                .FirstOrDefault();

            if (d == null)
            {
                return NotFound("driver profile not found");
            }

            return Ok(d);
        }
    }
}