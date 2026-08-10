using System.Runtime.Intrinsics.X86;
using CarRentalSystem.Models;
using Microsoft.AspNetCore.Mvc;
using static CarRentalSystem.Models.User;
using Microsoft.EntityFrameworkCore;


namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("User")]
    public class UserController : ControllerBase
    {
        private CarRentalSystemContext context;
        public UserController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        // Implement POST to create a new record
        [HttpPost("AddUser")]
        public IActionResult AddUser(User user)
        {
            context.Users.Add(user);
            context.SaveChanges();
            return Ok(user.userId);
        }

        // Implement PUT/PATCH to update an existing record.
        [HttpPut("UpdateUser")]
        public IActionResult UpdateUser(int id, User updatedUser)
        {
            User? user = context.Users.FirstOrDefault(user => user.userId==id);
            if (user == null)
            {
                return NotFound("user not found");
            }
            user.name = updatedUser.name;
            user.email = updatedUser.email;
            user.passwordHash = updatedUser.passwordHash;
            user.role = updatedUser.role;
            user.CreatedAtUtc = updatedUser.CreatedAtUtc;
            context.SaveChanges();
            return Ok("updated successfully");
        }

        //Implement a second PUT/PATCH endpoint for a specific field/status update
        [HttpPut("UpdateUserRole")]
        public IActionResult UpdateUserRole(int id, UserRole newRole)
        {
            User? user = context.Users.FirstOrDefault(user => user.userId == id);
            if (user == null)
            {
                return NotFound("user not found");
            }
            user.role = newRole;
            context.SaveChanges();
            return Ok("role updated successfully");
        }
        // Implement DELETE by ID
        [HttpDelete("DeleteUser")]
        public IActionResult DeleteUser(int id)
        {
            User? user = context.Users.FirstOrDefault(user => user.userId == id);
            if (user == null)
            {
                return NotFound("user not found");
            }
            context.Users.Remove(user);
            context.SaveChanges();
            return Ok("deleted successfully");
        }

        //Implement GET ALL
        [HttpGet("GetAllUser")]
        public IActionResult GetAllUser()
        {
            List<User> users = context.Users.ToList();
            return Ok(users);
        }

        // Use Include() where related data should be returned.
        [HttpGet("GetUserWithRelatedData")]
        public IActionResult GetUserWithRelatedData(int id)
        {
            User? user = context.Users
                .Include(u => u.Rentals)
                .Include(u => u.DriverProfile)
                .Include(u => u.Reviews)
                .FirstOrDefault(u => u.userId == id);
            if (user == null)
            {
                return NotFound("user not found");
            }
            return Ok(user);
        }
        //Implement GET BY ID
        [HttpGet("GetUserById")]
        public IActionResult GetUserById(int id)
        {
            User? user = context.Users.FirstOrDefault(user => user.userId == id);
            if (user == null)
            {
                return NotFound("user not found");
            }
            return Ok(user);
        }

        //Implement a Filter endpoint using Where()
        [HttpGet("GetByName")]
        public IActionResult GetByName(string name)
        {
            List<User> users = context.Users
                .Where(u => u.name.Contains(name)).ToList();
            return Ok(users);
        }

        //Implement a Sort endpoint using OrderBy()
        [HttpGet("SortUsersByName")]
        public IActionResult SortUsersByName()
        {
            List<User> users = context.Users
                .OrderBy(u => u.name).ToList();

            return Ok(users);
        }

    }
}
