import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const requestOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const jobSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  company: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  skills: Joi.array().items(Joi.string().min(2).max(30)).min(1).max(10).required(),
  deadline: Joi.date().greater('now').required(),
  targetYears: Joi.array().items(Joi.string().valid('Final', 'Pre-Final')).min(1).required(),
  targetDepts: Joi.array().items(Joi.string()).min(1).required(),
  mandatory: Joi.boolean().default(false),
  externalLink: Joi.string().uri().required(),
  location: Joi.string().max(255).optional(),
  ctc: Joi.string().max(100).optional(),
  // "campus" = coordinator drive (apply in-app);
  // "external" = scraped listing (apply via externalLink)
  source: Joi.string().valid('campus', 'external').default('campus'),
});

export const applicationSchema = Joi.object({
  jobId: Joi.number().integer().positive().required(),
  notes: Joi.string().max(500).optional(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('Applied', 'Interview', 'Offer', 'Rejected').required(),
  notes: Joi.string().max(500).optional(),
});

export const studentSchema = Joi.object({
  rollNo: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  year: Joi.string().valid('Final', 'Pre-Final').required(),
  department: Joi.string().required(),
});

export const bulkStudentImportSchema = Joi.object({
  students: Joi.array().items(studentSchema).min(1).required(),
});

export const notificationSchema = Joi.object({
  studentId: Joi.number().integer().positive().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
});

export const broadcastSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  filters: Joi.object({
    year: Joi.string().valid('Final', 'Pre-Final').optional(),
    department: Joi.string().optional(),
  }).optional(),
  data: Joi.object().optional(),
});
