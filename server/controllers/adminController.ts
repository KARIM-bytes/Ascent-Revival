import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiErrorClass } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';
import { prisma } from '../lib/prisma';

export async function getAllStudents(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { year, department, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (year) {
      where.year = year as string;
    }

    if (department) {
      where.department = department as string;
    }

    const [students, totalCount] = await Promise.all([
      prisma.students.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { rollNo: 'asc' },
      }),
      prisma.students.count({ where }),
    ]);

    res.status(200).json({
      students,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching students', error.statusCode || 500);
  }
}

export async function createStudent(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const student = await prisma.students.create({
      data: req.body,
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'student_created',
        details: `Created student: ${student.name} (${student.rollNo})`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ApiErrorClass('Student with this email or roll number already exists', 400);
    }
    throw new ApiErrorClass(error.message || 'Error creating student', error.statusCode || 500);
  }
}

export async function bulkImportStudents(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { students } = req.body;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const studentData of students) {
      try {
        await prisma.students.create({
          data: studentData,
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          student: studentData.email,
          error: error.message,
        });
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'bulk_import',
        details: `Imported ${results.success} students, ${results.failed} failed`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json(results);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error importing students', error.statusCode || 500);
  }
}

export async function updateStudent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const student = await prisma.students.update({
      where: { id: parseInt(id) },
      data: req.body,
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'student_updated',
        details: `Updated student: ${student.name} (${student.rollNo})`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json(student);
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error updating student', error.statusCode || 500);
  }
}

export async function deleteStudent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    await prisma.students.delete({
      where: { id: parseInt(id) },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'student_deleted',
        details: `Deleted student ID: ${id}`,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error deleting student', error.statusCode || 500);
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const [
      totalStudents,
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsByStatus,
    ] = await Promise.all([
      prisma.students.count(),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.job.count({
        where: {
          deletedAt: null,
          deadline: { gte: new Date() },
        },
      }),
      prisma.application.count({ where: { deletedAt: null } }),
      prisma.application.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const statusBreakdown: any = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    applicationsByStatus.forEach(item => {
      statusBreakdown[item.status] = item._count;
    });

    res.status(200).json({
      totalStudents,
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsByStatus: statusBreakdown,
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching stats', error.statusCode || 500);
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { page = '1', limit = '50', action, userType } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (action) {
      where.action = action as string;
    }

    if (userType) {
      where.userType = userType as string;
    }

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.status(200).json({
      logs,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error: any) {
    throw new ApiErrorClass(error.message || 'Error fetching audit logs', error.statusCode || 500);
  }
}

export async function createCoordinator(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.type !== 'coordinator') {
      throw new ApiErrorClass('Unauthorized', 403);
    }

    const { name, email, password, role, department } = req.body;

    const hashedPassword = await hashPassword(password);

    const coordinator = await prisma.coordinators.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'Admin',
        department,
      },
    });

    // Remove password from response
    const { password: _, ...coordinatorWithoutPassword } = coordinator;

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userType: 'Coordinator',
        action: 'coordinator_created',
        details: `Created coordinator: ${name} (${email})`,
        ipAddress: req.ip,
      },
    });

    res.status(201).json(coordinatorWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ApiErrorClass('Coordinator with this email already exists', 400);
    }
    throw new ApiErrorClass(error.message || 'Error creating coordinator', error.statusCode || 500);
  }
}
