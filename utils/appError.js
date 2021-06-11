class AppError extends Error {
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        //all operational error set isOperational= true **** and error like logical,programming errors and some other error not have this isOperational property
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
    }
}
module.exports = AppError