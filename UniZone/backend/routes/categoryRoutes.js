const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// All authenticated users can view categories
router.get('/', authenticate, categoryController.getAllCategories);

// Only admins can create/update categories
router.post('/', authenticate, authorize('admin', 'staff'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin', 'staff'), categoryController.updateCategory);

module.exports = router;
