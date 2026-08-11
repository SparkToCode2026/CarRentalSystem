using CarRentalSystem.DTOs;
using CarRentalSystem.Models;

namespace CarRentalSystem.Services
{
    public interface IJwtTokenService
    {
        LoginResponseDto CreateToken(User user);
    }
}