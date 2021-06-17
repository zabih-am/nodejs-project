const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes')
const router = express.Router();

//we use nested route with express👇
//redirect to reviewRoute
router.use('/:tourId/reviews' , reviewRouter)

// router.param('id' , tourController.checkID)
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restricTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restricTo('admin', 'lead-guide'), tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restricTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(
    authController.protect,
    authController.restricTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
//GET /tour/34234324/review/234324
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restricTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
