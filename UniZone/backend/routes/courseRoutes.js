const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  dropCourse
} = require('../controllers/courseController');

router.get('/', authenticate, getAllCourses);
router.post('/', authenticate, authorize('admin', 'staff'), createCourse);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateCourse);
router.delete('/:id', authenticate, authorize('admin', 'staff'), deleteCourse);
router.post('/:id/enroll', authenticate, authorize('student'), enrollCourse);
router.post('/:id/drop', authenticate, authorize('student'), dropCourse);

module.exports = router;
