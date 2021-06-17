const fs = require('fs');
const Tour = require('./../models/tourModel');

const ApiFeature = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
//HANDLER FUNCTIONS FOR TOUR ROUTE
// exports.checkID = (req, res, next, val) => {
//   if(req.params.id * 1 > tours.length){
//     return res.status(404).json({
//       status: 'fail',
//       messsage: 'invalid ID'
//     })
//   }
//   next()
// }
//---------------------------------------------------------------------------------
// exports.checkBody = (req, res, next) => {
//   if(!req.body.name || !req.body.price){
//     return res.status(400).json({
//       status: 'fail',
//       message: 'missing name or price'
//     })
//   }
//   next()
// }
//-----------------------------------------------------------------------------------

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
//-----------------------------------------------------------------------------------

exports.createTour = factory.createOne(Tour)
// exports.createTour = catchAsync(async (req, res, next) => {
//   // const newTour = new Tour({})
//   // newTour.save()
//   // try {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       newTour,
//     },
//   });
//   // } catch (err) {
//   //   // res.status(400).json({
//   //   //   status: 'fail',
//   //   //   message: err,
//   //   // });
//   //   next(new AppError('error occors', 404))
//   // }
//   // newId = tours[tours.length - 1].id + 1
//   // newTour = Object.assign({id: newId} , req.body)
//   // tours.push(newTour)
//   // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json` , JSON.stringify(tours) , err  =>{
//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour
//   //     }
//   //   })
//   // })
// });
//--------------------------------------------------------------------------------------------------------------

exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // console.log(req.requestTime)
//   //BUILD QUERY
//   // //1A) FILTERING
//   // const tourFeature = new tourFeature(Tour.find() , )
//   // const queryObj = { ...req.query };
//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//   // excludedFields.forEach((el) => delete queryObj[el]);

//   // //1B)ADVANCE QUERY
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // let query = Tour.find(JSON.parse(queryStr));

//   //Sorting

//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort('-createAt');
//   // }

//   //Fields limiting

//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   //Pagination

//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 5;
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);
//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('this page does not exist');
//   // }
//   // const query = tour.find().where('duration').equals(5).where('difficulty').equals('easy')

//   //EXCUTE QUERY
//   const features = new ApiFeature(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   //RESPONSE
//   res.status(200).json({
//     status: 'success',
//     createAt: req.requestTime,
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });


exports.getTour = factory.getOne(Tour, {path: 'reviews'})
// exports.getTour = catchAsync(async (req, res, next) => {
//   // Tour.findOne({_id: req.params.id})
//   // we use populate because in the model we refrece the 'guides' for User model , and it's only in query and not into actual database (we give data users when query to database and it's not into database)
//   //this populate function is absulotly fundementall tool for working with data in mongoose and with relationship between data and we shold use this in right way
//   //since populate is new query  we shold use this in right way because it have effect for performance
//   const tour = await Tour.findById(req.params.id).populate('reviews')
//   // .populate({
//   //   path: 'guides',
//   //   // we don't want to show this 2 fields in the results👇
//   //   select: '-__v -passwordChangedAt'
//   // })

//   if (!tour) {
//     return next(new AppError('no tour found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });


exports.deleteTour = factory.deleteOne(Tour)
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('no tour found with that id', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
//   // const id = req.params.id * 1;
//   // const tourIndex = tours.findIndex(el => el.id === id)
//   // console.log('tourIndex='+ tourIndex)
//   // tours.splice(tourIndex , 1)
//   // res.status(200).json({
//   //   status: 'success',
//   //   messsage: 'delete success'
//   // })
// });


exports.updateTour = factory.updateOne(Tour)
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     //runValidators means if we update the document then validate data again runs, and if we set to false then data doesn't validate again in update mode
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('no tour found with that id', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     tour,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$ratingsAverage',
        //_id: null
        _id: { $toUpper: '$difficulty' },
        numtours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      //1 => for ascending
      //-1 => for descending
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: {$ne: 'EASY'} }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}/01/01`),
          $lte: new Date(`${year}/12/31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    plan,
  });
});
