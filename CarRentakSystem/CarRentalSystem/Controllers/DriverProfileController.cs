
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

        //alternative 

        // CarRentalSystemContext context = new CarRentalSystemContext();


        //Request URL => http://localhost:5071/DriverProfile/AddDriverProfile
        //Request method => Post
        //Request Body => { "FullName" : "Ahmed Ali", "LicenseNumber" : "L12345",
        //                   "LicenseExpiryDate" : "2027-01-01", "PhoneNumber" : "99887766",
        //                   "Address" : "Muscat", "Status" : "Active", "UserId" : 2 }
        // send request ==>> call function
        [HttpPost("AddDriverProfile")]
        public IActionResult AddDriverProfile(DriverProfile d)
        {

            context.DriverProfiles.Add(d);
            context.SaveChanges();

            return Ok(d.DriverId);
        }


        //Request URL => http://localhost:5071/DriverProfile/RemoveDriverProfile?id=3
        //Request method => Delete
        //Request Body => empty
        // send request ==>> call function
        [HttpDelete("RemoveDriverProfile")]
        public IActionResult RemoveDriverProfile(int id)
        {

            DriverProfile d = context.DriverProfiles.FirstOrDefault(d => d.DriverId == id);

            if (d == null)
            {
                return NotFound("driver profile not found");
            }
            else
            {
                context.DriverProfiles.Remove(d);
                context.SaveChanges();
                return Ok("removed successfully");
            }
        }


        //Request URL => http://localhost:5071/DriverProfile/UpdateDriverStatus?id=3&newStatus=Suspended
        //Request method => Patch
        //Request Body => empty
        // send request ==>> call function
        [HttpPatch("UpdateDriverStatus")]
        public IActionResult UpdateDriverStatus(int id, string newStatus)
        {
            DriverProfile d = context.DriverProfiles.FirstOrDefault(d => d.DriverId == id);

            d.Status = newStatus;

            context.SaveChanges();

            return Ok();
        }

        //Request URL => http://localhost:5071/DriverProfile/UpdateDriverPhone?id=3&newPhone=99112233
        //Request method => Patch
        //Request Body => empty
        // send request ==>> call function
        [HttpPatch("UpdateDriverPhone")]
        public IActionResult UpdateDriverPhone(int id, string newPhone)
        {
            DriverProfile d = context.DriverProfiles.FirstOrDefault(d => d.DriverId == id);

            d.PhoneNumber = newPhone;

            context.SaveChanges();

            return Ok();
        }


        //Request URL => http://localhost:5071/DriverProfile/UpdateDriverProfile?id=3
        //Request method => Put
        //Request Body => { "FullName" : "Ahmed Ali", "LicenseNumber" : "L12345",
        //                   "LicenseExpiryDate" : "2027-01-01", "PhoneNumber" : "99887766",
        //                   "Address" : "Muscat", "Status" : "Active", "UserId" : 2 }
        // send request ==>> call function
        [HttpPut("UpdateDriverProfile")]
        public IActionResult UpdateDriverProfile(int id, DriverProfile newDriverProfile)
        {
            DriverProfile d = context.DriverProfiles.FirstOrDefault(d => d.DriverId == id);

            d.FullName = newDriverProfile.FullName;
            d.LicenseNumber = newDriverProfile.LicenseNumber;
            d.LicenseExpiryDate = newDriverProfile.LicenseExpiryDate;
            d.PhoneNumber = newDriverProfile.PhoneNumber;
            d.Address = newDriverProfile.Address;
            d.Status = newDriverProfile.Status;
            d.UserId = newDriverProfile.UserId;

            context.SaveChanges();

            return Ok();
        }



        //Request URL => http://localhost:5071/DriverProfile/GetDriverProfile?id=3
        //Request method => Get
        //Request Body => empty
        // send request ==>> call function
        [HttpGet("GetDriverProfile")]
        public IActionResult GetDriverProfile(int id)
        {
            DriverProfile d = context.DriverProfiles
                .Include(d => d.User)
                .Include(d => d.Rentals)
                .FirstOrDefault(d => d.DriverId == id);

            return Ok(d);
        }

        //Request URL => http://localhost:5071/DriverProfile/GetALLDriverProfiles
        //Request method => Get
        //Request Body => empty
        // send request ==>> call function
        [HttpGet("GetALLDriverProfiles")]
        public IActionResult GetALLDriverProfiles()
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles
                .Include(d => d.User)
                .ToList();

            return Ok(driverProfiles);
        }

        //Request URL => http://localhost:5071/DriverProfile/GetByName?name=ahmed
        //Request method => Get
        //Request Body => empty
        // send request ==>> call function
        [HttpGet("GetByName")]
        public IActionResult GetByName(string name)
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles.Where(d => d.FullName.Contains(name)).ToList();
            return Ok(driverProfiles);
        }


        //Request URL => http://localhost:5071/DriverProfile/GetByStatus?status=Active
        //Request method => Get
        //Request Body => empty
        // send request ==>> call function
        [HttpGet("GetByStatus")]
        public IActionResult GetByStatus(string status)
        {
            List<DriverProfile> driverProfiles = context.DriverProfiles.Where(d => d.Status == status).ToList();
            return Ok(driverProfiles);
        }


        //Request URL => http://localhost:5071/DriverProfile/GetSortedByName?descending=false
        //Request method => Get
        //Request Body => empty
        // send request ==>> call function
        [HttpGet("GetSortedByName")]
        public IActionResult GetSortedByName(bool descending)
        {
            List<DriverProfile> driverProfiles;

            if (descending)
            {
                driverProfiles = context.DriverProfiles.OrderByDescending(d => d.FullName).ToList();
            }
            else
            {
                driverProfiles = context.DriverProfiles.OrderBy(d => d.FullName).ToList();
            }

            return Ok(driverProfiles);
        }


        //Request URL => http://localhost:5071/DriverProfile/GetStatusSummary
        //Request method => Get
        //Request Body => empty
        // send request ==>> call function
        [HttpGet("GetStatusSummary")]
        public IActionResult GetStatusSummary()
        {
            var summary = context.DriverProfiles
                .GroupBy(d => d.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToList();

            int totalDrivers = context.DriverProfiles.Count();

            return Ok(new { TotalDrivers = totalDrivers, StatusSummary = summary });
        }

    }
}