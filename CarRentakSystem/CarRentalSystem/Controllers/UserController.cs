// after jwt
using CarRentalSystem.DTOs;
using CarRentalSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static CarRentalSystem.Models.User;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("User")]
    [Authorize] // AUTH endpoints
    public class UserController : ControllerBase
    {
        private CarRentalSystemContext context;
        private readonly IConfiguration _configuration; //read jwt key from appsettings.json
        public UserController(
    CarRentalSystemContext _context,
    IConfiguration configuration)
        {
            context = _context;
            _configuration = configuration;
        }
        //new for jwt
        //Register User

        [AllowAnonymous]
        [HttpPost("Register")]

        public IActionResult Register([FromBody] UserRegisterDto request)
        {
            // Check if user already exists
            if (context.Users.Any(u => u.email == request.email))
            {
                return BadRequest("User already exists");
            }

            // Create new user
            var user = new User
            {
                name = request.name,
                email = request.email,
                passwordHash = BCrypt.Net.BCrypt.HashPassword(request.password), // Hash the password using BCrypt
                role = UserRole.Customer, // Default role for customers 
                CreatedAtUtc = DateTime.UtcNow
            };



            context.Users.Add(user);
            context.SaveChanges();

            return Ok(new{
                Message = "User registered successfully",
                UserId = user.userId    });
        }

        // Login User
        [AllowAnonymous]
        [HttpPost("Login")]
        public IActionResult Login([FromBody] UserRegisterDto request)
        {
            User? user = context.Users.FirstOrDefault(u => u.email == request.email);
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }
            bool validpassword = BCrypt.Net.BCrypt.Verify(request.password, user.passwordHash);
            if (!validpassword) { return Unauthorized("Invalid credentials."); }
            //Token
            //generation
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.userId.ToString()),
                    new Claim(ClaimTypes.Email, user.email),
                    new Claim(ClaimTypes.Role, user.role.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(1), // Token expires in 1 hour
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            //token return
            return Ok(new { Token = tokenString });
        }
        //note: add user replaced with register user
        // Implement PUT/PATCH to update an existing record.
        [HttpPut("UpdateUser")]
        public IActionResult UpdateUser(int id, User updatedUser)
        {
            User? user = context.Users.FirstOrDefault(user => user.userId == id);
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllUser")] 
        public IActionResult GetAllUser()
        {
            List<User> users = context.Users.ToList();
            return Ok(users);
        }

        // Use Include() where related data should be returned.
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        // does not require authorization? confirm>
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
