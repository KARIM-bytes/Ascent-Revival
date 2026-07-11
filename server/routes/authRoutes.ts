import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { requestOTPSchema, verifyOTPSchema, loginSchema } from '../utils/validators';
import { asyncHandler } from '../utils/asyncHandler';
import { otpRequestLimiter, otpVerifyLimiter, loginLimiter } from '../middleware/rateLimit';

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

// Student OTP-based authentication
router.post('/student/request-otp', otpRequestLimiter, validate(requestOTPSchema), asyncHandler(authController.requestOTP));
router.post('/student/verify-otp', otpVerifyLimiter, validate(verifyOTPSchema), asyncHandler(authController.verifyOTPAndLogin));

// Coordinator password-based authentication
router.post('/coordinator/login', loginLimiter, validate(loginSchema), asyncHandler(authController.coordinatorLogin));

// Get current user
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser));

// Logout
router.post('/logout', authenticateToken, asyncHandler(authController.logout));

export default router;
