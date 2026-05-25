const httpStatus = require('http-status');
const pick = require('../../../utils/pick');
const ApiError = require('../../../utils/ApiError');
const catchAsync = require('../../../utils/catchAsync');
const { categoryService } = require('../../../services');
const Response = require('../../../config/response');
const { upload } = require('../../../middlewares/upload');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables


// Create a category with an image
const createCategory = catchAsync(async (req, res) => {

  let clientId;

  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }else{
    clientId = req.headers.clientid;
  }

  const { category, status,zoneId } = req.body;

    upload.single('categoryImage')(req, res, async (err) => {

        const categoryImage = req.file ? req.file.filename : '';

        const categoryData = {
            category,
            categoryImage,
            clientId,
            zoneId,
            status
        };

        const newCategory = await categoryService.createCategory(categoryData);

        if (newCategory.categoryImage) {
            newCategory.categoryImage = `/uploads/categoryImage/${newCategory.categoryImage}`;
        }
        const response = Response(true, newCategory, "Category created successfully");
        res.status(httpStatus.CREATED).send(response);
    });
});

// Get all categories with pagination
const getCategories = catchAsync(async (req, res) => {
    const rawFilter = pick(req.query, ['category']);
    const filter = {};
  
    // Add base filters if available
    if (rawFilter.category) {
      filter.category = rawFilter.category;
    }
  
    // Add search filter
    if (req.query.search) {
      filter.$or = [
        { category: { $regex: '^' + req.query.search, $options: 'i' } },
      ];
    }
  
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await categoryService.queryCategorys(req, filter, options);
    const response = Response(true, result, "Categories retrieved successfully");
    res.status(httpStatus.OK).send(response);
  });
  

// Get a single category by ID
const getCategory = catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.categoryId);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    if (category && category.categoryImage) {
        category.categoryImage = `/uploads/categoryImage/${category.categoryImage}`;// Adjust path as needed
    }
    const response = Response(true, category, "Category retrieved successfully");
    res.status(httpStatus.OK).send(response);
});

// Get all categories without pagination
const getCategoriesWithoutPagination = catchAsync(async (req, res) => {
  if (!req.headers.clientid) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ClientID not found');
  }

    const categories = await categoryService.getCategorys(req.headers.clientid);
    if (!categories) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Categories not found');
    }

    // Convert categoryImage path to URL for each category
    const updatedCategories = categories.map(category => {
        if (category.categoryImage) {
            category.categoryImage = `/uploads/categoryImage/${category.categoryImage}`;
        }
        return category;
    });

    const response = Response(true, updatedCategories, "Categories retrieved successfully");
    res.status(httpStatus.OK).send(response);
});

// Update a category
const updateCategory = catchAsync(async (req, res) => {
    const { category, status,zoneId } = req.body;
    // Handle file upload first
    upload.single('categoryImage')(req, res, async (err) => {


        const newCategoryImage = req.file ? req.file.filename : null;

        // Fetch existing category
        const existingCategory = await categoryService.getCategoryById(req.params.categoryId);
        if (!existingCategory) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
        }

        // Prepare data for update
        const updateData = {
            category: category || existingCategory.category,
            status: status || existingCategory.status,
            zoneId: zoneId || existingCategory.zoneId

        };

        // If a new image is provided, update the image field
        if (newCategoryImage) {
            // Optionally, remove the old image file from the server
            if (existingCategory.categoryImage) {
                const oldImagePath = path.join(__dirname, '../../uploads/categoryImage/', existingCategory.categoryImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Set the new image path
            updateData.categoryImage = newCategoryImage;
        }

        // Update category
        const updatedCategory = await categoryService.updateCategoryById(req.params.categoryId, updateData);

        // Update the image path for the response
        if (updatedCategory.categoryImage) {
            updatedCategory.categoryImage = `/uploads/categoryImage/${updatedCategory.categoryImage}`;
        }

        const response = Response(true, updatedCategory, "Category updated successfully");
        res.status(httpStatus.OK).send(response);
    });
});

// Delete a category
const deleteCategory = catchAsync(async (req, res) => {
    const category = await categoryService.deleteCategoryById(req.params.categoryId);
    const response = Response(true, category, "Category deleted successfully");
    res.status(httpStatus.OK).send(response);
});

// Update the status of a category
const updateCategoryStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  // Fetch existing category
  const existingCategory = await categoryService.getCategoryById(req.params.categoryId);
  if (!existingCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // Update status
  const updatedCategory = await categoryService.updateCategoryById(req.params.categoryId, { status });

  const response = Response(true, updatedCategory, "Category status updated successfully");
  res.status(httpStatus.OK).send(response);
});

module.exports = {
    createCategory,
    getCategories,
    getCategory,
    getCategoriesWithoutPagination,
    updateCategory,
    deleteCategory,
    updateCategoryStatus
};
