import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { cleanupExpiredOTPs } from '../utils/otp';
import { sendDeadlineReminder } from '../services/emailService';

const prisma = new PrismaClient();

// Clean up expired OTPs every hour
export function startOTPCleanup() {
  cron.schedule('0 * * * *', async () => {
    console.log('🧹 Running OTP cleanup...');
    try {
      await cleanupExpiredOTPs();
      console.log('✅ OTP cleanup completed');
    } catch (error) {
      console.error('❌ OTP cleanup failed:', error);
    }
  });
}

// Send deadline reminders every day at 9 AM
export function startDeadlineReminders() {
  cron.schedule('0 9 * * *', async () => {
    console.log('📧 Sending deadline reminders...');
    try {
      const upcomingDeadlines = await prisma.job.findMany({
        where: {
          deletedAt: null,
          deadline: {
            gte: new Date(),
            lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Next 3 days
          },
        },
      });

      for (const job of upcomingDeadlines) {
        // Find students who haven't applied yet
        const eligibleStudents = await prisma.students.findMany({
          where: {
            year: { in: job.targetYears },
            department: { in: job.targetDepts },
            emailNotifications: true,
            NOT: {
              applications: {
                some: {
                  jobId: job.id,
                  deletedAt: null,
                },
              },
            },
          },
        });

        const daysLeft = Math.ceil(
          (job.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        for (const student of eligibleStudents) {
          await sendDeadlineReminder(student.email, job.title, daysLeft);
        }
      }

      console.log(`✅ Sent deadline reminders for ${upcomingDeadlines.length} jobs`);
    } catch (error) {
      console.error('❌ Deadline reminders failed:', error);
    }
  });
}

// Archive old jobs every day at midnight
export function startJobArchival() {
  cron.schedule('0 0 * * *', async () => {
    console.log('🗄️ Archiving expired jobs...');
    try {
      const result = await prisma.job.updateMany({
        where: {
          deletedAt: null,
          deadline: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      console.log(`✅ Archived ${result.count} expired jobs`);
    } catch (error) {
      console.error('❌ Job archival failed:', error);
    }
  });
}

// Initialize all cron jobs
export function initCronJobs() {
  console.log('⏰ Initializing cron jobs...');
  startOTPCleanup();
  startDeadlineReminders();
  startJobArchival();
  console.log('✅ Cron jobs initialized');
}
