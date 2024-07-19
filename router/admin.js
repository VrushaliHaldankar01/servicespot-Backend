const express = require('express');
const adminService = require('../service/admin');
const verifyToken = require('../middleware/verifyToken');

const app = express();
const router = express.Router();

//add
router.post('/addCategory', adminService.addCategory);
router.post('/addSubcategory', adminService.addSubcategory);
router.post('/addPopularCategory', adminService.addPopularCategory);
router.post('/addTrendingCategory', adminService.addTrendingCategory);

//fetch
router.get('/fetchCategory', adminService.fetchCategory);
router.get('/fetchSubCategory', adminService.fetchSubCategory);
router.get('/fetchPopularCategory', adminService.fetchPopularCategory);
router.get('/fetchTrendingCategory', adminService.fetchTrendingCategory);
// router.get('/login', userService.userlogin);

module.exports = router;
