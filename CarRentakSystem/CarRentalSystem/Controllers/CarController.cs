using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
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
            Car? car = context.Cars.FirstOrDefault(c => c.CarId == id);

            if (car == null)
            {
                return NotFound("car not found");
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
    }
}
