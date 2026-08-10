using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalSystem.Models;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Maintenance")]
    public class MaintenanceController : ControllerBase
    {

        private CarRentalSystemContext context;

        public MaintenanceController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        //alternative 

        // CarRentalSystemContext context = new CarRentalSystemContext();


        //Request URL => http://localhost:5071/Maintenance/AddMaintenance
        //Request method => Post
        //Request Body => { "ServiceDate" : "2025-01-10", "Description" : "Oil change",
        //                   "Cost" : 45.5, "Status" : "Pending", "Carid" : 2 }
        // send request ==>> call function
        [HttpPost("AddMaintenance")]
        public IActionResult AddMaintenance(Maintenance m)
        {

            context.Maintenances.Add(m);
            context.SaveChanges();

            return Ok(m.Maintenane_ID);
        }


        //Request URL => http://localhost:5071/Maintenance/RemoveMaintenance?id=3
        //Request method => Delete
        //Request Body => empty
        // send request ==>> call function
        [HttpDelete("RemoveMaintenance")]
        public IActionResult RemoveMaintenance(int id)
        {

            Maintenance? m = context.Maintenances.FirstOrDefault(m => m.Maintenane_ID == id);

            if (m == null)
            {
                return NotFound("maintenance record not found");
            }
            else
            {
                context.Maintenances.Remove(m);
                context.SaveChanges();
                return Ok("removed successfully");
            }
        }


        //Request URL => http://localhost:5071/Maintenance/UpdateMaintenanceStatus?id=3&newStatus=Completed
        //Request method => Patch
        [HttpPatch("UpdateMaintenanceStatus")]
        public IActionResult UpdateMaintenanceStatus(int id, string newStatus)
        {
            Maintenance? m = context.Maintenances.FirstOrDefault(m => m.Maintenane_ID == id);

            if (m == null)
            {
                return NotFound("maintenance record not found");
            }

            m.Status = newStatus;

            context.SaveChanges();

            return Ok();
        }


        //Request URL => http://localhost:5071/Maintenance/UpdateMaintenance?id=3
        //Request method => Put
        //Request Body => { "ServiceDate" : "2025-02-15", "Description" : "Brake replacement",
        //                   "Cost" : 120.0, "Status" : "In Progress", "Carid" : 2 }
        [HttpPut("UpdateMaintenance")]
        public IActionResult UpdateMaintenance(int id, Maintenance newMaintenance)
        {
            Maintenance? m = context.Maintenances.FirstOrDefault(m => m.Maintenane_ID == id);

            if (m == null)
            {
                return NotFound("maintenance record not found");
            }

            m.Carid = newMaintenance.Carid;
            m.ServiceDate = newMaintenance.ServiceDate;
            m.Description = newMaintenance.Description;
            m.Cost = newMaintenance.Cost;
            m.Status = newMaintenance.Status;

            context.SaveChanges();

            return Ok();
        }


        //Request URL => http://localhost:5071/Maintenance/GetMaintenance?id=3
        //Request method => Get
        [HttpGet("GetMaintenance")]
        public IActionResult GetMaintenance(int id)
        {
            Maintenance? m = context.Maintenances
                .Include(m => m.Car)
                .FirstOrDefault(m => m.Maintenane_ID == id);

            if (m == null)
            {
                return NotFound("maintenance record not found");
            }

            return Ok(m);
        }

        //Request URL => http://localhost:5071/Maintenance/GetALLMaintenances
        //Request method => Get
        [HttpGet("GetALLMaintenances")]
        public IActionResult GetALLMaintenances()
        {
            List<Maintenance> maintenances = context.Maintenances
                .Include(m => m.Car)
                .ToList();

            return Ok(maintenances);
        }

        //Request URL => http://localhost:5071/Maintenance/GetByStatus?status=Pending
        //Request method => Get
        [HttpGet("GetByStatus")]
        public IActionResult GetByStatus(string status)
        {
            List<Maintenance> maintenances = context.Maintenances
                .Include(m => m.Car)
                .Where(m => m.Status == status)
                .ToList();

            return Ok(maintenances);
        }

        

        //Request URL => http://localhost:5071/Maintenance/GetSortedByCost
        //Request method => Get
        [HttpGet("GetSortedByCost")]
        public IActionResult GetSortedByCost()
        {
            List<Maintenance> maintenances = context.Maintenances
                .Include(m => m.Car)
                .OrderByDescending(m => m.Cost)
                .ToList();

            return Ok(maintenances);
        }

     

    }
}