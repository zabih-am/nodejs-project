const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      //max and min length only avalable for Strings
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      //TIP: we use validator library for validate data 👇
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //enum available for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      // this only work for save👇
      validate: {
        // in validator function we will return true or false and if return value is false that means we get a validation error
        validator: function(val) {
          // this only points to current doc on NEW document creation and don't work for update => be carefull
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      //select means doesn't show this field in result
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },

    //startLocation is not a embeded document it's just a field but it's an object
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      //[Number] => array of numbers
      coordinates: [Number],
      address: String,
      description: String
    },

    //we create an embeded document, by array of objects
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],

    // guides is an embeded document with refrence
    //mongoose.schema.ObjectId => the type is mongodb Id
    //we refrence between tour and user by  'ref' keyword
    //we refrence to another model with 'ref'
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//we defind a virtual property 👇
tourSchema.virtual('durationWeeks').get(function(){
  return this.duration / 7;
})

//virtual Populate
//why we use virtual populate => we start only parent refrencing on review but that made it so that on the tour we have no access to corresponding review and the easiest fix for that is also do child refrencing on the tours but =>
// => the problem with that would be that we do not want actually keep an array of all child document on the parent document because we don't wand to grow array indefinitely =>
// => instead of doing that we implemented VIRTUAL POPULATE and this allow us to basically do the exact same thing(keeping a refrence to all the child document on the parent document but without actualy persisting that information to the database)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

//DOCUMENT MIDDLEWARE : runs before .save() and .create event but keep in mind this doesn't run for insertMany or other events
tourSchema.pre('save', function(next) {
  //in save middleware THIS keyword is gonna point to the currently process document
  // console.log(this)
  this.slug = slugify(this.name, { lower: true })
  next()
})


//EMBEDING TOUR WITH USER THIS APPROACH IS NOT A GOOD SOLUTION AND THEN WE USE REFRENCING BETWEEN TOUR AND USERS
// tourSchema.pre('save', async function(next){
//   //guidePromises is an array with full of promises which we then run by awaiting 'promise.all'
//   const guidePromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidePromises)
//   console.log(this.guides)
//   next()
// })

tourSchema.pre('save', function(next){
  console.log('will save document')
  next()
})

tourSchema.post('save', function(doc, next){
  // console.log(doc)
  console.log('after the save document')
  next()
})

//QUERY MIDDLEWARE
//regex ^find means run for all string start with 'find' like find, findOne, findOneAndDelete and ...
tourSchema.pre(/^find/, function(next){
  //this keyword point to the query object
  this.find({ secretTour: { $ne: true } }) 
  this.start = Date.now()
  next()
})

  // we use populate because in the model we refrece the 'guides' for User model , and it's only in query and not into actual database (we give data users when query to database and it's not into database)
  //this populate function is absulotly fundementall tool for working with data in mongoose and with relationship between data and we shold use this in right way
  //since populate is new query  we shold use this in right way because it have effect for performance
tourSchema.pre(/^find/, function(next){
  //this keyword points to the current query and then we populate this query
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  })
  next()
})

tourSchema.post(/^find/, function(docs, next){
  console.log(`query took ${Date.now() - this.start} in milisecond`)
  // console.log(docs)
  next()
})

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){
  //this keywork point to current aggregate
  //unshift add element to the first of the array
  // console.log(this.pipeline)
  this.pipeline().unshift( { $match: { secretTour: { $ne: true } } } )
  console.log(this.pipeline())
  next()
})

const Tour = mongoose.model('Tour' , tourSchema)

module.exports = Tour