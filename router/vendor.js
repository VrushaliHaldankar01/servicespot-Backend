const express = require('express');
const vendorService = require('../service/vendor');
const verifyToken = require('../middleware/verifyToken');

const app = express();
const router = express.Router();

//fetch
router.get('/vendorDetails', vendorService.fetchVendorDetails);
router.get('/vendorwrtsubcategory', vendorService.fetchVendorWrtSubcategory);
router.put('/updateStatus/:id', vendorService.updateStatus);
// router.get('/login', userService.userlogin);

module.exports = router;
