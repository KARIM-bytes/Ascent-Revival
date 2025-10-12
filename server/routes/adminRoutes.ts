import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateToken, requireCoordinator } from '../middleware/auth';
import { studentSchema, bulkStudentImportSchema } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// All routes require coordinator authentication
router.use(authenticateToken);
router.use(requireCoordinator);

// Validate request body middleware
const validate = (schema: any) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: error.details[0].message,
        statusCode: 400,
      });
    }
    next();
  };
};

// Dashboard stats
router.get('/stats', asyncHandler(adminController.getDashboardStats));

// Student management
router.get('/students', asyncHandler(adminController.getAllStudents));
router.post('/students', validate(studentSchema), asyncHandler(adminController.createStudent));
router.post('/students/bulk', validate(bulkStudentImportSchema), asyncHandler(adminController.bulkImportStudents));
router.put('/students/:id', asyncHandler(adminController.updateStudent));
router.delete('/students/:id', asyncHandler(adminController.deleteStudent));

// Audit logs
router.get('/audit-logs', asyncHandler(adminController.getAuditLogs));

// Coordinator management
router.post('/coordinators', asyncHandler(adminController.createCoordinator));

export default router;
