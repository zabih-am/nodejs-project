const Review = require('./../models/reviewModel')
// const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')


exports.getAllReviews = factory.getAll(Review)
// exports.getAllReviews = catchAsync(async(req, res, next) => {
//     let filter = {}
//     if(req.params.tourId) filter = {tour: req.params.tourId}

//     const reviews = await Review.find(filter)
//     res.status(200).json({
//         status: 'success',
//         createAt: req.requestTime,
//         result: reviews.length,
//         data: {
//             reviews
//         }
//     })
// })


exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId
    //we have user in protect middleware
    if(!req.body.user) req.body.user = req.user.id
    next()
}
//allow nested route
exports.createReview = factory.createOne(Review)

exports.getReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)