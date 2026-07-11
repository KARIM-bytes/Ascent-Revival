import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiErrorClass } from '../middleware/errorHandler';
import { sendPushNotification, sendMulticast } from '../services/notificationService';
import { prisma } from '../lib/prisma';

export async function updateFCMToken(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { fcmToken } = req.body;

    await prisma.students.update({
      where: { id: req.user.id },
      data: { fcmToken },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error updating FCM token', error.statusCode || 500);
  }
}

export async function updateNotificationPreferences(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { emailNotifications, pushNotifications } = req.body;

    const updateData: any = {};

    if (emailNotifications !== undefined) {
      updateData.emailNotifications = emailNotifications;
    }

    if (pushNotifications !== undefined) {
      updateData.pushNotifications = pushNotifications;
    }

    await prisma.students.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error updating preferences', error.statusCode || 500);
  }
}

export async function sendNotification(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { studentId, title, body, data } = req.body;

    const student = await prisma.students.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiErrorClass('Student not found', 404);
    }

    if (!student.fcmToken) {
      throw new ApiErrorClass('Student does not have push notifications enabled', 400);
    }

    const result = await sendPushNotification(student.fcmToken, title, body, data);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'notification_sent',
        details: `Sent notification to student: ${student.name}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json(result);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error sending notification', error.statusCode || 500);
  }
}

export async function broadcastNotification(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { title, body, filters, data } = req.body;

    const where: any = {
      fcmToken: { not: null },
      pushNotifications: true,
    };

    if (filters?.year) {
      where.year = filters.year;
    }

    if (filters?.department) {
      where.department = filters.department;
    }

    const students = await prisma.students.findMany({
      where,
      select: { fcmToken: true },
    });

    if (students.length === 0) {
      throw new ApiErrorClass('No eligible students found', 404);
    }

    const tokens = students.map(s => s.fcmToken!);

    const result = await sendMulticast(tokens, title, body, data);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'broadcast_sent',
        details: `Broadcast sent to ${result.sentCount} students`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json(result);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error broadcasting notification', error.statusCode || 500);
  }
}
