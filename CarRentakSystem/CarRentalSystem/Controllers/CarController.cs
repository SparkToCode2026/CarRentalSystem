using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
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
        // POST - Create a new Car
        [Authorize(Roles = "Admin,staff")]
        [HttpPost("AddCar")]
        public IActionResult AddCar(Car car)
        {
            // Check Category exists
            bool categoryExists =
                context.CarCategories.Any(
                    c => c.Id == car.CarCategoryId
                );

            if (!categoryExists)
            {
                return BadRequest(
                    "The selected car category does not exist."
                );
            }


            // Check Branch exists
            bool branchExists =
                context.Branches.Any(
                    b => b.Id == car.BranchId
                );

            if (!branchExists)
            {
                return BadRequest(
                    "The selected branch does not exist."
                );
            }


            // Optional basic validation
            if (string.IsNullOrWhiteSpace(car.Make))
            {
                return BadRequest(
                    "Car make is required."
                );
            }

            if (string.IsNullOrWhiteSpace(car.Model))
            {
                return BadRequest(
                    "Car model is required."
                );
            }

            if (string.IsNullOrWhiteSpace(car.PlateNumber))
            {
                return BadRequest(
                    "Plate number is required."
                );
            }

            if (car.DailyRate < 0)
            {
                return BadRequest(
                    "Daily rate cannot be negative."
                );
            }


            context.Cars.Add(car);
            context.SaveChanges();

            return Ok(new
            {
                message = "Car added successfully.",
                carId = car.CarId
            });
        }

        //PUT to update an existing record
        [Authorize(Roles = "Admin,staff")]
        [HttpPut("UpdateCar")]
        public IActionResult UpdateCar(
    int id,
    Car updatedCar)
        {
            Car? car =
                context.Cars.FirstOrDefault(
                    c => c.CarId == id
                );

            if (car == null)
            {
                return NotFound(
                    "Car not found"
                );
            }


            // Check Category
            bool categoryExists =
                context.CarCategories.Any(
                    c =>
                        c.Id ==
                        updatedCar.CarCategoryId
                );

            if (!categoryExists)
            {
                return BadRequest(
                    "The selected car category does not exist."
                );
            }


            // Check Branch
            bool branchExists =
                context.Branches.Any(
                    b =>
                        b.Id ==
                        updatedCar.BranchId
                );

            if (!branchExists)
            {
                return BadRequest(
                    "The selected branch does not exist."
                );
            }


            if (
                string.IsNullOrWhiteSpace(
                    updatedCar.Make
                ) ||
                string.IsNullOrWhiteSpace(
                    updatedCar.Model
                ) ||
                string.IsNullOrWhiteSpace(
                    updatedCar.PlateNumber
                )
            )
            {
                return BadRequest(
                    "Plate number, make and model are required."
                );
            }


            if (updatedCar.DailyRate < 0)
            {
                return BadRequest(
                    "Daily rate cannot be negative."
                );
            }


            car.PlateNumber =
                updatedCar.PlateNumber;

            car.Make =
                updatedCar.Make;

            car.Model =
                updatedCar.Model;

            car.year =
                updatedCar.year;

            car.DailyRate =
                updatedCar.DailyRate;

            car.IsAvailable =
                updatedCar.IsAvailable;

            car.CarCategoryId =
                updatedCar.CarCategoryId;

            car.BranchId =
                updatedCar.BranchId;


            context.SaveChanges();


            return Ok(
                "Car updated successfully"
            );
        }
        //PATCH endpoint for Availability
        [Authorize(Roles = "Admin,staff")]
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
        [Authorize(Roles = "Admin")]
        [HttpDelete("RemoveCar")]
        public IActionResult RemoveCar(int id)
        {
            Car? car =
                context.Cars.FirstOrDefault(
                    c => c.CarId == id
                );

            if (car == null)
            {
                return NotFound(
                    "Car not found"
                );
            }


            bool hasRentals =
                context.Rentals.Any(
                    r => r.CarId == id
                );

            bool hasMaintenance =
                context.Maintenances.Any(
                    m => m.Carid == id
                );

            bool hasDamageReports =
                context.DamageReports.Any(
                    d => d.CarId == id
                );

            bool hasReviews =
                context.Reviews.Any(
                    r => r.Carid == id
                );


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


            return Ok(
                "Car removed successfully"
            );
        }

        // GET ALL
        [Authorize]
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
        [Authorize]
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
