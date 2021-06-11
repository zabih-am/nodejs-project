const AppError = require('./../utils/appError');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('invalid token please login again', 401)
const handleJWTExpiredError = () => AppError('your token has expired, please log in again', 401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error 🤬', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};
module.exports = (err, req, res, next) => {
  //error.stack say where error happen
  console.log(process.env.NODE_ENV);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(process.env.NODE_ENV);
  console.log(typeof process.env.NODE_ENV);
  console.log(process.env.NODE_ENV === 'production')
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    console.log('dev error');
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log('prod error');
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if(error.name === 'JsonWebTokenError') error = handleJWTError()
    if(error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    sendErrorProd(error, res);
  }
};
