const mongoose = require('mongoose');
const { Category, Subcategory } = require('../models/admin');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  uploadSingle,
  uploadMultiple,
} = require('../middleware/multerMiddleware');
const bucket = require('../firebaseAdmin'); // Import Firebase bucket instance

//add Category
const addCategory = async (req, res) => {
  try {
    // Check if request content type is multipart/form-data
    if (
      req.headers['content-type'] &&
      req.headers['content-type'].includes('multipart/form-data')
    ) {
      // Handle multipart/form-data uploads using multer
      uploadSingle('categoryImage')(req, res, async (err) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).send('Error uploading file');
        }
        try {
          const { name, description } = req.body;

          if (!name || !description) {
            return res
              .status(400)
              .json({ message: 'Name and description required' });
          }

          const existingCategory = await Category.findOne({ name });
          if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
          }

          const categoryImage = req.file ? req.file.firebaseUrl : '';

          // Create new category instance
          const newCategory = new Category({
            name,
            description,
            categoryImage,
            createdAt: Date.now(),
          });

          // Save category to database
          const savedCategory = await newCategory.save();

          res.status(201).json(savedCategory);
        } catch (error) {
          console.error('Error:', error);
          res.status(500).send('Server Error');
        }
      });
    } else {
      // Handle normal form data processing
      const { name, description } = req.body;

      console.log('Request Body:', req.body);
      console.log('name', req.body.name);

      if (!name || !description) {
        return res
          .status(400)
          .json({ message: 'Name and description required' });
      }

      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      // Create new category instance
      const newCategory = new Category({
        name,
        description,
        createdAt: Date.now(),
      });

      // Save category to database
      const savedCategory = await newCategory.save();

      res.status(201).json(savedCategory);
    }
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Server Error');
  }
};

//add sub Category
const addSubcategory = async (req, res) => {
  try {
    const { name, description, CategoryName } = req.body;

    // Find the parent category
    const parentCategory = await Category.findOne({ name: CategoryName });

    console.log('parentcategory', parentCategory);
    const findSubcategory = await Subcategory.findOne({ name });
    if (!parentCategory) {
      return res.status(400).json({ message: 'category does not  exists' });
    }
    if (findSubcategory) {
      return res.status(400).json({ message: 'sub category already exists' });
    }

    const newSubcategory = new Subcategory({
      name,
      description,
      category: parentCategory._id,
      createdAt: Date.now(),
    });

    const savedsubcategory = await newSubcategory.save();
    res.status(201).json(savedsubcategory);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};
module.exports = {
  addCategory,
  addSubcategory,
};
