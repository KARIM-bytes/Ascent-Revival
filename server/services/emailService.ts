import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const FROM_ADDRESS = process.env.SMTP_FROM || '"Campus Placement" <placement@college.edu>';

// SMTP is considered configured only when real credentials are provided
// (not the placeholder values shipped in .env.example).
function smtpConfigured(): boolean {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(user && pass && !user.startsWith('your-') && !pass.startsWith('your-'));
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Fail fast instead of hanging the request when the SMTP host is
      // unreachable from the hosting provider.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

// TEMPORARY demo escape hatch: with OTP_EMAIL_BEST_EFFORT=true the OTP
// request still succeeds when email delivery fails (the code is in the
// DB; an admin can read it out). Remove once a working SMTP provider is
// configured — with this on, students get no email and no error either.
function bestEffort(): boolean {
  return process.env.OTP_EMAIL_BEST_EFFORT === 'true';
}

export async function sendOTP(email: string, otp: string): Promise<void> {
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === 'production' && !bestEffort()) {
      // Never silently swallow OTPs in production — login would be impossible.
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.');
    }
    console.log(`📧 [email disabled] OTP for ${email}: ${otp}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Your OTP for Campus Placement Login',
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  } catch (error) {
    if (bestEffort()) {
      console.error(`OTP email to ${email} failed (best-effort mode, OTP is in DB):`, error);
      return;
    }
    throw error;
  }
}

// The notification emails below are best-effort: a failure should never
// break the main flow (job creation, application submission), so errors
// are logged rather than rethrown.

export async function sendJobAlert(email: string, jobDetails: { title: string; company: string; deadline: Date }): Promise<void> {
  if (!smtpConfigured()) {
    console.log(`📧 [SMTP not configured] Job alert for ${email}: ${jobDetails.title} at ${jobDetails.company}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
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
}

export async function sendApplicationConfirmation(email: string, jobTitle: string): Promise<void> {
  if (!smtpConfigured()) {
    console.log(`📧 [SMTP not configured] Application confirmation for ${email}: ${jobTitle}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
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
}

export async function sendDeadlineReminder(email: string, jobTitle: string, daysLeft: number): Promise<void> {
  if (!smtpConfigured()) {
    console.log(`📧 [SMTP not configured] Deadline reminder for ${email}: ${jobTitle} (${daysLeft} days left)`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: FROM_ADDRESS,
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
}
