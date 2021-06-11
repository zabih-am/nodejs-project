const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');


//HANDLER FUNCTION FOR USER ROUTE
exports.getAllUsers =catchAsync(async (req , res)=>{
  const users = await User.find()

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  })
})

exports.getUser = (req , res)=>{
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet die'
  })
}
exports.createUser = (req , res)=>{
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet die'
  })
}

exports.updateUser = (req , res)=>{
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet die'
  })
}

exports.deleteUser = (req , res)=>{
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet die'
  })
}