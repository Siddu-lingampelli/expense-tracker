const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ user: req.user.id }).sort('name');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, type, color, icon } = req.body;

  if (!name || !type) {
    return next(new ErrorResponse('Please provide category name and type', 400));
  }

  const category = await Category.create({
    name,
    type,
    color,
    icon,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`No category with the id of ${req.params.id}`, 404));
  }

  // Make sure user is category owner
  if (category.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this category', 401));
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`No category with the id of ${req.params.id}`, 404));
  }

  // Make sure user is category owner
  if (category.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this category', 401));
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});