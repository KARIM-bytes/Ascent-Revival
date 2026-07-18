import { sendJobAlert } from './emailService';
import { prisma } from '../lib/prisma';

// Mock push notification service
// In production, integrate Firebase Admin SDK

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: any
): Promise<{ success: boolean; messageId?: string }> {
  console.log(`📱 Push notification to ${fcmToken}: ${title} - ${body}`);
  
  // Mock implementation
  // In production, use Firebase Admin SDK:
  /*
  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token: fcmToken,
    };
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false };
  }
  */
  
  return { success: true, messageId: 'mock-message-id' };
}

export async function sendMulticast(
  tokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<{ success: boolean; sentCount: number }> {
  console.log(`📱 Multicast to ${tokens.length} devices: ${title} - ${body}`);
  
  // Mock implementation
  // In production, use Firebase Admin SDK multicast
  /*
  try {
    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };
    const response = await admin.messaging().sendMulticast(message);
    return { success: true, sentCount: response.successCount };
  } catch (error) {
    console.error('Error sending multicast:', error);
    return { success: false, sentCount: 0 };
  }
  */
  
  return { success: true, sentCount: tokens.length };
}

export async function notifyNewJob(jobId: number): Promise<void> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { coordinator: true },
  });

  if (!job) return;

  // Find eligible students
  const students = await prisma.students.findMany({
    where: {
      year: { in: job.targetYears },
      department: { in: job.targetDepts },
      emailNotifications: true,
    },
  });

  // Send email alerts in parallel; sendJobAlert is best-effort and never throws.
  await Promise.allSettled(
    students.map((student) =>
      sendJobAlert(student.email, {
        title: job.title,
        company: job.company,
        deadline: job.deadline,
      }),
    ),
  );

  // Send push notifications to students with FCM tokens
  const studentsWithTokens = students.filter(s => s.fcmToken);
  if (studentsWithTokens.length > 0) {
    await sendMulticast(
      studentsWithTokens.map(s => s.fcmToken!),
      'New Job Posted',
      `${job.company} is hiring for ${job.title}`,
      { jobId: job.id, type: 'new-job' }
    );
  }
}

export async function notifyApplicationStatusUpdate(
  applicationId: number,
  newStatus: string
): Promise<void> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: true,
      job: true,
    },
  });

  if (!application) return;

  const title = 'Application Status Updated';
  const body = `Your application for ${application.job.title} is now: ${newStatus}`;

  // Send email if enabled
  if (application.student.emailNotifications) {
    console.log(`📧 Status update email to ${application.student.email}`);
  }

  // Send push notification if FCM token exists
  if (application.student.fcmToken) {
    await sendPushNotification(
      application.student.fcmToken,
      title,
      body,
      { applicationId: application.id, status: newStatus }
    );
  }
}
