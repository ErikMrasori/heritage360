const reviewService = require("../services/review.service");

async function getReviews(req, res) {
  const data = await reviewService.getReviews(Number(req.params.id));
  res.status(200).json(data);
}

async function createReview(req, res) {
  const review = await reviewService.createReview(
    {
      locationId: Number(req.params.id),
      rating: req.body.rating,
      body: req.body.body
    },
    req.user.sub
  );
  res.status(201).json(review);
}

module.exports = { getReviews, createReview };
