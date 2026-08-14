using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Car")]
    public class CarController : ControllerBase
    {

        private CarRentalSystemContext context;
        public CarController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        //Implement POST to create a new record
        [HttpPost("AddCar")]
        public IActionResult AddCar(Car car)
        {
            context.Cars.Add(car);
            context.SaveChanges();
            return Ok(car.CarId);
        }

        //PUT to update an existing record
        [HttpPut("UpdateCar")]
        public IActionResult UpdateCar(int id, Car updatedCar)
        {
            Car ? car = context.Cars.FirstOrDefault(car => car.CarId == id);
            if (car == null)
            {
                return NotFound("car not found");
            }
            car.PlateNumber = updatedCar.PlateNumber;
            car.Make = updatedCar.Make;
            car.Model = updatedCar.Model;
            car.year = updatedCar.year;
            car.DailyRate = updatedCar.DailyRate;
            car.IsAvailable = updatedCar.IsAvailable;
            car.CarCategoryId = updatedCar.CarCategoryId;
            car.BranchId = updatedCar.BranchId;
            context.SaveChanges();
            return Ok("updated successfully");
        }
        //PATCH endpoint for Availability
        [HttpPatch("UpdateCarAvailability")]
        public IActionResult UpdateCarAvailability(int id, bool isAvailable)
        {
            Car
                ? car = context.Cars.FirstOrDefault(c => c.CarId == id);

            if (car == null)
            {
                return NotFound("car not found");
            }

            car.IsAvailable = isAvailable;

            context.SaveChanges();

            return Ok("car availability updated successfully");
        }

        // DELETE by ID
        [HttpDelete("RemoveCar")]
        public IActionResult RemoveCar(int id)
        {
            Car? car = context.Cars
                .FirstOrDefault(c => c.CarId == id);

            if (car == null)
            {
                return NotFound("car not found");
            }

            bool hasRentals =
                context.Rentals.Any(r => r.CarId == id);

            bool hasMaintenance =
                context.Maintenances.Any(m => m.Carid == id);

            bool hasDamageReports =
                context.DamageReports.Any(d => d.CarId == id);

            bool hasReviews =
                context.Reviews.Any(r => r.Carid == id);

            if (
                hasRentals ||
                hasMaintenance ||
                hasDamageReports ||
                hasReviews
            )
            {
                return BadRequest(
                    "This car cannot be deleted because it has related records."
                );
            }

            context.Cars.Remove(car);

            context.SaveChanges();

            return Ok("car removed successfully");
        }

        // GET ALL
        [HttpGet("GetAllCars")]
        public IActionResult GetAllCars()
        {
            List<Car> cars = context.Cars.ToList();

            return Ok(cars);
        }
        //GET ALL with related data
        [HttpGet("Carswithdata")]
        public IActionResult Carswithdata()
        {
            List<Car> cars = context.Cars
                .Include(c => c.CarCategory)
                .Include(c => c.Branch)
                .ToList();

            return Ok(cars);
        }
        // GET BY ID
        [HttpGet("GetCar")]
        public IActionResult GetCar(int id)
        {
            Car? car = context.Cars.FirstOrDefault(c => c.CarId == id);

            if (car == null)
            {
                return NotFound("car not found");
            }

            return Ok(car);
        }

        //Filter endpoint using Where()
        [HttpGet("GetByMake")]
        public IActionResult GetByMake(string make)
        {
            List<Car> cars = context.Cars
                .Where(c => c.Make.Contains(make))
                .ToList();

            return Ok(cars);
        }

        //Sort using OrderBy()
        [HttpGet("SortByDailyRate")]
        public IActionResult SortByDailyRate()
        {
            List<Car> cars = context.Cars
                .OrderBy(c => c.DailyRate)
                .ToList();

            return Ok(cars);
        }

    }
}
