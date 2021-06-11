const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')


const app = express();

//1) GLOBAL MIDDLEWARE

//set security HTTP headers and it's important to always install this package and use it in the first of the global middlewares
app.use(helmet())

//development logging
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'))
}

// this middleware for limit request for a same IP
const limiter = rateLimit({
  //allow 100 request from same IP in One hour 
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP, please try again in an hour!'
})
app.use('/api', limiter)

//Body parser, reading data from body into req.body
//if body larger then 10kb it's not be excepted
app.use(express.json({ limit: '10kb' })) 

//data sanitization against NoSQL query injection
//it's look at request body, request query string and request params and it's filter out all of the '$' and . because mongoDB operators writen by '$' , '.'
app.use(mongoSanitize())

//Data sanitization against xss
//this prevent to inject html and js sript into database
app.use(xss())

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//serving static files
app.use(express.static(`${__dirname}/public`))


//test middleware
app.use((req , res , next)=>{
 console.log('this is a test for middleware 🤞')
 next()
})

app.use((req , res , next)=>{
  req.requestTime = new Date().toISOString();
  next()
})


//2)ROUTE
// app.get('/api/v1/tours' , getAllTours)
// app.post('/api/v1/tours' , createTour)
// app.get('/api/v1/tours/:id' , getTour)
// app.patch('/api/v1/tours/:id' , updateTour)
// app.delete('/api/v1/tours/:id' ,  deleteTour)
app.use('/api/v1/tours' , tourRouter)
app.use('/api/v1/users' , userRouter)

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} in this server`
  // })
  // const err = new Error(`can't find ${req.originalUrl} in this server`)
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} in this server`, 404))
 })

app.use(globalErrorHandler);

module.exports = app

