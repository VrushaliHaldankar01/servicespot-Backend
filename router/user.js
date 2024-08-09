const express = require('express');
const userService = require('../service/user');
const verifyToken = require('../middleware/verifyToken');
const {
  uploadSingle,
  uploadMultiple,
} = require('../middleware/multerMiddleware');

const app = express();
const router = express.Router();

router.post(
  '/register',

  userService.createUser
);
router.put('/editUser/:userId', userService.editUser);

router.post('/login', userService.userlogin);

//fetch
router.get('/userdetails', userService.userDetails);

module.exports = router;
