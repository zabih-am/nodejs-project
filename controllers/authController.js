// const util = require('util')
//we use destructuring ES6 for take promisify directly for the util object
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

//function for create token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body) => this aproach is not secure because we create user uses all the data in the body the problem here is that any one can spcified the role as and admin
  //the secure version👇
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //1) check if email and password exist
  const { email, password } = req.body;
  if ((!email, !password)) {
    // we shold return because we don't want to run code ofter it
    return next(new AppError('please provide email and password', 401));
  }
  //2) check for user exist && password correct
  //we put plus(+) before the password because in model we select= false and we want select here for this reson add plus (explicitly select)
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  //since the correctPassword is a instance method it's avaliable in all document
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorect email or password', 401));
  }

  //3) if everything ok send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    next(
      new AppError('you are not logged in! please log in to get access', 401)
    );
  }

  //2) verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);
  //3) check if user still exist
  // check if user exist in database because someone want to access a certain user by his token after the user not exist and we  Prevent it and don't let it
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    next(
      new AppError('the user belong to this token does not longer exist', 401)
    );
  }

  //4)check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('user recently change password, please log in again', 401)
    );
  }

  //GRAND ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(`you don't have permissin to perform this action`, 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('there is no user with email address', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //validateBeforeSave: false => deActivate all validator that we defind in schema
  await user.save({ validateBeforeSave: false });
  // 3) send it to user's email
  //resetURL means the url we send to the user email and user can click on it and reset the password
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  // if happen an error in sendEmail we shold send an error message to the client but in this case we actuly need do more then simply send an error message we need to set back the password reset token and password reset expire that we defind
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token send to email',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });

    return next('there was an error sending the email, try again later', 500);
  }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
  // 1) Get user based on the token
  // hash the token for compare with hash token in database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
    // we implement this feature in user model and before save the document by pre hook
  // 4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
