import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';
import { createOTP, verifyOTP } from '../utils/otp';
import { sendOTP } from '../services/emailService';
import { ApiErrorClass } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

export async function requestOTP(req: AuthRequest, res: Response) {
  try {
    const { email } = req.body;

    // Check if student exists
    const student = await prisma.students.findUnique({
      where: { email },
    });

    if (!student) {
      throw new ApiErrorClass('Student with this email not found', 404);
    }

    // Create OTP
    const { otpId, otp } = await createOTP(email);

    // Send OTP via email
    await sendOTP(email, otp);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: student.id,
        userType: 'Student',
        action: 'otp_requested',
        details: `OTP requested for email: ${email}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      success: true,
      otpId,
      message: 'OTP sent to email',
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error requesting OTP', error.statusCode || 500);
  }
}

export async function verifyOTPAndLogin(req: AuthRequest, res: Response) {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      throw new ApiErrorClass('Invalid or expired OTP', 400);
    }

    // Get student
    const student = await prisma.students.findUnique({
      where: { email },
    });

    if (!student) {
      throw new ApiErrorClass('Student not found', 404);
    }

    // Generate JWT token
    const token = generateToken({
      id: student.id,
      email: student.email,
      type: 'student',
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: student.id,
        userType: 'Student',
        action: 'login',
        details: 'Student logged in via OTP',
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        year: student.year,
        department: student.department,
        rollNo: student.rollNo,
      },
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error verifying OTP', error.statusCode || 500);
  }
}

export async function coordinatorLogin(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    // Find coordinator
    const coordinator = await prisma.coordinators.findUnique({
      where: { email },
    });

    if (!coordinator) {
      throw new ApiErrorClass('Invalid credentials', 401);
    }

    // Compare password
    const isValidPassword = await comparePassword(password, coordinator.password);

    if (!isValidPassword) {
      throw new ApiErrorClass('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: coordinator.id,
      email: coordinator.email,
      type: 'coordinator',
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: coordinator.id,
        userType: 'Coordinator',
        action: 'login',
        details: 'Coordinator logged in',
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      token,
      user: {
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        role: coordinator.role,
        department: coordinator.department,
      },
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error logging in', error.statusCode || 500);
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      throw new ApiErrorClass('User not authenticated', 401);
    }

    if (req.user.type === 'student') {
      const student = await prisma.students.findUnique({
        where: { id: req.user.id },
      });

      if (!student) {
        throw new ApiErrorClass('Student not found', 404);
      }

      res.status(200).json({
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          year: student.year,
          department: student.department,
          rollNo: student.rollNo,
          type: 'student',
        },
      });
    } else {
      const coordinator = await prisma.coordinators.findUnique({
        where: { id: req.user.id },
      });

      if (!coordinator) {
        throw new ApiErrorClass('Coordinator not found', 404);
      }

      res.status(200).json({
        user: {
          id: coordinator.id,
          name: coordinator.name,
          email: coordinator.email,
          role: coordinator.role,
          department: coordinator.department,
          type: 'coordinator',
        },
      });
    }
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error getting user', error.statusCode || 500);
  }
}

export async function logout(req: AuthRequest, res: Response) {
  try {
    // In a real app, you'd blacklist the token here
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error logging out', error.statusCode || 500);
  }
}
