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

//add or  update category
// const addOrEditCategory = async (req, res) => {
//   try {
//     if (
//       req.headers['content-type'] &&
//       req.headers['content-type'].includes('multipart/form-data')
//     ) {
//       uploadSingle('categoryImage')(req, res, async (err) => {
//         if (err) {
//           console.error('Error uploading file:', err);
//           return res.status(500).send('Error uploading file');
//         }

//         try {
//           const { id, name, description, categoryImage } = req.body;

//           if (!name || !description) {
//             return res
//               .status(400)
//               .json({ message: 'Name and description required' });
//           }

//           // Use new image if uploaded; otherwise, use existing image URL
//           const imageToUse = req.file ? req.file.firebaseUrl : categoryImage;

//           if (id) {
//             // Edit operation
//             const category = await Category.findById(id);
//             if (!category) {
//               return res.status(404).json({ message: 'Category not found' });
//             }

//             category.name = name;
//             category.description = description;
//             category.categoryImage = imageToUse; // Update category image
//             category.updatedAt = Date.now();

//             const updatedCategory = await category.save();
//             res.status(200).json(updatedCategory);
//           } else {
//             // Add operation
//             const existingCategory = await Category.findOne({ name });
//             if (existingCategory) {
//               return res
//                 .status(400)
//                 .json({ message: 'Category already exists' });
//             }

//             const newCategory = new Category({
//               name,
//               description,
//               categoryImage: imageToUse,
//               createdAt: Date.now(),
//             });

//             const savedCategory = await newCategory.save();
//             res.status(201).json(savedCategory);
//           }
//         } catch (error) {
//           console.error('Error:', error);
//           res.status(500).send('Server Error');
//         }
//       });
//     } else {
//       // Handle normal form data processing
//       const { id, name, description, categoryImage } = req.body;

//       if (!name || !description) {
//         return res
//           .status(400)
//           .json({ message: 'Name and description required' });
//       }

//       const imageToUse = categoryImage || '';

//       if (id) {
//         const category = await Category.findById(id);
//         if (!category) {
//           return res.status(404).json({ message: 'Category not found' });
//         }

//         category.name = name;
//         category.description = description;
//         category.categoryImage = imageToUse; // Update category image
//         category.updatedAt = Date.now();

//         const updatedCategory = await category.save();
//         res.status(200).json(updatedCategory);
//       } else {
//         const existingCategory = await Category.findOne({ name });
//         if (existingCategory) {
//           return res.status(400).json({ message: 'Category already exists' });
//         }

//         const newCategory = new Category({
//           name,
//           description,
//           categoryImage: imageToUse,
//           createdAt: Date.now(),
//         });

//         const savedCategory = await newCategory.save();
//         res.status(201).json(savedCategory);
//       }
//     }
//   } catch (error) {
//     console.error('Error adding or editing category:', error);
//     res.status(500).send('Server Error');
//   }
// };
const addOrEditCategory = async (req, res) => {
  try {
    if (
      req.headers['content-type'] &&
      req.headers['content-type'].includes('multipart/form-data')
    ) {
      // Handle file upload
      uploadSingle('categoryImage')(req, res, async (err) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).send('Error uploading file');
        }

        try {
          const { id, name, description } = req.body;
          const newImageUrl = req.file ? req.file.firebaseUrl : undefined;

          if (!name || !description) {
            return res
              .status(400)
              .json({ message: 'Name and description required' });
          }

          let imageToUse;

          if (id) {
            // Edit operation
            const category = await Category.findById(id);
            if (!category) {
              return res.status(404).json({ message: 'Category not found' });
            }

            // Use new image if available, otherwise keep the old one
            imageToUse = newImageUrl || category.categoryImage || '';

            category.name = name;
            category.description = description;
            category.categoryImage = imageToUse;
            category.updatedAt = Date.now();

            const updatedCategory = await category.save();
            res.status(200).json(updatedCategory);
          } else {
            // Add operation
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
              return res
                .status(400)
                .json({ message: 'Category already exists' });
            }

            imageToUse = newImageUrl || ''; // Default to empty string if no image

            const newCategory = new Category({
              name,
              description,
              categoryImage: imageToUse,
              createdAt: Date.now(),
            });

            const savedCategory = await newCategory.save();
            res.status(201).json(savedCategory);
          }
        } catch (error) {
          console.error('Error processing category:', error);
          res.status(500).send('Server Error');
        }
      });
    } else {
      // Handle normal form data processing (without file upload)
      const { id, name, description, categoryImage } = req.body;

      if (!name || !description) {
        return res
          .status(400)
          .json({ message: 'Name and description required' });
      }

      let imageToUse = categoryImage || '';

      if (id) {
        // Edit operation
        const category = await Category.findById(id);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }

        imageToUse = categoryImage || category.categoryImage || ''; // Use existing image if no new image provided

        category.name = name;
        category.description = description;
        category.categoryImage = imageToUse;
        category.updatedAt = Date.now();

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
      } else {
        // Add operation
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
          return res.status(400).json({ message: 'Category already exists' });
        }

        const newCategory = new Category({
          name,
          description,
          categoryImage: imageToUse,
          createdAt: Date.now(),
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
      }
    }
  } catch (error) {
    console.error('Error adding or editing category:', error);
    res.status(500).send('Server Error');
  }
};

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
// const addOrEditSubcategory = async (req, res) => {
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
//           const { id, name, description, CategoryName } = req.body;

//           // Find the parent category
//           const parentCategory = await Category.findOne({ name: CategoryName });

//           if (!parentCategory) {
//             return res.status(400).json({ message: 'Category does not exist' });
//           }

//           let subcategoryImage = req.file ? req.file.firebaseUrl : '';

//           if (id) {
//             // Edit operation
//             const subcategory = await Subcategory.findById(id);
//             if (!subcategory) {
//               return res.status(404).json({ message: 'Subcategory not found' });
//             }

//             // Update fields
//             subcategory.name = name;
//             subcategory.description = description;
//             if (subcategoryImage) {
//               subcategory.subcategoryImage = subcategoryImage;
//             }
//             subcategory.category = parentCategory._id;
//             subcategory.updatedAt = Date.now();

//             const updatedSubcategory = await subcategory.save();
//             res.status(200).json(updatedSubcategory);
//           } else {
//             // Add operation
//             const findSubcategory = await Subcategory.findOne({ name });
//             if (findSubcategory) {
//               return res
//                 .status(400)
//                 .json({ message: 'Subcategory already exists' });
//             }

//             const newSubcategory = new Subcategory({
//               name,
//               description,
//               subcategoryImage,
//               category: parentCategory._id,
//               createdAt: Date.now(),
//             });

//             const savedSubcategory = await newSubcategory.save();
//             res.status(201).json(savedSubcategory);
//           }
//         } catch (error) {
//           console.error('Error:', error);
//           res.status(500).send('Server Error');
//         }
//       });
//     } else {
//       // Handle normal form data processing without image upload
//       const { id, name, description, CategoryName } = req.body;

//       try {
//         const parentCategory = await Category.findOne({ name: CategoryName });

//         if (!parentCategory) {
//           return res.status(400).json({ message: 'Category does not exist' });
//         }

//         if (id) {
//           // Edit operation
//           const subcategory = await Subcategory.findById(id);
//           if (!subcategory) {
//             return res.status(404).json({ message: 'Subcategory not found' });
//           }

//           // Update fields
//           subcategory.name = name;
//           subcategory.description = description;
//           subcategory.category = parentCategory._id;
//           subcategory.updatedAt = Date.now();

//           const updatedSubcategory = await subcategory.save();
//           res.status(200).json(updatedSubcategory);
//         } else {
//           // Add operation
//           const findSubcategory = await Subcategory.findOne({ name });
//           if (findSubcategory) {
//             return res
//               .status(400)
//               .json({ message: 'Subcategory already exists' });
//           }

//           const newSubcategory = new Subcategory({
//             name,
//             description,
//             category: parentCategory._id,
//             createdAt: Date.now(),
//           });

//           const savedSubcategory = await newSubcategory.save();
//           res.status(201).json(savedSubcategory);
//         }
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
const addOrEditSubcategory = async (req, res) => {
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
          const { id, name, description, CategoryName } = req.body;

          // Find the parent category
          const parentCategory = await Category.findOne({ name: CategoryName });

          if (!parentCategory) {
            return res.status(400).json({ message: 'Category does not exist' });
          }

          let subcategoryImage = req.file ? req.file.firebaseUrl : '';

          if (id) {
            // Edit operation
            const subcategory = await Subcategory.findById(id);
            if (!subcategory) {
              return res.status(404).json({ message: 'Subcategory not found' });
            }

            // Update fields
            subcategory.name = name;
            subcategory.description = description;
            if (subcategoryImage) {
              subcategory.subcategoryImage = subcategoryImage;
            }
            subcategory.category = parentCategory._id;
            subcategory.updatedAt = Date.now();

            const updatedSubcategory = await subcategory.save();
            res.status(200).json(updatedSubcategory);
          } else {
            // Add operation
            const findSubcategory = await Subcategory.findOne({ name });
            if (findSubcategory) {
              return res
                .status(400)
                .json({ message: 'Subcategory already exists' });
            }

            const newSubcategory = new Subcategory({
              name,
              description,
              subcategoryImage,
              category: parentCategory._id,
              createdAt: Date.now(),
            });

            const savedSubcategory = await newSubcategory.save();
            res.status(201).json(savedSubcategory);
          }
        } catch (error) {
          console.error('Error:', error);
          res.status(500).send('Server Error');
        }
      });
    } else {
      // Handle normal form data processing without image upload
      const { id, name, description, CategoryName } = req.body;

      try {
        const parentCategory = await Category.findOne({ name: CategoryName });

        if (!parentCategory) {
          return res.status(400).json({ message: 'Category does not exist' });
        }

        if (id) {
          // Edit operation
          const subcategory = await Subcategory.findById(id);
          if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
          }

          // Update fields
          subcategory.name = name;
          subcategory.description = description;
          subcategory.category = parentCategory._id;
          subcategory.updatedAt = Date.now();

          const updatedSubcategory = await subcategory.save();
          res.status(200).json(updatedSubcategory);
        } else {
          // Add operation
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
        }
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
      const fetchCat = await Category.findOne({ name: name, isActive: true });
      if (!fetchCat) {
        return res.status(400).json({ message: 'No category found' });
      }
      subcategories = await Subcategory.find({
        category: fetchCat._id,
        isActive: true,
      });
      if (subcategories.length === 0) {
        return res.status(400).json({ message: 'No subcategory found' });
      }
    } else {
      subcategories = await Subcategory.find({ isActive: true });
    }

    res.status(200).json(subcategories);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//fetch perticular subcategory
// const fetchPerticularSubCategory = async (req, res) => {
//   try {
//     const { name } = req.query;
//     let subcategories;

//     if (name) {
//       // Fetch subcategories by the provided name
//       subcategories = await Subcategory.find({
//         name: { $regex: new RegExp(name, 'i') }, // Case-insensitive search
//         isActive: true,
//       });

//       if (subcategories.length === 0) {
//         return res.status(400).json({ message: 'No subcategory found' });
//       }
//     } else {
//       // Fetch all active subcategories if no name is provided
//       subcategories = await Subcategory.find({ isActive: true });
//     }

//     res.status(200).json(subcategories);
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Server Error');
//   }
// };
const fetchPerticularSubCategory = async (req, res) => {
  try {
    const { name } = req.query;
    let subcategories;

    if (name) {
      // Fetch subcategories by the provided name
      subcategories = await Subcategory.find({
        name: { $regex: new RegExp(name, 'i') }, // Case-insensitive search
        isActive: true,
      }).populate('category'); // Populate category field

      if (subcategories.length === 0) {
        return res.status(400).json({ message: 'No subcategory found' });
      }
    } else {
      // Fetch all active subcategories if no name is provided
      subcategories = await Subcategory.find({ isActive: true }).populate(
        'category'
      ); // Populate category field
    }

    // Transform the response to include category name
    const response = subcategories.map((subcategory) => ({
      _id: subcategory._id,
      name: subcategory.name,
      description: subcategory.description,
      subcategoryImage: subcategory.subcategoryImage,
      category: {
        _id: subcategory.category._id,
        name: subcategory.category.name, // Include the category name
      },
      isActive: subcategory.isActive,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt,
    }));

    res.status(200).json(response);
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
          isActive: true,
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

      const result = fetchpopularCat
        .map((pc) => {
          const categoryData = popularcatdata.find(
            (c) => c._id.toString() === pc.category.toString()
          );
          return {
            popularCategoryId: pc._id,
            isActive: pc.isActive,
            category: categoryData,
          };
        })
        .filter((item) => item.isActive);

      res.status(200).json(result);
    }
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
          isActive: true,
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

      const result = fetchtrendingCat
        .map((pc) => {
          const categoryData = trendingcatdata.find(
            (c) => c._id.toString() === pc.category.toString()
          );
          return {
            trendingCategoryId: pc._id,
            isActive: pc.isActive,
            category: categoryData,
          };
        })
        .filter((item) => item.isActive);

      res.status(200).json(result);
    }
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};
//delete Category
// const deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log('iiiddd', id);
//     //find category by ID and update its isActive to false
//     const updatedCategory = await Category.findByIdAndUpdate(
//       id,
//       { isActive: false },
//       { new: true }
//     );
//     if (!updatedCategory) {
//       return res.status(404).json({ message: 'Category not found' });
//     }
//     res.json(updatedCategory);
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Server Error');
//   }
// };
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('iiiddd', id);

    // Find category by ID and update its isActive to false
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find and update all subcategories of the deleted category
    const updatedSubcategories = await Subcategory.updateMany(
      { category: id },
      { isActive: false }
    );

    res.json({ updatedCategory, updatedSubcategories });
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//delete Sub Category
// const deleteSubCategory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log('iiiddd', id);

//     // Find category by ID and update its isActive to false
//     const updatedCategory = await SubcategoryCategory.findByIdAndUpdate(
//       id,
//       { isActive: false },
//       { new: true }
//     );

//     if (!updatedCategory) {
//       return res.status(404).json({ message: 'Category not found' });
//     }

//     res.json({ updatedCategory, updatedCategory });
//   } catch (error) {
//     console.log('error', error);
//     res.status(500).send('Server Error');
//   }
// };
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find subcategory by ID and update its isActive to false
    const updatedSubCategory = await Subcategory.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    res.json(updatedSubCategory);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server Error');
  }
};

//delete popular Category
const deletePopularCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('iiiddd', id);
    //find category by ID and update its isActive to false
    const updatedCategory = await Popularcategory.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

//delete trending Category
const deleteTrendingCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('iiiddd', id);
    //find category by ID and update its isActive to false
    const updatedCategory = await Trendingcategory.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (error) {
    console.log('error', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  addOrEditCategory,
  addCategory,
  addSubcategory,
  addOrEditSubcategory,
  addPopularCategory,
  addTrendingCategory,
  fetchCategory,
  fetchSubCategory,
  fetchPerticularSubCategory,
  fetchPopularCategory,
  fetchTrendingCategory,
  deletePopularCategory,
  deleteTrendingCategory,
  deleteCategory,
  deleteSubCategory,
};
