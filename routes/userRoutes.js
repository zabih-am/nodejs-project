const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//all the route after this middleware run protect first => this router file like a mini applicatin and we can use router.use middleware for this mini application
//protect all route after this middleware
router.use(authController.protect)

router.patch(
  '/updateMyPassword',
  authController.updatePassword
);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

//all the route after this middleware run restricTo
router.use(authController.restricTo('admin'))

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
