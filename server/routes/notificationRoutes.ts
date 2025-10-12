import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticateToken, requireStudent, requireCoordinator } from '../middleware/auth';
import { notificationSchema, broadcastSchema } from '../utils/validators';
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

// Student endpoints
router.post('/fcm-token', authenticateToken, requireStudent, asyncHandler(notificationController.updateFCMToken));
router.put('/preferences', authenticateToken, requireStudent, asyncHandler(notificationController.updateNotificationPreferences));

// Coordinator endpoints
router.post('/send', authenticateToken, requireCoordinator, validate(notificationSchema), asyncHandler(notificationController.sendNotification));
router.post('/broadcast', authenticateToken, requireCoordinator, validate(broadcastSchema), asyncHandler(notificationController.broadcastNotification));

export default router;
