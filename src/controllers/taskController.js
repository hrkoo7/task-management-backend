const { prisma } = require('../config/db');
const logger = require('../config/logger');
const { createNotification } = require('./notificationController');

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, recurrence, assignedToId } = req.body;

    // Validate assigned user
    if (assignedToId) {
      const userExists = await prisma.user.findUnique({
        where: { id: assignedToId }
      });
      if (!userExists) {
        return res.status(400).json({ message: 'Invalid user assignment' });
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        status: status || 'TODO',
        recurrence: recurrence || 'NONE',
        createdById: req.userId,
        assignedToId
      },
      include: {
        createdBy: true,
        assignedTo: true
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'TASK_CREATE',
        userId: req.userId,
        taskId: task.id
      }
    });

    // Send notification
    if (assignedToId) {
      await createNotification(
        assignedToId,
        `New task assigned: ${title}`,
        'IN_APP'
      );
    }

    res.status(201).json(task);
  } catch (error) {
    logger.error(`Task creation error: ${error.message}`);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: req.query.search } },
          { description: { contains: req.query.search } }
        ],
        status: req.query.status,
        priority: req.query.priority
      },
      include: {
        createdBy: true,
        assignedTo: true
      }
    });
    res.json(tasks);
  } catch (error) {
    logger.error(`Task fetch error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};
const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Verify task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { createdBy: true }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Authorization check (owner or admin/manager)
    if (existingTask.createdById !== req.userId && req.user.role === 'USER') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Validate assigned user if changing assignment
    if (updateData.assignedToId) {
      const userExists = await prisma.user.findUnique({
        where: { id: updateData.assignedToId }
      });
      if (!userExists) {
        return res.status(400).json({ message: 'Invalid user assignment' });
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: updateData.title,
        description: updateData.description,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        priority: updateData.priority,
        status: updateData.status,
        recurrence: updateData.recurrence,
        assignedToId: updateData.assignedToId
      },
      include: {
        createdBy: true,
        assignedTo: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TASK_UPDATE',
        userId: req.userId,
        taskId: taskId
      }
    });

    // Notify new assignee if changed
    if (updateData.assignedToId && 
        updateData.assignedToId !== existingTask.assignedToId) {
      await createNotification(
        updateData.assignedToId,
        `Task updated: ${updatedTask.title}`,
        'IN_APP'
      );
    }

    res.json(updatedTask);
  } catch (error) {
    logger.error(`Task update error: ${error.message}`);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    // Verify task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TASK_DELETE',
        userId: req.userId,
        taskId: taskId
      }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error(`Task deletion error: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};