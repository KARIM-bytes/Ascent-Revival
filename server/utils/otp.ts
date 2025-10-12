import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(email: string): Promise<{ otpId: number; otp: string }> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otpRecord = await prisma.oTP.create({
    data: {
      email,
      otp,
      expiresAt,
      verified: false,
    },
  });

  return { otpId: otpRecord.id, otp };
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      otp,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return false;
  }

  if (new Date() > otpRecord.expiresAt) {
    return false;
  }

  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return true;
}

export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.oTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
