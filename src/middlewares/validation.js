const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow(''),
  dueDate: Joi.date().iso().required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').required(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE'),
  recurrence: Joi.string().valid('NONE', 'DAILY', 'WEEKLY', 'MONTHLY'),
  assignedToId: Joi.number().integer().min(1).allow(null)
});

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const validateTask = (req, res, next) => {
  const { error } = taskSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateAuth = (req, res, next) => {
  const { error } = authSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  validateTask,
  validateAuth
};