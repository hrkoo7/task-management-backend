const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Production transports
const transports = [
  new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }),
  new winston.transports.File({ 
    filename: 'logs/combined.log' 
  })
];

// Development configuration
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      )
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log' 
    })
  ]
});

// Handle uncaught promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

module.exports = logger;