const express = require('express');
const adminService = require('../service/admin');
const verifyToken = require('../middleware/verifyToken');

const app = express();
const router = express.Router();

//add
router.post('/addCategory', adminService.addCategory);
router.post('/addOrEditCategory', adminService.addOrEditCategory);
router.post('/addSubcategory', adminService.addSubcategory);
router.post('/addOrEditSubcategory', adminService.addOrEditSubcategory);
router.post('/addPopularCategory', adminService.addPopularCategory);
router.post('/addTrendingCategory', adminService.addTrendingCategory);

//fetch
router.get('/fetchCategory', adminService.fetchCategory);
router.get('/fetchSubCategory', adminService.fetchSubCategory);
router.get(
  '/fetchPerticularSubCategory',
  adminService.fetchPerticularSubCategory
);

router.get('/fetchPopularCategory', adminService.fetchPopularCategory);
router.get('/fetchTrendingCategory', adminService.fetchTrendingCategory);

//delete
router.put('/deletePopularCategory/:id', adminService.deletePopularCategory);
router.put('/deleteTrendingCategory/:id', adminService.deleteTrendingCategory);
router.put('/deleteCategory/:id', adminService.deleteCategory);
router.put('/deleteSubCategory/:id', adminService.deleteSubCategory);

// router.get('/login', userService.userlogin);

module.exports = router;
