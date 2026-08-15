using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize]
        [HttpPost("AddDriverProfile")]
        public IActionResult AddDriverProfile(DriverProfile d)
        {
            // Check that the user exists
            bool userExists =
                context.Users.Any(
                    u => u.userId == d.userId
                );

            if (!userExists)
            {
                return BadRequest(
                    "The selected user does not exist."
                );
            }


            // One user can only have one DriverProfile
            bool alreadyHasDriverProfile =
                context.DriverProfiles.Any(
                    dp => dp.userId == d.userId
                );

            if (alreadyHasDriverProfile)
            {
                return BadRequest(
                    "This user already has a driver profile."
                );
            }


            context.DriverProfiles.Add(d);

            context.SaveChanges();


            return Ok(
                d.DriverProfile_ID
            );
        }

        // 2. PUT - Update full record
        [Authorize]
        [HttpPut("UpdateDriverProfile")]
        public IActionResult UpdateDriverProfile(
    int id,
    DriverProfile newDriverProfile)
        {
            DriverProfile? d =
                context.DriverProfiles
                    .FirstOrDefault(
                        dp => dp.DriverProfile_ID == id
                    );

            if (d == null)
            {
                return NotFound(
                    "Driver profile not found."
                );
            }


            // Check that the selected user exists
            bool userExists =
                context.Users.Any(
                    u => u.userId == newDriverProfile.userId
                );

            if (!userExists)
            {
                return BadRequest(
                    "The selected user does not exist."
                );
            }


            // Check that another DriverProfile
            // is not already using this user
            bool userAlreadyHasProfile =
                context.DriverProfiles.Any(
                    dp =>
                        dp.userId == newDriverProfile.userId &&
                        dp.DriverProfile_ID != id
                );

            if (userAlreadyHasProfile)
            {
                return BadRequest(
                    "This user already has a driver profile."
                );
            }


            // Validate license number
            if (newDriverProfile.LicenseNumber <= 0)
            {
                return BadRequest(
                    "License number must be greater than zero."
                );
            }


            d.LicenseNumber =
                newDriverProfile.LicenseNumber;

            d.LicenseExpiryDate =
                newDriverProfile.LicenseExpiryDate;

            d.userId =
                newDriverProfile.userId;


            context.SaveChanges();


            return Ok(
                "Driver profile updated successfully."
            );
        }

        // 3. PATCH - Update specific field
        [Authorize]
        [HttpPatch("UpdateLicenseNumber")]
        public IActionResult UpdateLicenseNumber(
    int id,
    int newLicenseNumber)
        {
            DriverProfile? d =
                context.DriverProfiles
                    .FirstOrDefault(
                        dp => dp.DriverProfile_ID == id
                    );

            if (d == null)
            {
                return NotFound(
                    "Driver profile not found."
                );
            }


            if (newLicenseNumber <= 0)
            {
                return BadRequest(
                    "License number must be greater than zero."
                );
            }


            d.LicenseNumber =
                newLicenseNumber;


            context.SaveChanges();


            return Ok(
                "License number updated successfully."
            );
        }

        // 4. DELETE - Delete by ID
        [Authorize(Roles = "Admin")]
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
        [Authorize]
        [HttpGet("GetAllDriverProfiles")]
        public IActionResult GetAllDriverProfiles()
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .Include(d => d.User)
                .ToList();

            return Ok(driverProfiles);
        }

        // 6. GET BY ID
        [Authorize]
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
        [Authorize]
        [HttpGet("GetByUser")]
        public IActionResult GetByUser(int userId)
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .Where(d => d.userId == userId)
                .ToList();

            return Ok(driverProfiles);
        }

        // 8. SORT - OrderBy()
        [Authorize(Roles = "Admin,staff")]
        [HttpGet("GetSortedByLicenseNumber")]
        public IActionResult GetSortedByLicenseNumber()
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .OrderBy(d => d.LicenseNumber)
                .ToList();

            return Ok(driverProfiles);
        }
        [Authorize]
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