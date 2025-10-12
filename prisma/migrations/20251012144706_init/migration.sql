-- CreateTable
CREATE TABLE "Students" (
    "id" SERIAL NOT NULL,
    "rollNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "fcmToken" TEXT,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinators" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Coordinator',
    "department" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coordinators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "deadline" TIMESTAMP(3) NOT NULL,
    "targetYears" TEXT[],
    "targetDepts" TEXT[],
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "externalLink" TEXT NOT NULL,
    "location" TEXT,
    "ctc" TEXT,
    "postedBy" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Students_rollNo_key" ON "Students"("rollNo");

-- CreateIndex
CREATE UNIQUE INDEX "Students_email_key" ON "Students"("email");

-- CreateIndex
CREATE INDEX "Students_email_idx" ON "Students"("email");

-- CreateIndex
CREATE INDEX "Students_year_idx" ON "Students"("year");

-- CreateIndex
CREATE INDEX "Students_department_idx" ON "Students"("department");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinators_email_key" ON "Coordinators"("email");

-- CreateIndex
CREATE INDEX "Coordinators_email_idx" ON "Coordinators"("email");

-- CreateIndex
CREATE INDEX "Job_deadline_idx" ON "Job"("deadline");

-- CreateIndex
CREATE INDEX "Job_postedBy_idx" ON "Job"("postedBy");

-- CreateIndex
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_jobId_key" ON "Application"("studentId", "jobId");

-- CreateIndex
CREATE INDEX "SavedJob_studentId_idx" ON "SavedJob"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_studentId_jobId_key" ON "SavedJob"("studentId", "jobId");

-- CreateIndex
CREATE INDEX "OTP_email_idx" ON "OTP"("email");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userType_idx" ON "AuditLog"("userType");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_postedBy_fkey" FOREIGN KEY ("postedBy") REFERENCES "Coordinators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
