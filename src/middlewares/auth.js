const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const logger = require('../config/logger');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {authenticate};