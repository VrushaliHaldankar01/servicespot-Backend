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

router.post('/login', userService.userlogin);

module.exports = router;
