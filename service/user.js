const mongoose = require('mongoose');
const User = require('../models/user');
// const Vendor = require('../models/vendor');
const { Vendor, Catalogue } = require('../models/vendor');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  uploadSingle,
  uploadMultiple,
} = require('../middleware/multerMiddleware');
const bucket = require('../firebaseAdmin'); // Import Firebase bucket instance

const userlogin = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: userEmail }).exec();

    if (user) {
      const checkpassword = await bcrypt.compare(password, user.password);
      if (checkpassword) {
        const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
          expiresIn: '1h',
        });
        res.json({ token, user });
      } else {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    } else {
      return res.status(401).json({ error: 'Invalid user. Please register.' });
      //res.send('Invalid user. Please register.');
    }
  } catch (error) {
    console.error(error);

    //res.status(400).json({ error: 'Invalid username or password' });
    return res
      .status(500)
      .json({ error: 'Server error. Please try again later.' });
  }
};

const createUser = async (req, res) => {
  const handleUserCreation = async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phonenumber,
        isVendor,
        businessname,
        businessdescription,
        province,
        city,
        postalcode,
        businessnumber,
        category,
        subcategory,
        status,
      } = req.body;

      const role = isVendor === 'true' || isVendor === true ? 'vendor' : 'user';

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const checkUser = await User.findOne({ email, role });

      if (checkUser) {
        return res.status(400).json({ error: 'Email id already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phonenumber,
        role,
        createdAt: Date.now(),
      });

      const token = jwt.sign({ userId: newUser._id }, process.env.SECRET, {
        expiresIn: '1h',
      });

      if (isVendor) {
        const files = req.files; // Array of files uploaded
        const fileUrls = files.map((file) => file.firebaseUrl);

        const newVendor = await Vendor.create({
          vendorid: newUser._id,
          businessname,
          businessdescription,
          province,
          city,
          postalcode,
          businessnumber,
          businessImages: fileUrls,
          category, // Store the category ID
          subcategory, // Store the subcategory ID
          status: 'pending',
          isActive: true,
          createdAt: Date.now(),
        });

        return res.json({ token, newUser, newVendor });
      } else {
        res.json({ token, newUser });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Server Error');
    }
  };

  if (
    req.headers['content-type'] &&
    req.headers['content-type'].includes('multipart/form-data')
  ) {
    uploadMultiple('businessImages')(req, res, function (err) {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(500).send('Error uploading file');
      }
      handleUserCreation(req, res);
    });
  } else {
    handleUserCreation(req, res);
  }
};

const userDetails = async (req, res) => {
  try {
    const { email } = req.query;

    // Ensure the ID is provided
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Fetch the user by ID
    const user = await User.findOne({ email: email, isActive: true }).exec();

    if (user) {
      // Return user details
      res.json({ user });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Server error. Please try again later.' });
  }
};

// const editUser = async (req, res) => {
//   const handleUserUpdate = async (req, res) => {
//     try {
//       const { userId } = req.params;
//       const {
//         firstName,
//         lastName,
//         email,
//         phonenumber,
//         isVendor,
//         businessname,
//         businessdescription,
//         province,
//         city,
//         postalcode,
//         businessnumber,
//         category,
//         subcategory,
//         status,
//       } = req.body;

//       const updatedFields = { firstName, lastName, email, phonenumber };

//       // Update the User document
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: updatedFields },
//         { new: true }
//       );

//       if (isVendor) {
//         const files = req.files; // Array of files uploaded
//         const fileUrls = files ? files.map((file) => file.firebaseUrl) : [];

//         const updatedVendorFields = {
//           businessname,
//           businessdescription,
//           province,
//           city,
//           postalcode,
//           businessnumber,
//           businessImages: fileUrls,
//           category,
//           subcategory,
//           status,
//         };

//         // Update the Vendor document
//         const updatedVendor = await Vendor.findOneAndUpdate(
//           { vendorid: userId },
//           { $set: updatedVendorFields },
//           { new: true }
//         );

//         return res.json({ updatedUser, updatedVendor });
//       } else {
//         res.json({ updatedUser });
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('Server Error');
//     }
//   };

//   // Check if the request is multipart/form-data
//   if (
//     req.headers['content-type'] &&
//     req.headers['content-type'].includes('multipart/form-data')
//   ) {
//     uploadMultiple('businessImages')(req, res, function (err) {
//       if (err) {
//         console.error('Error uploading file:', err);
//         return res.status(500).send('Error uploading file');
//       }
//       handleUserUpdate(req, res);
//     });
//   } else {
//     handleUserUpdate(req, res);
//   }
// };

//delete Account

// const editUser = async (req, res) => {
//   const handleUserUpdate = async (req, res) => {
//     try {
//       const { userId } = req.params;
//       const {
//         firstName,
//         lastName,
//         email,
//         phonenumber,
//         isVendor,
//         businessname,
//         businessdescription,
//         province,
//         city,
//         postalcode,
//         businessnumber,
//         category,
//         subcategory,
//         status,
//       } = req.body;

//       // Build the updated fields object with provided values
//       const updatedFields = {};
//       if (firstName) updatedFields.firstName = firstName;
//       if (lastName) updatedFields.lastName = lastName;
//       if (email) updatedFields.email = email;
//       if (phonenumber) updatedFields.phonenumber = phonenumber;

//       // Update the User document
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: updatedFields },
//         { new: true }
//       );

//       if (isVendor) {
//         console.log('isVendor is true. Proceeding with vendor update.');
//         const files = req.files; // Array of files uploaded
//         const fileUrls = files ? files.map((file) => file.firebaseUrl) : [];
//         console.log('Files:', files); // Debugging

//         // Build the updated vendor fields object with provided values
//         const updatedVendorFields = {};
//         if (businessname) updatedVendorFields.businessname = businessname;
//         if (businessdescription)
//           updatedVendorFields.businessdescription = businessdescription;
//         if (province) updatedVendorFields.province = province;
//         if (city) updatedVendorFields.city = city;
//         if (postalcode) updatedVendorFields.postalcode = postalcode;
//         if (businessnumber) updatedVendorFields.businessnumber = businessnumber;
//         if (category) updatedVendorFields.category = category;
//         if (subcategory) updatedVendorFields.subcategory = subcategory;
//         if (status) updatedVendorFields.status = status;
//         if (fileUrls.length > 0) updatedVendorFields.businessImages = fileUrls;

//         console.log('Updated Vendor Fields:', updatedVendorFields); // Debugging

//         // Update the Vendor document
//         const updatedVendor = await Vendor.findOneAndUpdate(
//           { vendorid: userId },
//           { $set: updatedVendorFields },
//           { new: true }
//         );

//         if (!updatedVendor) {
//           console.log('Vendor not found or not updated.');
//         }

//         return res.json({ updatedUser, updatedVendor });
//       } else {
//         res.json({ updatedUser });
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('Server Error');
//     }
//   };

//   // Check if the request is multipart/form-data
//   if (
//     req.headers['content-type'] &&
//     req.headers['content-type'].includes('multipart/form-data')
//   ) {
//     uploadMultiple('businessImages')(req, res, function (err) {
//       if (err) {
//         console.error('Error uploading file:', err);
//         return res.status(500).send('Error uploading file');
//       }
//       handleUserUpdate(req, res);
//     });
//   } else {
//     handleUserUpdate(req, res);
//   }
// };
// const editUser = async (req, res) => {
//   const handleUserUpdate = async (req, res) => {
//     try {
//       const { userId } = req.params;
//       const {
//         firstName,
//         lastName,
//         email,
//         phonenumber,
//         role, // Added role here
//         businessname,
//         businessdescription,
//         province,
//         city,
//         postalcode,
//         businessnumber,
//         category,
//         subcategory,
//         status,
//       } = req.body;

//       // Build the updated fields object with provided values
//       const updatedFields = {};
//       if (firstName) updatedFields.firstName = firstName;
//       if (lastName) updatedFields.lastName = lastName;
//       if (email) updatedFields.email = email;
//       if (phonenumber) updatedFields.phonenumber = phonenumber;
//       if (role) updatedFields.role = role; // Adding role to the updated fields

//       // Update the User document
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: updatedFields },
//         { new: true }
//       );

//       // Proceed only if the role is 'vendor'
//       if (role === 'vendor') {
//         console.log('Role is vendor. Proceeding with vendor update.');
//         const files = req.files; // Array of files uploaded
//         const fileUrls = files ? files.map((file) => file.firebaseUrl) : [];
//         console.log('Files:', files); // Debugging

//         // Build the updated vendor fields object with provided values
//         const updatedVendorFields = {};
//         if (businessname) updatedVendorFields.businessname = businessname;
//         if (businessdescription)
//           updatedVendorFields.businessdescription = businessdescription;
//         if (province) updatedVendorFields.province = province;
//         if (city) updatedVendorFields.city = city;
//         if (postalcode) updatedVendorFields.postalcode = postalcode;
//         if (businessnumber) updatedVendorFields.businessnumber = businessnumber;
//         if (category) updatedVendorFields.category = category;
//         if (subcategory) updatedVendorFields.subcategory = subcategory;
//         if (status) updatedVendorFields.status = status;
//         if (fileUrls.length > 0) updatedVendorFields.businessImages = fileUrls;

//         console.log('Updated Vendor Fields:', updatedVendorFields); // Debugging

//         // Update the Vendor document
//         const updatedVendor = await Vendor.findOneAndUpdate(
//           { vendorid: userId },
//           { $set: updatedVendorFields },
//           { new: true }
//         );

//         if (!updatedVendor) {
//           console.log('Vendor not found or not updated.');
//         }

//         return res.json({ updatedUser, updatedVendor });
//       } else {
//         return res.json({ updatedUser });
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       return res.status(500).send('Server Error');
//     }
//   };

//   // Check if the request is multipart/form-data
//   if (
//     req.headers['content-type'] &&
//     req.headers['content-type'].includes('multipart/form-data')
//   ) {
//     uploadMultiple('businessImages')(req, res, function (err) {
//       if (err) {
//         console.error('Error uploading file:', err);
//         return res.status(500).send('Error uploading file');
//       }
//       handleUserUpdate(req, res);
//     });
//   } else {
//     handleUserUpdate(req, res);
//   }
// };
const editUser = async (req, res) => {
  const handleUserUpdate = async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        firstName,
        lastName,
        email,
        phonenumber,
        role, // Added role here
        businessname,
        businessdescription,
        province,
        city,
        postalcode,
        businessnumber,
        category,
        subcategory,
        status,
      } = req.body;

      // Build the updated fields object with provided values
      const updatedFields = {};
      if (firstName) updatedFields.firstName = firstName;
      if (lastName) updatedFields.lastName = lastName;
      if (email) updatedFields.email = email;
      if (phonenumber) updatedFields.phonenumber = phonenumber;
      if (role) updatedFields.role = role; // Adding role to the updated fields

      // Update the User document
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updatedFields },
        { new: true }
      );

      // Proceed only if the role is 'vendor'
      if (role === 'vendor') {
        console.log('Role is vendor. Proceeding with vendor update.');

        // Get existing vendor details
        const existingVendor = await Vendor.findOne({ vendorid: userId });

        // Handle file uploads if present
        const files = req.files;
        const fileUrls = files ? files.map((file) => file.firebaseUrl) : [];
        console.log('Files:', files); // Debugging

        // Build the updated vendor fields object with provided values
        const updatedVendorFields = {};
        if (businessname) updatedVendorFields.businessname = businessname;
        if (businessdescription)
          updatedVendorFields.businessdescription = businessdescription;
        if (province) updatedVendorFields.province = province;
        if (city) updatedVendorFields.city = city;
        if (postalcode) updatedVendorFields.postalcode = postalcode;
        if (businessnumber) updatedVendorFields.businessnumber = businessnumber;
        if (category) updatedVendorFields.category = category;
        if (subcategory) updatedVendorFields.subcategory = subcategory;
        if (status) updatedVendorFields.status = status;

        // Use new images if available, otherwise keep the old ones
        if (fileUrls.length > 0) {
          updatedVendorFields.businessImages = fileUrls;
        } else if (existingVendor && existingVendor.businessImages) {
          updatedVendorFields.businessImages = existingVendor.businessImages;
        }

        console.log('Updated Vendor Fields:', updatedVendorFields); // Debugging

        // Update the Vendor document
        const updatedVendor = await Vendor.findOneAndUpdate(
          { vendorid: userId },
          { $set: updatedVendorFields },
          { new: true }
        );

        if (!updatedVendor) {
          console.log('Vendor not found or not updated.');
        }

        return res.json({ updatedUser, updatedVendor });
      } else {
        return res.json({ updatedUser });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).send('Server Error');
    }
  };

  // Check if the request is multipart/form-data
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].includes('multipart/form-data')
  ) {
    uploadSingle('businessImages')(req, res, function (err) {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(500).send('Error uploading file');
      }
      handleUserUpdate(req, res);
    });
  } else {
    handleUserUpdate(req, res);
  }
};

// Delete Account API (soft delete)
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.query; // Get the user ID from the request parameters

    // Find the user by ID and update the `isActive` field
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: Date.now() }, // Set `isActive` to false and update `updatedAt`
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User account deactivated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error deactivating user account:', error);
    res.status(500).send('Server Error');
  }
};

// Update Password API

const updatePassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;

    // Validate inputs
    if (!id || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'User ID, old password, and new password are required.',
      });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare the old password with the stored hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the database
    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
      updatedAt: Date.now(),
    });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  userlogin,
  createUser,
  userDetails,
  editUser,
  deleteAccount,
  updatePassword,
};
