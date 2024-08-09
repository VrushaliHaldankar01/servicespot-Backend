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

// const fetchVendorDetails = async (req, res) => {
//   try {
//     const { name } = req.query;
//     let vendorDetails;

//     if (name) {
//       vendorDetails = await Vendor.find({ name: name });
//       if (vendorDetails.length === 0) {
//         return res.status(400).json({ message: 'No Vendor found' });
//       }
//     } else {
//       vendorDetails = await Vendor.find({});
//     }

//     res.status(200).json(vendorDetails);
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Server Error');
//   }
// };

const fetchVendorDetails = async (req, res) => {
  try {
    const { id, name, status } = req.query;
    let query = {};

    // Build the query object based on the provided query parameters
    if (id) {
      query._id = id;
    }

    if (name) {
      query.businessname = name;
    }

    if (status) {
      query.status = status;
    }

    // Fetch vendors based on the constructed query and populate user, category, and subcategory details
    const vendorDetails = await Vendor.find(query)
      .populate('vendorid')
      .populate('category', 'name') // Populate category name
      .populate('subcategory', 'name'); // Populate subcategory name

    if (vendorDetails.length === 0) {
      // Specific message for no vendors found with a given status
      if (status) {
        return res
          .status(404)
          .json({ message: `No vendors found with status '${status}'` });
      }
      // Generic message for no vendors found with other criteria
      return res.status(404).json({ message: 'No vendors found.' });
    }

    res.status(200).json(vendorDetails);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

module.exports = fetchVendorDetails;

// const fetchVendorWrtSubcategory = async (req, res) => {
//   try {
//     const { id } = req.query;
//     let vendordetails;

//     if (id) {
//       // Fetch vendors by the provided subcategory ID
//       vendordetails = await Vendor.find({
//         subcategory: id,
//         isActive: true,
//       }).populate({
//         path: 'subcategory', // Path to populate
//         select: 'name', // Select specific fields from the populated subcategory
//         populate: {
//           path: 'category', // Nested populate to also include category details
//           select: 'name',
//         },
//       });

//       if (vendordetails.length === 0) {
//         return res.status(400).json({ message: 'No vendor found' });
//       }
//     } else {
//       // Fetch all active vendors if no subcategory ID is provided
//       vendordetails = await Vendor.find({ isActive: true }).populate({
//         path: 'subcategory',
//         select: 'name',
//         populate: {
//           path: 'category',
//           select: 'name',
//         },
//       });
//     }

//     res.status(200).json(vendordetails);
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Server Error');
//   }
// };
const fetchVendorWrtSubcategory = async (req, res) => {
  try {
    const { id } = req.query;
    let vendordetails;

    if (id) {
      // Fetch vendors by the provided subcategory ID
      vendordetails = await Vendor.find({
        subcategory: id,
        isActive: true,
      })
        .populate({
          path: 'subcategory', // Path to populate subcategory details
          select: 'name', // Select specific fields from the populated subcategory
          populate: {
            path: 'category', // Nested populate to also include category details
            select: 'name',
          },
        })
        .populate({
          path: 'vendorid', // Populate vendorid to include user details
          select: 'firstName lastName email phonenumber', // Select specific fields from the User model
        });

      if (vendordetails.length === 0) {
        return res.status(400).json({ message: 'No vendor found' });
      }
    } else {
      // Fetch all active vendors if no subcategory ID is provided
      vendordetails = await Vendor.find({ isActive: true })
        .populate({
          path: 'subcategory',
          select: 'name',
          populate: {
            path: 'category',
            select: 'name',
          },
        })
        .populate({
          path: 'vendorid', // Populate vendorid to include user details
          select: 'firstName lastName email phonenumber', // Select specific fields from the User model
        });
    }

    res.status(200).json(vendordetails);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};
const updateStatus = async (req, res) => {
  const { id } = req.params; // Assuming the vendor ID is passed as a query parameter
  const { status } = req.body; // Assuming the status is also passed as a query parameter

  try {
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { status },
      { new: true } // This option returns the updated document
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res
      .status(500)
      .json({ message: 'Server error while updating vendor status' });
  }
};
module.exports = {
  fetchVendorDetails,
  fetchVendorWrtSubcategory,
  updateStatus,
};
