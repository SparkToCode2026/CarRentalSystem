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

            context.Reviews.Add(r);
            context.SaveChanges();

            return Ok(r.Review_ID);
        }


        //Request URL => http://localhost:5071/Review/RemoveReview?id=3
        //Request method => Delete
        //Request Body => empty
        // send request ==>> call function
        [HttpDelete("RemoveReview")]
        public IActionResult RemoveReview(int id)
        {

            Review r = context.Reviews.FirstOrDefault(r => r.Review_ID == id);

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


        //Request URL => http://localhost:5071/Review/UpdateReviewComment?id=3&newComment=Updated comment
        //Request method => Patch
        [HttpPatch("UpdateReviewComment")]
        public IActionResult UpdateReviewComment(int id, string newComment)
        {
            Review r = context.Reviews.FirstOrDefault(r => r.Review_ID == id);

            if (r == null)
            {
                return NotFound("review not found");
            }

            r.Comment = newComment;

            context.SaveChanges();

            return Ok();
        }

        //Request URL => http://localhost:5071/Review/UpdateReviewRating?id=3&newRating=4
        //Request method => Patch
        [HttpPatch("UpdateReviewRating")]
        public IActionResult UpdateReviewRating(int id, int newRating)
        {
            Review r = context.Reviews.FirstOrDefault(r => r.Review_ID == id);

            if (r == null)
            {
                return NotFound("review not found");
            }

            r.Rating = newRating;

            context.SaveChanges();

            return Ok();
        }


        //Request URL => http://localhost:5071/Review/UpdateReview?id=3
        //Request method => Put
        //Request Body => { "ReviewDate" : "2025-02-15", "Comment" : "Updated review",
        //                   "Rating" : 3, "Carid" : 2, "Userid" : 1 }
        [HttpPut("UpdateReview")]
        public IActionResult UpdateReview(int id, Review newReview)
        {
            Review r = context.Reviews.FirstOrDefault(r => r.Review_ID == id);

            if (r == null)
            {
                return NotFound("review not found");
            }

            r.ReviewDate = newReview.ReviewDate;
            r.Comment = newReview.Comment;
            r.Rating = newReview.Rating;
            r.Carid = newReview.Carid;
            r.Userid = newReview.Userid;

            context.SaveChanges();

            return Ok();
        }


        //Request URL => http://localhost:5071/Review/GetReview?id=3
        //Request method => Get
        [HttpGet("GetReview")]
        public IActionResult GetReview(int id)
        {
            Review r = context.Reviews
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

        //Request URL => http://localhost:5071/Review/GetByCar?carId=2
        //Request method => Get
        [HttpGet("GetByCar")]
        public IActionResult GetByCar(int carId)
        {
            List<Review> reviews = context.Reviews
                .Include(r => r.Car)
                .Include(r => r.User)
                .Where(r => r.Carid == carId)
                .ToList();

            return Ok(reviews);
        }

        //Request URL => http://localhost:5071/Review/GetByUser?userId=1
        //Request method => Get
        [HttpGet("GetByUser")]
        public IActionResult GetByUser(int userId)
        {
            List<Review> reviews = context.Reviews
                .Include(r => r.Car)
                .Include(r => r.User)
                .Where(r => r.Userid == userId)
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

        //Request URL => http://localhost:5071/Review/GetReviewStats
        //Request method => Get
        [HttpGet("GetReviewStats")]
        public IActionResult GetReviewStats()
        {
            var stats = context.Reviews
                .GroupBy(r => r.Carid)
                .Select(g => new
                {
                    Carid = g.Key,
                    Count = g.Count(),
                    AverageRating = g.Average(r => r.Rating),
                    HighestRating = g.Max(r => r.Rating),
                    LowestRating = g.Min(r => r.Rating)
                })
                .ToList();

            return Ok(stats);
        }

    }
}