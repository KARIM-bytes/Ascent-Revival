import rateLimit from 'express-rate-limit';

// OTP requests trigger an email each time — keep this tight to prevent
// mailbox spam and abuse of the SMTP account.
export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many OTP requests. Please try again in 15 minutes.',
    statusCode: 429,
  },
});

// A 6-digit OTP is brute-forceable without an attempt cap.
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many verification attempts. Please try again in 15 minutes.',
    statusCode: 429,
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    statusCode: 429,
  },
});
