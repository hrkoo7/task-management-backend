const express = require('express');
const router = express.Router();
const { prisma } = require('../config/db');
const { createTask, getTasks, updateTask, deleteTask,getTaskById, getDashboardData } = require('../controllers/taskController');
const {authenticate} = require('../middlewares/auth');
const { validateTask } = require('../middlewares/validation');
const { adminCheck, managerCheck } = require('../middlewares/roleCheck');

// Create task (authenticated users)
router.post('/', authenticate, validateTask, createTask);
console.log("post task working")

// Get tasks with filters
router.get('/', authenticate, getTasks);
console.log("get task working")

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
console.log("update task working")

// Delete task (admin only)
router.delete('/:id', authenticate, adminCheck, deleteTask);
console.log("delete task working")
router.get('/dashboard', authenticate, getDashboardData);
router.get('/:id', authenticate, getTaskById);

module.exports = router;