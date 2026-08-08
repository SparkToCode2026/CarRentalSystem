using Microsoft.AspNetCore.Mvc;
using CarRentalSystem.Models;

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
            User user = context.Users.FirstOrDefault(user => user.userId==id);
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
    
    
    }
}
