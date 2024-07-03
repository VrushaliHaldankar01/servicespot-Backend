const express = require('express');
const adminService = require('../service/admin');
const verifyToken = require('../middleware/verifyToken');

const app = express();
const router = express.Router();

router.post('/addCategory', adminService.addCategory);
router.post('/addSubcategory', adminService.addSubcategory);

// router.get('/login', userService.userlogin);

module.exports = router;
