const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const authenticate = require('../middlewares/auth');
const { validateTask } = require('../middlewares/validation');
const { adminCheck, managerCheck } = require('../middlewares/roleCheck');

// Create task (authenticated users)
router.post('/', authenticate, validateTask, createTask);

// Get tasks with filters
router.get('/', authenticate, getTasks);

// Update task (owner or manager/admin)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      select: { createdById: true }
    });

    if (task.createdById === req.userId) return next();
    managerCheck(req, res, next);
  } catch (error) {
    next(error);
  }
}, updateTask);

// Delete task (admin only)
router.delete('/:id', authenticate, adminCheck, deleteTask);

module.exports = router;