import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { ApiErrorClass } from '../middleware/errorHandler';
import { sendApplicationConfirmation } from '../services/emailService';
import { notifyApplicationStatusUpdate } from '../services/notificationService';

const prisma = new PrismaClient();

export async function applyForJob(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { jobId, notes } = req.body;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.deletedAt) {
      throw new ApiErrorClass('Job not found', 404);
    }

    // Check if deadline has passed
    if (new Date() > job.deadline) {
      throw new ApiErrorClass('Application deadline has passed', 400);
    }

    // Check if student is eligible (year and department)
    const student = await prisma.students.findUnique({
      where: { id: req.user.id },
    });

    if (!student) {
      throw new ApiErrorClass('Student not found', 404);
    }

    if (!job.targetYears.includes(student.year)) {
      throw new ApiErrorClass('You are not eligible for this job (year mismatch)', 403);
    }

    if (!job.targetDepts.includes(student.department)) {
      throw new ApiErrorClass('You are not eligible for this job (department mismatch)', 403);
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        studentId: req.user.id,
        jobId,
        deletedAt: null,
      },
    });

    if (existingApplication) {
      throw new ApiErrorClass('You have already applied for this job', 400);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId: req.user.id,
        jobId,
        status: 'Applied',
        notes: notes || '',
      },
      include: {
        job: {
          include: {
            coordinator: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Student',
        action: 'application_created',
        details: `Applied for job: ${job.title}`,
        ipAddress: req.ip,
      },
    });

    // Send confirmation email
    await sendApplicationConfirmation(student.email, job.title);

    res.status(201).json(application);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error applying for job', error.statusCode || 500);
  }
}

export async function getMyApplications(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { status } = req.query;

    const where: any = {
      studentId: req.user.id,
      deletedAt: null,
    };

    if (status) {
      where.status = status as string;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            coordinator: {
              select: { id: true, name: true, department: true },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.status(200).json(applications);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching applications', error.statusCode || 500);
  }
}

export async function getApplicationById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: {
          include: {
            coordinator: {
              select: { id: true, name: true, email: true, department: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            rollNo: true,
            name: true,
            email: true,
            phone: true,
            year: true,
            department: true,
          },
        },
      },
    });

    if (!application || application.deletedAt) {
      throw new ApiErrorClass('Application not found', 404);
    }

    // Check authorization
    if (req.user?.type === 'student' && application.studentId !== req.user.id) {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    if (req.user?.type === 'coordinator' && application.job.postedBy !== req.user.id) {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    res.status(200).json(application);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching application', error.statusCode || 500);
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: true,
      },
    });

    if (!application || application.deletedAt) {
      throw new ApiErrorClass('Application not found', 404);
    }

    // Check if coordinator posted this job
    if (application.job.postedBy !== req.user.id) {
      throw new ApiErrorClass('You can only update applications for your jobs', 403);
    }

    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedApplication = await prisma.application.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        job: true,
        student: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'application_status_updated',
        details: `Updated application status to: ${status}`,
        ipAddress: req.ip,
      },
    });

    // Notify student about status change
    await notifyApplicationStatusUpdate(updatedApplication.id, status);

    res.status(200).json(updatedApplication);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error updating application', error.statusCode || 500);
  }
}

export async function withdrawApplication(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application || application.deletedAt) {
      throw new ApiErrorClass('Application not found', 404);
    }

    if (application.studentId !== req.user.id) {
      throw new ApiErrorClass('You can only withdraw your own applications', 403);
    }

    // Soft delete
    await prisma.application.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Student',
        action: 'application_withdrawn',
        details: `Withdrew application ID: ${id}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error withdrawing application', error.statusCode || 500);
  }
}

export async function getApplicationStats(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: {
        studentId: req.user.id,
        deletedAt: null,
      },
      _count: true,
    });

    const result = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    stats.forEach(stat => {
      result[stat.status as keyof typeof result] = stat._count;
      result.total += stat._count;
    });

    res.status(200).json(result);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching stats', error.statusCode || 500);
  }
}
