import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.oTP.deleteMany();
  await prisma.students.deleteMany();
  await prisma.coordinators.deleteMany();

  // Create coordinator
  const hashedPassword = await bcrypt.hash('password123', 10);
  const coordinator = await prisma.coordinators.create({
    data: {
      name: 'Dr. Placement Officer',
      email: 'placement@college.edu',
      password: hashedPassword,
      role: 'Coordinator',
      department: 'Placement Cell',
    },
  });
  console.log('✅ Created coordinator:', coordinator.email);

  // Create students
  const students = await Promise.all([
    prisma.students.create({
      data: {
        rollNo: 'CS2021001',
        name: 'Rahul Sharma',
        email: 'rahul@college.edu',
        phone: '+91-9876543210',
        year: 'Final',
        department: 'Computer Science',
      },
    }),
    prisma.students.create({
      data: {
        rollNo: 'IT2022015',
        name: 'Priya Patel',
        email: 'priya@college.edu',
        phone: '+91-9876543211',
        year: 'Pre-Final',
        department: 'Information Technology',
      },
    }),
    prisma.students.create({
      data: {
        rollNo: 'EC2021042',
        name: 'Amit Kumar',
        email: 'amit@college.edu',
        phone: '+91-9876543212',
        year: 'Final',
        department: 'Electronics',
      },
    }),
  ]);
  console.log(`✅ Created ${students.length} students`);

  // Create jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Build scalable web applications using modern technologies. Work with React, Node.js, and cloud platforms.',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        deadline: new Date('2025-12-31'),
        targetYears: ['Final'],
        targetDepts: ['Computer Science', 'Information Technology'],
        mandatory: false,
        externalLink: 'https://techcorp.com/careers/software-engineer',
        location: 'Bangalore',
        ctc: '12 LPA',
        postedBy: coordinator.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Frontend Developer Intern',
        company: 'StartupXYZ',
        description: 'Learn and contribute to exciting frontend projects. Build beautiful user interfaces.',
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        deadline: new Date('2025-11-15'),
        targetYears: ['Pre-Final'],
        targetDepts: ['Computer Science', 'Information Technology'],
        mandatory: false,
        externalLink: 'https://startupxyz.com/internships',
        location: 'Remote',
        ctc: 'Stipend: 15k/month',
        postedBy: coordinator.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Data Analyst',
        company: 'Analytics Pro',
        description: 'Analyze large datasets and create insightful reports. Work with Python, SQL, and visualization tools.',
        skills: ['Python', 'SQL', 'Excel', 'Tableau'],
        deadline: new Date('2025-12-15'),
        targetYears: ['Final', 'Pre-Final'],
        targetDepts: ['Computer Science', 'Information Technology', 'Electronics'],
        mandatory: false,
        externalLink: 'https://analyticspro.com/jobs/analyst',
        location: 'Mumbai',
        ctc: '8 LPA',
        postedBy: coordinator.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Campus Ambassador Program',
        company: 'BigTech Inc',
        description: 'Represent our company on campus. Organize events and workshops.',
        skills: ['Communication', 'Leadership', 'Event Management'],
        deadline: new Date('2025-10-30'),
        targetYears: ['Final', 'Pre-Final'],
        targetDepts: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
        mandatory: true,
        externalLink: 'https://bigtech.com/campus-ambassador',
        location: 'On-Campus',
        ctc: 'Certificate + Goodies',
        postedBy: coordinator.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Full Stack Developer',
        company: 'WebSolutions Ltd',
        description: 'Work on end-to-end web development projects. Full-time role with competitive benefits.',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        deadline: new Date('2025-11-30'),
        targetYears: ['Final'],
        targetDepts: ['Computer Science', 'Information Technology'],
        mandatory: false,
        externalLink: 'https://websolutions.com/careers',
        location: 'Pune',
        ctc: '10 LPA',
        postedBy: coordinator.id,
      },
    }),
  ]);
  console.log(`✅ Created ${jobs.length} jobs`);

  // Create sample applications
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        studentId: students[0].id,
        jobId: jobs[0].id,
        status: 'Applied',
        notes: 'Applied through college portal',
      },
    }),
    prisma.application.create({
      data: {
        studentId: students[0].id,
        jobId: jobs[4].id,
        status: 'Interview',
        notes: 'Interview scheduled for next week',
      },
    }),
  ]);
  console.log(`✅ Created ${applications.length} applications`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
