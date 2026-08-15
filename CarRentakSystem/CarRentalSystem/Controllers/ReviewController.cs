using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRentalSystem.Models;

namespace CarRentalSystem.Controllers
{
    [ApiController]
    [Route("Review")]
    public class ReviewController : ControllerBase
    {

        private CarRentalSystemContext context;

        public ReviewController(CarRentalSystemContext _context)
        {
            context = _context;
        }

        //alternative 

        // CarRentalSystemContext context = new CarRentalSystemContext();


        //Request URL => http://localhost:5071/Review/AddReview
        //Request method => Post
        //Request Body => { "ReviewDate" : "2025-01-10", "Comment" : "Great service",
        //                   "Rating" : 5, "Carid" : 2, "Userid" : 1 }
        // send request ==>> call function
        [HttpPost("AddReview")]
        public IActionResult AddReview(Review r)
        {
            bool carExists =
                context.Cars.Any(c => c.CarId == r.Carid);

            if (!carExists)
            {
                return BadRequest(
                    "The selected car does not exist."
                );
            }

            bool userExists =
                context.Users.Any(u => u.userId == r.Userid);

            if (!userExists)
            {
                return BadRequest(
                    "The selected user does not exist."
                );
            }

            if (r.Rating < 1 || r.Rating > 5)
            {
                return BadRequest(
                    "Rating must be between 1 and 5."
                );
            }

            if (string.IsNullOrWhiteSpace(r.Comment))
            {
                return BadRequest(
                    "Comment is required."
                );
            }

            context.Reviews.Add(r);
            context.SaveChanges();

            return Ok(new
            {
                message = "Review added successfully.",
                reviewId = r.Review_ID
            });
        }


        //Request URL => http://localhost:5071/Review/RemoveReview?id=3
        //Request method => Delete
        //Request Body => empty
        // send request ==>> call function
        [HttpDelete("RemoveReview")]
        public IActionResult RemoveReview(int id)
        {

            Review? r = context.Reviews.FirstOrDefault(r => r.Review_ID == id);

            if (r == null)
            {
                return NotFound("review not found");
            }
            else
            {
                context.Reviews.Remove(r);
                context.SaveChanges();
                return Ok("removed successfully");
            }
        }




        //Request URL => http://localhost:5071/Review/UpdateReviewRating?id=3&newRating=4
        //Request method => Patch
        [HttpPatch("UpdateReviewRating")]
        public IActionResult UpdateReviewRating(
    int id,
    int newRating)
        {
            Review? r =
                context.Reviews
                    .FirstOrDefault(
                        r => r.Review_ID == id
                    );

            if (r == null)
            {
                return NotFound(
                    "Review not found."
                );
            }

            if (
                newRating < 1 ||
                newRating > 5
            )
            {
                return BadRequest(
                    "Rating must be between 1 and 5."
                );
            }

            r.Rating =
                newRating;

            context.SaveChanges();

            return Ok(
                "Review rating updated successfully."
            );
        }


        //Request URL => http://localhost:5071/Review/UpdateReview?id=3
        //Request method => Put
        //Request Body => { "ReviewDate" : "2025-02-15", "Comment" : "Updated review",
        //                   "Rating" : 3, "Carid" : 2, "Userid" : 1 }
        [HttpPut("UpdateReview")]
        public IActionResult UpdateReview(
    int id,
    Review newReview)
        {
            Review? r =
                context.Reviews
                    .FirstOrDefault(
                        r => r.Review_ID == id
                    );

            if (r == null)
            {
                return NotFound(
                    "Review not found."
                );
            }

            bool carExists =
                context.Cars.Any(
                    c => c.CarId == newReview.Carid
                );

            if (!carExists)
            {
                return BadRequest(
                    "The selected car does not exist."
                );
            }

            bool userExists =
                context.Users.Any(
                    u => u.userId == newReview.Userid
                );

            if (!userExists)
            {
                return BadRequest(
                    "The selected user does not exist."
                );
            }

            if (
                newReview.Rating < 1 ||
                newReview.Rating > 5
            )
            {
                return BadRequest(
                    "Rating must be between 1 and 5."
                );
            }

            if (string.IsNullOrWhiteSpace(
                newReview.Comment))
            {
                return BadRequest(
                    "Comment is required."
                );
            }

            r.ReviewDate =
                newReview.ReviewDate;

            r.Comment =
                newReview.Comment;

            r.Rating =
                newReview.Rating;

            r.Carid =
                newReview.Carid;

            r.Userid =
                newReview.Userid;

            context.SaveChanges();

            return Ok(
                "Review updated successfully."
            );
        }


        //Request URL => http://localhost:5071/Review/GetReview?id=3
        //Request method => Get
        [HttpGet("GetReview")]
        public IActionResult GetReview(int id)
        {
            Review? r = context.Reviews
                .Include(r => r.Car)
                .Include(r => r.User)
                .FirstOrDefault(r => r.Review_ID == id);

            if (r == null)
            {
                return NotFound("review not found");
            }

            return Ok(r);
        }

        //Request URL => http://localhost:5071/Review/GetALLReviews
        //Request method => Get
        [HttpGet("GetALLReviews")]
        public IActionResult GetALLReviews()
        {
            List<Review> reviews = context.Reviews
                .Include(r => r.Car)
                .Include(r => r.User)
                .ToList();

            return Ok(reviews);
        }

        //Request URL => http://localhost:5071/Review/GetByRating?rating=5
        //Request method => Get
        [HttpGet("GetByRating")]
        public IActionResult GetByRating(int rating)
        {
            List<Review> reviews = context.Reviews
                .Include(r => r.Car)
                .Include(r => r.User)
                .Where(r => r.Rating == rating)
                .ToList();

            return Ok(reviews);
        }

        

        //Request URL => http://localhost:5071/Review/GetSortedByRating
        //Request method => Get
        [HttpGet("GetSortedByRating")]
        public IActionResult GetSortedByRating()
        {
            List<Review> reviews = context.Reviews
                .Include(r => r.Car)
                .Include(r => r.User)
                .OrderByDescending(r => r.Rating)
                .ToList();

            return Ok(reviews);
        }

        

    }
}