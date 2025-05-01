const { prisma } = require('../config/db');
const logger = require('../config/logger');

const roleCheck = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.userId}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error(`Role check error: ${error.message}`);
      res.status(500).json({ message: 'Authorization failed' });
    }
  };
};

// Pre-configured role checkers
const adminCheck = roleCheck(['ADMIN']);
const managerCheck = roleCheck(['ADMIN', 'MANAGER']);
const userCheck = roleCheck(['USER', 'MANAGER', 'ADMIN']);

module.exports = {
  roleCheck,
  adminCheck,
  managerCheck,
  userCheck
};