import nodemailer from 'nodemailer';

// Mock email service - will use console.log for now
// Replace with actual SMTP configuration in production

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'placement@college.edu',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

export async function sendOTP(email: string, otp: string): Promise<void> {
  console.log(`📧 Sending OTP to ${email}: ${otp}`);
  
  // For MVP, just log the OTP
  // In production, uncomment below to send actual email
  
  /*
  try {
    await transporter.sendMail({
      from: '"Campus Placement" <placement@college.edu>',
      to: email,
      subject: 'Your OTP for Campus Placement Login',
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
  */
}

export async function sendJobAlert(email: string, jobDetails: { title: string; company: string; deadline: Date }): Promise<void> {
  console.log(`📧 Sending job alert to ${email}: ${jobDetails.title} at ${jobDetails.company}`);
  
  /*
  try {
    await transporter.sendMail({
      from: '"Campus Placement" <placement@college.edu>',
      to: email,
      subject: `New Job Posted: ${jobDetails.title}`,
      html: `
        <h2>New Job Opportunity</h2>
        <p><strong>${jobDetails.title}</strong> at ${jobDetails.company}</p>
        <p>Deadline: ${jobDetails.deadline.toLocaleDateString()}</p>
        <p>Login to the campus placement portal to apply!</p>
      `,
    });
  } catch (error) {
    console.error('Error sending job alert:', error);
  }
  */
}

export async function sendApplicationConfirmation(email: string, jobTitle: string): Promise<void> {
  console.log(`📧 Sending application confirmation to ${email} for ${jobTitle}`);
  
  /*
  try {
    await transporter.sendMail({
      from: '"Campus Placement" <placement@college.edu>',
      to: email,
      subject: 'Application Submitted Successfully',
      html: `
        <h2>Application Confirmed</h2>
        <p>You have successfully applied for: <strong>${jobTitle}</strong></p>
        <p>Track your application status in the campus placement portal.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending application confirmation:', error);
  }
  */
}

export async function sendDeadlineReminder(email: string, jobTitle: string, daysLeft: number): Promise<void> {
  console.log(`📧 Sending deadline reminder to ${email}: ${jobTitle} (${daysLeft} days left)`);
  
  /*
  try {
    await transporter.sendMail({
      from: '"Campus Placement" <placement@college.edu>',
      to: email,
      subject: `Reminder: ${jobTitle} Deadline in ${daysLeft} Days`,
      html: `
        <h2>Application Deadline Approaching</h2>
        <p>The deadline for <strong>${jobTitle}</strong> is in ${daysLeft} days.</p>
        <p>Don't miss this opportunity! Apply now on the campus placement portal.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending deadline reminder:', error);
  }
  */
}
