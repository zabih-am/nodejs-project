const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
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
    }
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

//DOCUMENT MIDDLEWARE : runs before .save() and .create event but keep in mind this doesn't run for insertMany or other events
tourSchema.pre('save', function(next) {
  //in save middleware THIS keyword is gonna point to the currently process document
  // console.log(this)
  this.slug = slugify(this.name, { lower: true })
  next()
})

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