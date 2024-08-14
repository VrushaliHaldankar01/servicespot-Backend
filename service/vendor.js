const mongoose = require('mongoose');

const user = require('../models/vendor');

const { Vendor, Catalogue } = require('../models/vendor');

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
//     const { id, name, status, vendorid } = req.query;
//     let query = {};

//     // Build the query object based on the provided query parameters
//     if (id) {
//       query._id = id;
//     }

//     if (name) {
//       query.businessname = name;
//     }
//     if (vendorid) {
//       query.vendorid = vendorid;
//     }

//     if (status) {
//       query.status = status;
//     }

//     // Fetch vendors based on the constructed query and populate user, category, and subcategory details
//     const vendorDetails = await Vendor.find(query)
//       .populate('vendorid')
//       .populate('category', 'name') // Populate category name
//       .populate('subcategory', 'name'); // Populate subcategory name

//     if (vendorDetails.length === 0) {
//       // Specific message for no vendors found with a given status
//       if (status) {
//         return res
//           .status(404)
//           .json({ message: `No vendors found with status '${status}'` });
//       }
//       // Generic message for no vendors found with other criteria
//       return res.status(404).json({ message: 'No vendors found.' });
//     }

//     res.status(200).json(vendorDetails);
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Server Error');
//   }
// };
const fetchVendorDetails = async (req, res) => {
  try {
    const { id, name, status, vendorid } = req.query;
    let query = {};

    // Build the query object based on the provided query parameters
    if (id) {
      query._id = id;
    }

    if (name) {
      query.businessname = name;
    }
    if (vendorid) {
      query.vendorid = vendorid;
    }

    if (status) {
      query.status = status;
    }

    // Fetch vendors based on the constructed query and populate user, category, and subcategory details
    const vendorDetails = await Vendor.find(query)
      .populate('vendorid', 'firstName lastName email phonenumber role') // Populate specific user fields
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
// const fetchVendorWrtSubcategory = async (req, res) => {
//   try {
//     const { id } = req.query;
//     let vendordetails;

//     if (id) {
//       // Fetch vendors by the provided subcategory ID
//       vendordetails = await Vendor.find({
//         subcategory: id,
//         isActive: true,
//       })
//         .populate({
//           path: 'subcategory', // Path to populate subcategory details
//           select: 'name', // Select specific fields from the populated subcategory
//           populate: {
//             path: 'category', // Nested populate to also include category details
//             select: 'name',
//           },
//         })
//         .populate({
//           path: 'vendorid', // Populate vendorid to include user details
//           select: 'firstName lastName email phonenumber', // Select specific fields from the User model
//         });

//       if (vendordetails.length === 0) {
//         return res.status(400).json({ message: 'No vendor found' });
//       }
//     } else {
//       // Fetch all active vendors if no subcategory ID is provided
//       vendordetails = await Vendor.find({ isActive: true })
//         .populate({
//           path: 'subcategory',
//           select: 'name',
//           populate: {
//             path: 'category',
//             select: 'name',
//           },
//         })
//         .populate({
//           path: 'vendorid', // Populate vendorid to include user details
//           select: 'firstName lastName email phonenumber', // Select specific fields from the User model
//         });
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
        })
        .populate({
          path: 'catalogue', // Populate the catalogue virtual field
          select: 'productName productDescription price productImage', // Select specific fields from the Catalogue model
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
        })
        .populate({
          path: 'catalogue', // Populate the catalogue virtual field
          select: 'productName productDescription price productImage', // Select specific fields from the Catalogue model
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

//upload catalogue
const uploadCatalogue = async (req, res) => {
  try {
    if (
      req.headers['content-type'] &&
      req.headers['content-type'].includes('multipart/form-data')
    ) {
      // Handle file upload
      uploadMultiple('productImages')(req, res, async (err) => {
        if (err) {
          console.error('Error uploading files:', err);
          return res.status(500).send('Error uploading files');
        }

        try {
          const { id, productName, productDescription, price, vendorId } =
            req.body;
          const productImages = req.files
            ? req.files.map((file) => file.firebaseUrl)
            : [];

          if (!productName || !productDescription || !price || !vendorId) {
            return res.status(400).json({
              message:
                'Product name, description, price, and vendor ID are required',
            });
          }

          if (id) {
            // Edit operation
            const catalogue = await Catalogue.findById(id);
            if (!catalogue) {
              return res.status(404).json({ message: 'Catalogue not found' });
            }

            catalogue.productName = productName;
            catalogue.productDescription = productDescription;
            catalogue.price = price;
            catalogue.vendorId = vendorId;
            catalogue.productImage =
              productImages.length > 0 ? productImages : catalogue.productImage;
            catalogue.updatedAt = Date.now();

            const updatedCatalogue = await catalogue.save();
            return res.status(200).json(updatedCatalogue);
          } else {
            // Add operation
            const newCatalogue = new Catalogue({
              productName,
              productDescription,
              price,
              vendorId,
              productImage: productImages,
              createdAt: Date.now(),
            });

            const savedCatalogue = await newCatalogue.save();
            res.status(201).json(savedCatalogue);
          }
        } catch (error) {
          console.error('Error processing catalogue:', error);
          res.status(500).send('Server Error');
        }
      });
    } else {
      // Handle normal form data processing (without file upload)
      const { id, productName, productDescription, price, vendorId } = req.body;

      if (!productName || !productDescription || !price || !vendorId) {
        return res.status(400).json({
          message:
            'Product name, description, price, and vendor ID are required',
        });
      }

      if (id) {
        // Edit operation
        const catalogue = await Catalogue.findById(id);
        if (!catalogue) {
          return res.status(404).json({ message: 'Catalogue not found' });
        }

        catalogue.productName = productName;
        catalogue.productDescription = productDescription;
        catalogue.price = price;
        catalogue.vendorId = vendorId;
        catalogue.updatedAt = Date.now();

        const updatedCatalogue = await catalogue.save();
        return res.status(200).json(updatedCatalogue);
      } else {
        // Add operation
        const newCatalogue = new Catalogue({
          productName,
          productDescription,
          price,
          vendorId,
          createdAt: Date.now(),
        });

        const savedCatalogue = await newCatalogue.save();
        res.status(201).json(savedCatalogue);
      }
    }
  } catch (error) {
    console.error('Error processing catalogue:', error);
    res.status(500).send('Server Error');
  }
};

//fetch catalogue based on vendor id
const fetchCataloguesByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.query; // Get the vendor ID from query parameters

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required' });
    }

    // Fetch catalogues by vendor ID
    const catalogues = await Catalogue.find({ vendorId });

    // Send the fetched catalogues as the response
    res.status(200).json(catalogues);
  } catch (error) {
    console.error('Error fetching catalogues by vendor ID:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  fetchVendorDetails,
  fetchVendorWrtSubcategory,
  updateStatus,
  uploadCatalogue,
  fetchCataloguesByVendorId,
};
