import express from 'express';
import * as applicationController from '../controllers/applicationController';
import { authenticateToken, requireStudent, requireCoordinator } from '../middleware/auth';
import { applicationSchema, updateApplicationStatusSchema } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

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

// Apply for job (student only)
router.post('/', authenticateToken, requireStudent, validate(applicationSchema), asyncHandler(applicationController.applyForJob));

// Get my applications (student only)
router.get('/me', authenticateToken, requireStudent, asyncHandler(applicationController.getMyApplications));

// Get application stats (student only)
router.get('/me/stats', authenticateToken, requireStudent, asyncHandler(applicationController.getApplicationStats));

// Get application by ID
router.get('/:id', authenticateToken, asyncHandler(applicationController.getApplicationById));

// Update application status (coordinator only)
router.patch('/:id/status', authenticateToken, requireCoordinator, validate(updateApplicationStatusSchema), asyncHandler(applicationController.updateApplicationStatus));

// Withdraw application (student only)
router.delete('/:id', authenticateToken, requireStudent, asyncHandler(applicationController.withdrawApplication));

export default router;
