const mongoose = require('mongoose');
const crypto = require('crypto')
const validator = require('validator');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    //lowercase not a validation and just convert email to lower case
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email.'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //This only work for SAVE or CREATE and it's not work for UPDATE
      validator: function(el){
        return el === this.password
      },
      message: 'passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.pre('save', async function(next){
  //if password don't change we don't want to hash or encript again or only this function run if password was actualy modified
  if(!this.isModified('password')) return next()

  //hash the password with cost of 12 (cost means the security of the password and cpu intensive)
  this.password =await bcrypt.hash(this.password, 12)

  //delete confirmPassword field(you might think it's require but it's requitre for input data not in database)
  this.confirmPassword = undefined;
  next()
})

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//function for given password is the same with password stored in document
//we create a instence method => instence method are avalable in all document of a certain collection
//candidatePassword means password user pass in the body 
//the goal of this function is only return true or false
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
  //this keyword points to the current document but since in this document for password we select = false we can't access to the password with this keyword
  return await bcrypt.compare(candidatePassword, userPassword)
  //return true or false👆
}

//JWTTimesStamp => when the token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimesStamp){
  // if passwordChangedAt doesn't exist that means the user never change your password
  if(this.passwordChangedAt) {
    //conver passwordChangeAt to the format of JWTTimeStamp
    // 10 means parse in intejer with base 10 number
    const changeTimesStamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10)
    console.log(this.passwordChangedAt, JWTTimesStamp)
    return JWTTimesStamp < changeTimesStamp
  }

  //false means password not changed
  return false
}

userSchema.methods.createPasswordResetToken = function(){
  //32 is the number of characters and then convert to hex-decimal string.
  //we should never store reset token in database because we send this token to the user and it's like a reset password that =>
  //=> user can use to create new real password and only user have access to this token and it's behave like a password and since it's like a =>
  //=> password and if hacker access to the database then that allow to the hacker to access to the account by set the new password
  const resetToken = crypto.randomBytes(32).toString('hex')
  // 'sha256' a type of hash algorithem
  // we store encripted token in the database
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  // 10 * 60 * 1000 means 10 min but in mili second
  console.log({resetToken} , this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model('User', userSchema);
module.exports = User;
