import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiErrorClass } from '../middleware/errorHandler';
import { notifyNewJob } from '../services/notificationService';
import { prisma } from '../lib/prisma';

export async function getAllJobs(req: AuthRequest, res: Response) {
  try {
    const {
      year,
      department,
      search,
      page = '1',
      limit = '20',
      sortBy = 'deadline',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (year) {
      where.targetYears = { has: year as string };
    }

    if (department) {
      where.targetDepts = { has: department as string };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === 'deadline') {
      orderBy.deadline = 'asc';
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = 'desc';
    } else if (sortBy === 'company') {
      orderBy.company = 'asc';
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          coordinator: {
            select: { id: true, name: true, department: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.status(200).json({
      jobs,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching jobs', error.statusCode || 500);
  }
}

export async function getJobById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        coordinator: {
          select: { id: true, name: true, email: true, department: true },
        },
      },
    });

    if (!job || job.deletedAt) {
      throw new ApiErrorClass('Job not found', 404);
    }

    res.status(200).json(job);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching job', error.statusCode || 500);
  }
}

export async function createJob(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      deadline: new Date(req.body.deadline),
    };

    const job = await prisma.job.create({
      data: jobData,
      include: {
        coordinator: {
          select: { id: true, name: true, department: true },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'job_created',
        details: `Created job: ${job.title} at ${job.company}`,
        ipAddress: req.ip,
      },
    });

    // Send notifications to eligible students
    await notifyNewJob(job.id);

    res.status(201).json(job);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error creating job', error.statusCode || 500);
  }
}

export async function updateJob(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    });

    if (!job || job.deletedAt) {
      throw new ApiErrorClass('Job not found', 404);
    }

    if (job.postedBy !== req.user.id) {
      throw new ApiErrorClass('You can only edit your own jobs', 403);
    }

    const updateData = { ...req.body };
    if (req.body.deadline) {
      updateData.deadline = new Date(req.body.deadline);
    }

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        coordinator: {
          select: { id: true, name: true, department: true },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'job_updated',
        details: `Updated job: ${updatedJob.title}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json(updatedJob);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error updating job', error.statusCode || 500);
  }
}

export async function deleteJob(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    });

    if (!job || job.deletedAt) {
      throw new ApiErrorClass('Job not found', 404);
    }

    if (job.postedBy !== req.user.id) {
      throw new ApiErrorClass('You can only delete your own jobs', 403);
    }

    // Soft delete
    await prisma.job.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'job_deleted',
        details: `Deleted job: ${job.title}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error deleting job', error.statusCode || 500);
  }
}

export async function getJobApplicants(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const applications = await prisma.application.findMany({
      where: {
        jobId: parseInt(id),
        deletedAt: null,
      },
      include: {
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
      orderBy: { appliedAt: 'desc' },
    });

    res.status(200).json(applications);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching applicants', error.statusCode || 500);
  }
}

export async function saveJob(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    });

    if (!job || job.deletedAt) {
      throw new ApiErrorClass('Job not found', 404);
    }

    await prisma.savedJob.create({
      data: {
        studentId: req.user.id,
        jobId: parseInt(id),
      },
    });

    res.status(200).json({ success: true, message: 'Job saved' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ApiErrorClass('Job already saved', 400);
    }
    throw new ApiErrorClass(error.message || 'Error saving job', error.statusCode || 500);
  }
}

export async function unsaveJob(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    await prisma.savedJob.deleteMany({
      where: {
        studentId: req.user.id,
        jobId: parseInt(id),
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error unsaving job', error.statusCode || 500);
  }
}

export async function getSavedJobs(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'student') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { studentId: req.user.id },
      include: {
        job: {
          include: {
            coordinator: {
              select: { id: true, name: true, department: true },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    res.status(200).json(savedJobs.map(sj => sj.job));
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching saved jobs', error.statusCode || 500);
  }
}
