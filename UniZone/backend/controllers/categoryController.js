const ServiceCategory = require('../models/ServiceCategory');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find({ isActive: true }).sort('name');
  res.json(categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.create(req.body);
  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});
