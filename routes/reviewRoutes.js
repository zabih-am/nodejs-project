const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
//in order to access to params of another route into this route we use => mergeParams: true => because we want tourId from tour route into this route
const router = express.Router({ mergeParams: true });

//from this point no one can access any of this route without being authenticated
router.use(authController.protect);

//POST /tour/3455324534534/reviews
//POST /reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restricTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restricTo('user', 'admin'), reviewController.updateReview)
  .delete(authController.restricTo('user', 'admin'), reviewController.deleteReview);
module.exports = router;
