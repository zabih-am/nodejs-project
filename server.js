const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app')
dotenv.config({path: './config.env'})

// const DB = process.env.DATABASE.replace('<PASSWORD>' , process.env.DATABASE_PASSWORD)
const DB = process.env.DATABASE_LOCAL
mongoose.connect(DB , {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => console.log('DB conections successfull'))

// const testTour = new Tour({
//   name: 'test name 1',
//   price : 2000,
//   rating: 4.7
// })
// testTour.save().then((doc)=>{
//   console.log(doc)
// }).catch((err)=>{
//   console.log('ERROR🤦‍♂️' + err)
// })

const port = 3000;
// console.log(app.get('env'))
// console.log(process.env)

const server = app.listen(port , ()=>{
  console.log(`app running on port ${port}`)
  // console.log(process.env.NODE_ENV)
})

process.on('unhandledRejection' , (err)=>{
  console.log(error.name, err.message)
  console.log('UNHANDLE REJECTION! 💩 showting down ...')
  //with server.close we give the server time to finish all request that are still pending being handle at the time => and only ofter that the server killed
  server.close(()=>{
    //process.exit() gives two argument 1 or 0 => and 0 for success and 1 for uncaught exception
    process.exit(1)
  })
})