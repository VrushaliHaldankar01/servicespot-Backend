const mongoose = require('mongoose');
const User = require('../models/user');
const Vendor = require('../models/vendor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  uploadSingle,
  uploadMultiple,
} = require('../middleware/multerMiddleware');
const bucket = require('../firebaseAdmin'); // Import Firebase bucket instance

// const {
//   uploadSingle,
//   uploadMultiple,
// } = require('../middleware/multerMiddleware');

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
      const userfirstName = req.body.firstName;
      const userlastName = req.body.lastName;
      const userEmail = req.body.email;
      const userPassword = req.body.password;
      const userphonenumber = req.body.phonenumber;
      const isVendor =
        req.body.isVendor === 'true' || req.body.isVendor === true;
      const role = isVendor ? 'vendor' : 'user';

      if (!userEmail || !userPassword) {
        // return res.status(400).send('Email and password are required');
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const checkUser = await User.findOne({ email: userEmail, role });

      if (checkUser) {
        // return res.send('Email id already exists');
        //return res.send(400).json({ error: 'Email id already exists' });
        return res.status(400).json({ error: 'Email id already exists' });
      }

      console.log('Password before hashing:', userPassword);

      // Hash the password with the salt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userPassword, salt);

      const newUser = await User.create({
        firstName: userfirstName,
        lastName: userlastName,
        email: userEmail,
        password: hashedPassword,
        phonenumber: userphonenumber,
        role: role,
        createdAt: Date.now(),
      });

      const token = jwt.sign({ userId: newUser._id }, process.env.SECRET, {
        expiresIn: '1h',
      });

      console.log('User created:', newUser);

      if (isVendor) {
        const files = req.files; // Array of files uploaded
        //const filepaths = files.map((file) => file.path); // Array of file paths
        const fileUrls = files.map((file) => file.firebaseUrl);
        const newVendor = await Vendor.create({
          vendorid: newUser._id,
          businessname: req.body.businessname,
          businessdescription: req.body.businessdescription,
          province: req.body.province,
          city: req.body.city,
          pincode: req.body.pincode,
          businessImages: fileUrls, // Array of file paths
          isActive: true,
          createdAt: Date.now(),
        });

        console.log('New vendor created:', newVendor);

        return res.json({ token, newUser, newVendor });
      } else {
        res.json({ token, newUser });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Server Error');
    }
  };

  // Check if there is a file being uploaded
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].includes('multipart/form-data')
  ) {
    uploadMultiple('businessImages')(req, res, function (err) {
      // Use uploadSingle or uploadMultiple as per your requirement
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

//fetch userdetails
const userDetails = async (req, res) => {
  try {
    const { email } = req.query;

    // Ensure the ID is provided
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Fetch the user by ID
    const user = await User.findOne({ email: email }).exec();

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

module.exports = {
  userlogin,
  createUser,
  userDetails,
};
