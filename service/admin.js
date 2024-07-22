const mongoose = require('mongoose');
const {
  Category,
  Subcategory,
  Popularcategory,
  Trendingcategory,
} = require('../models/admin');
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

// const addSubcategory = async (req, res) => {
//   try {
//     if (
//       req.headers['content-type'] &&
//       req.headers['content-type'].includes('multipart/form-data')
//     ) {
//       // Handle multipart/form-data uploads using multer
//       uploadSingle('subcategoryImage')(req, res, async (err) => {
//         if (err) {
//           console.error('Error uploading file:', err);
//           return res.status(500).send('Error uploading file');
//         }

//         try {
//           const { name, description, CategoryName } = req.body;

//           // Find the parent category
//           const parentCategory = await Category.findOne({ name: CategoryName });

//           console.log('parentcategory', parentCategory);
//           const findSubcategory = await Subcategory.findOne({ name });
//           if (!parentCategory) {
//             return res.status(400).json({ message: 'Category does not exist' });
//           }
//           if (findSubcategory) {
//             return res
//               .status(400)
//               .json({ message: 'Subcategory already exists' });
//           }

//           const subcategoryImage = req.file ? req.file.firebaseUrl : '';

//           const newSubcategory = new Subcategory({
//             name,
//             description,
//             subcategoryImage,
//             category: parentCategory._id,
//             createdAt: Date.now(),
//           });

//           const savedSubcategory = await newSubcategory.save();
//           res.status(201).json(savedSubcategory);
//         } catch (error) {
//           console.error('Error:', error);
//           res.status(500).send('Server Error');
//         }
//       });
//     } else {
//       // Handle normal form data processing without image upload
//       const { name, description, CategoryName } = req.body;

//       try {
//         const parentCategory = await Category.findOne({ name: CategoryName });

//         if (!parentCategory) {
//           return res.status(400).json({ message: 'Category does not exist' });
//         }

//         const findSubcategory = await Subcategory.findOne({ name });
//         if (findSubcategory) {
//           return res
//             .status(400)
//             .json({ message: 'Subcategory already exists' });
//         }

//         const newSubcategory = new Subcategory({
//           name,
//           description,
//           category: parentCategory._id,
//           createdAt: Date.now(),
//         });

//         const savedSubcategory = await newSubcategory.save();
//         res.status(201).json(savedSubcategory);
//       } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Server Error');
//       }
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Server Error');
//   }
// };
const addSubcategory = async (req, res) => {
  try {
    if (
      req.headers['content-type'] &&
      req.headers['content-type'].includes('multipart/form-data')
    ) {
      // Handle multipart/form-data uploads using multer
      uploadSingle('subcategoryImage')(req, res, async (err) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).send('Error uploading file');
        }

        try {
          const { name, description, CategoryName } = req.body;

          // Find the parent category
          const parentCategory = await Category.findOne({ name: CategoryName });

          console.log('parentcategory', parentCategory);
          const findSubcategory = await Subcategory.findOne({ name });
          if (!parentCategory) {
            return res.status(400).json({ message: 'Category does not exist' });
          }
          if (findSubcategory) {
            return res
              .status(400)
              .json({ message: 'Subcategory already exists' });
          }

          // Determine if there's an uploaded image
          const subcategoryImage = req.file ? req.file.firebaseUrl : '';

          const newSubcategory = new Subcategory({
            name,
            description,
            subcategoryImage,
            category: parentCategory._id,
            createdAt: Date.now(),
          });

          const savedSubcategory = await newSubcategory.save();
          res.status(201).json(savedSubcategory);
        } catch (error) {
          console.error('Error:', error);
          res.status(500).send('Server Error');
        }
      });
    } else {
      // Handle normal form data processing without image upload
      const { name, description, CategoryName } = req.body;

      try {
        const parentCategory = await Category.findOne({ name: CategoryName });

        if (!parentCategory) {
          return res.status(400).json({ message: 'Category does not exist' });
        }

        const findSubcategory = await Subcategory.findOne({ name });
        if (findSubcategory) {
          return res
            .status(400)
            .json({ message: 'Subcategory already exists' });
        }

        const newSubcategory = new Subcategory({
          name,
          description,
          category: parentCategory._id,
          createdAt: Date.now(),
        });

        const savedSubcategory = await newSubcategory.save();
        res.status(201).json(savedSubcategory);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

//add Popular category

const addPopularCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let newpopularCategory;
    let category;

    if (name) {
      category = await Category.findOne({ name: name });
      if (category.length === 0) {
        return res.status(400).json({ message: 'No category found' });
      }
      newpopularCategory = new Popularcategory({
        category: category._id,
        createdAt: Date.now(),
      });
    } else {
      return res.status(400).json({ message: 'Category name is required' });
    }
    // Save category to database
    const savedCategory = await newpopularCategory.save();
    res.status(200).json(savedCategory);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//add Trending Category
const addTrendingCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let newtrendingCategory;
    let category;

    if (name) {
      category = await Category.findOne({ name: name });
      if (category.length === 0) {
        return res.status(400).json({ message: 'No category found' });
      }
      newtrendingCategory = new Trendingcategory({
        category: category._id,
        createdAt: Date.now(),
      });
    } else {
      return res.status(400).json({ message: 'Category name is required' });
    }
    // Save category to database
    const savedCategory = await newtrendingCategory.save();
    res.status(200).json(savedCategory);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//fetch Category
const fetchCategory = async (req, res) => {
  try {
    const { name } = req.query;
    let categories;

    if (name) {
      categories = await Category.find({ name: name });
      if (categories.length === 0) {
        return res.status(400).json({ message: 'No category found' });
      }
    } else {
      categories = await Category.find({});
    }

    res.status(200).json(categories);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//fetch SubCategory
const fetchSubCategory = async (req, res) => {
  try {
    const { name } = req.query;
    let subcategories;

    if (name) {
      const fetchCat = await Category.findOne({ name: name });
      if (!fetchCat) {
        return res.status(400).json({ message: 'No category found' });
      }
      subcategories = await Subcategory.find({ category: fetchCat._id });
      if (subcategories.length === 0) {
        return res.status(400).json({ message: 'No subcategory found' });
      }
    } else {
      subcategories = await Subcategory.find({});
    }

    res.status(200).json(subcategories);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//fetch Popular category
const fetchPopularCategory = async (req, res) => {
  try {
    const { name } = req.query;
    let popularcategories;
    let fetchpopularCat;
    let popularcatdata;

    if (name) {
      const fetchCat = await Category.findOne({ name: name });
      if (!fetchCat) {
        return res.status(400).json({ message: 'No  category found' });
      } else {
        fetchpopularCat = await Popularcategory.findOne({
          category: fetchCat._id,
        });
        console.log('kkk', fetchpopularCat);
        popularcatdata = await Category.findById(fetchpopularCat.category);
        if (!fetchpopularCat) {
          return res.status(400).json({ message: 'No Popular category found' });
        }
      }
    } else {
      fetchpopularCat = await Popularcategory.find({});
      popularcatdata = await Category.find({
        _id: { $in: fetchpopularCat.map((pc) => pc.category) },
      });
      if (!fetchpopularCat) {
        return res.status(400).json({ message: 'No Popular category found' });
      }
    }

    res.status(200).json(popularcatdata);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//fetch Trendingcategory
const fetchTrendingCategory = async (req, res) => {
  try {
    const { name } = req.query;
    let trendingcategories;
    let fetchtrendingCat;
    let trendingcatdata;

    if (name) {
      const fetchCat = await Category.findOne({ name: name });
      if (!fetchCat) {
        return res.status(400).json({ message: 'No  category found' });
      } else {
        fetchtrendingCat = await Trendingcategory.findOne({
          category: fetchCat._id,
        });
        console.log('kkk', fetchtrendingCat);
        trendingcatdata = await Category.findById(fetchtrendingCat.category);
        if (!trendingcatdata) {
          return res
            .status(400)
            .json({ message: 'No Trending category found' });
        }
      }
    } else {
      fetchtrendingCat = await Trendingcategory.find({});
      trendingcatdata = await Category.find({
        _id: { $in: fetchtrendingCat.map((pc) => pc.category) },
      });
      if (!fetchtrendingCat) {
        return res.status(400).json({ message: 'No Popular category found' });
      }
    }

    res.status(200).json(trendingcatdata);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};
module.exports = {
  addCategory,
  addSubcategory,
  addPopularCategory,
  addTrendingCategory,
  fetchCategory,
  fetchSubCategory,
  fetchPopularCategory,
  fetchTrendingCategory,
};
