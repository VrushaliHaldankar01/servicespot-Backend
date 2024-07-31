const mongoose = require('mongoose');
const Vendor = require('../models/vendor');
const user = require('../models/vendor');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  uploadSingle,
  uploadMultiple,
} = require('../middleware/multerMiddleware');
const bucket = require('../firebaseAdmin'); // Import Firebase bucket instance

//fetch vendor details
const fetchVendorDetails = async (req, res) => {
  try {
    const { name } = req.query;
    let vendorDetails;

    if (name) {
      vendorDetails = await Vendor.find({ name: name });
      if (vendorDetails.length === 0) {
        return res.status(400).json({ message: 'No Vendor found' });
      }
    } else {
      vendorDetails = await Vendor.find({});
    }

    res.status(200).json(vendorDetails);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  fetchVendorDetails,
};
