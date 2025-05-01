const cron = require('node-cron');
const { prisma } = require('../config/db');
const logger = require('../config/logger');
const { sendTaskAssignmentEmail } = require('./emailService');
const { createNotification } = require('../controllers/notificationController');

const calculateNextDueDate = (currentDue, recurrence) => {
  const date = new Date(currentDue);
  switch (recurrence) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }
  return date;
};

const scheduleRecurringTasks = () => {
  cron.schedule('0 0 * * *', async () => { // Daily at midnight
    try {
      const tasks = await prisma.task.findMany({
        where: {
          status: 'DONE',
          recurrence: { not: 'NONE' }
        },
        include: {
          assignedTo: true
        }
      });

      for (const task of tasks) {
        const nextDue = calculateNextDueDate(task.dueDate, task.recurrence);
        if (!nextDue) continue;

        const newTask = await prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            dueDate: nextDue,
            priority: task.priority,
            recurrence: task.recurrence,
            createdById: task.createdById,
            assignedToId: task.assignedToId
          }
        });

        // Create audit log
        await prisma.auditLog.create({
          data: {
            action: 'TASK_RECURRING',
            userId: task.createdById,
            taskId: newTask.id
          }
        });

        // Notify assigned user
        if (task.assignedToId) {
          await createNotification(
            task.assignedToId,
            `Recurring task: ${task.title}`,
            'IN_APP'
          );

          if (task.assignedTo?.email) {
            await sendTaskAssignmentEmail(task.assignedTo.email, task.title);
          }
        }
      }
    } catch (error) {
      logger.error(`Recurring tasks error: ${error.message}`);
    }
  });
};

const scheduleLogCleanup = () => {
  cron.schedule('0 0 1 * *', async () => { // Monthly
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
        }
      }
    });
    logger.info('Old audit logs cleaned up');
  });
};

const scheduleDailyDigest = () => {
  cron.schedule('0 8 * * *', async () => { // Daily at 8 AM
    // Implementation for daily summary emails
  });
};

module.exports = {
  scheduleRecurringTasks,
  scheduleLogCleanup,
  scheduleDailyDigest
};