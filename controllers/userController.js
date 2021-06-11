const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError')

const filterObj = (obj, ...allowedFields) => {
  //Object.keys(obj) => return array of obj keys
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)){
      newObj[el] = obj[el]
    }
  })
  return newObj
}

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

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user POSTed password data
  if(req.body.password || req.body.confirmPassword){
    return next(new AppError('this route is not for password update, please use /updateMyPassword', 400))
  }
  //2)filtered out unwanted fields names that are not allowed to be updated
  // for security we filter req.body because some times user maybe wanted to change role to admin and we shold don't let user to do that by  filter req.body
  const filteredBody = filterObj(req.body, 'name', 'email')

  //3)update user document
  // console.log(filteredBody)
  const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody, {
    // new: true => means return new updated object insted of old one
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  })
})

exports.deleteMe =catchAsync(async(req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active: false})
  res.status(204).json({
    status: 'success',
    data: null
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