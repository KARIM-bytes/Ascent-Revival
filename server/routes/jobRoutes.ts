import express from 'express';
import * as jobController from '../controllers/jobController';
import { authenticateToken, requireStudent, requireCoordinator } from '../middleware/auth';
import { jobSchema } from '../utils/validators';
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

// Get all jobs (accessible to all authenticated users)
router.get('/', authenticateToken, asyncHandler(jobController.getAllJobs));

// Get job by ID
router.get('/:id', authenticateToken, asyncHandler(jobController.getJobById));

// Create job (coordinator only)
router.post('/', authenticateToken, requireCoordinator, validate(jobSchema), asyncHandler(jobController.createJob));

// Update job (coordinator only)
router.put('/:id', authenticateToken, requireCoordinator, asyncHandler(jobController.updateJob));

// Delete job (coordinator only)
router.delete('/:id', authenticateToken, requireCoordinator, asyncHandler(jobController.deleteJob));

// Get applicants for a job (coordinator only)
router.get('/:id/applicants', authenticateToken, requireCoordinator, asyncHandler(jobController.getJobApplicants));

// Save job (student only)
router.post('/:id/save', authenticateToken, requireStudent, asyncHandler(jobController.saveJob));

// Unsave job (student only)
router.delete('/:id/save', authenticateToken, requireStudent, asyncHandler(jobController.unsaveJob));

// Get saved jobs (student only)
router.get('/saved/all', authenticateToken, requireStudent, asyncHandler(jobController.getSavedJobs));

export default router;
