using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using CarRentalSystem.DTOs;
using CarRentalSystem.Models;

namespace CarRentalSystem.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public LoginResponseDto CreateToken(User user)
        {
            string? key = _configuration["Jwt:Key"];
            string? issuer = _configuration["Jwt:Issuer"];
            string? audience = _configuration["Jwt:Audience"];
            string? expireMinutesValue = _configuration["Jwt:ExpireMinutes"];

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException("JWT signing key is missing in configuration.");
            }

            if (string.IsNullOrWhiteSpace(issuer))
            {
                throw new InvalidOperationException("JWT issuer is missing in configuration.");
            }

            if (string.IsNullOrWhiteSpace(audience))
            {
                throw new InvalidOperationException("JWT audience is missing in configuration.");
            }

            if (!int.TryParse(expireMinutesValue, out int expireMinutes) || expireMinutes <= 0)
            {
                throw new InvalidOperationException("JWT expiration must be a positive integer.");
            }

            DateTime issuedAtUtc = DateTime.UtcNow;
            DateTime expiresAtUtc = issuedAtUtc.AddMinutes(expireMinutes);

            // Create payload claims matching your User model
            List<Claim> claims = new()
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.userId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.userId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.name),
                new Claim(ClaimTypes.Name, user.name),
                new Claim(JwtRegisteredClaimNames.Email, user.email),
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Role, user.role.ToString()), // Converts enum (Admin/Customer/staff) to string
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            SymmetricSecurityKey securityKey = new(Encoding.UTF8.GetBytes(key));
            SigningCredentials signingCredentials = new(securityKey, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: issuedAtUtc,
                expires: expiresAtUtc,
                signingCredentials: signingCredentials
            );

            JwtSecurityTokenHandler tokenHandler = new();

            return new LoginResponseDto
            {
                AccessToken = tokenHandler.WriteToken(token),
                ExpiresAtUtc = expiresAtUtc,
                userId = user.userId,
                name = user.name,
                email = user.email,
                role = user.role.ToString()
            };
        }
    }
}