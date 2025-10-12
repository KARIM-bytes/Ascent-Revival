# Campus Placement Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "data": {...},
  "success": true
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-10-12T14:30:00.000Z"
}
```

---

## 1. Authentication Endpoints

### 1.1 Student OTP Request
Request an OTP for student login.

**Endpoint:** `POST /auth/student/request-otp`

**Request Body:**
```json
{
  "email": "student@college.edu"
}
```

**Response:**
```json
{
  "success": true,
  "otpId": 1,
  "message": "OTP sent to email"
}
```

**Note:** OTP will be logged in the console (check server logs). In production, it will be sent via email.

---

### 1.2 Student OTP Verification & Login
Verify OTP and receive authentication token.

**Endpoint:** `POST /auth/student/verify-otp`

**Request Body:**
```json
{
  "email": "student@college.edu",
  "otp": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@college.edu",
    "year": "Final",
    "department": "Computer Science",
    "rollNo": "CS2021001"
  }
}
```

---

### 1.3 Coordinator Login
Login with email and password.

**Endpoint:** `POST /auth/coordinator/login`

**Request Body:**
```json
{
  "email": "coordinator@college.edu",
  "password": "coordinator123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dr. Admin",
    "email": "coordinator@college.edu",
    "role": "Admin",
    "department": "Placement Cell"
  }
}
```

---

### 1.4 Get Current User
Get currently authenticated user details.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@college.edu",
    "year": "Final",
    "department": "Computer Science",
    "rollNo": "CS2021001",
    "type": "student"
  }
}
```

---

### 1.5 Logout
Logout current user.

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Job Endpoints

### 2.1 Get All Jobs
Retrieve all jobs with optional filtering and pagination.

**Endpoint:** `GET /jobs`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `year` (optional): Filter by target year (Final, Pre-Final)
- `department` (optional): Filter by target department
- `search` (optional): Search in title, company, or description
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Results per page
- `sortBy` (optional, default: deadline): Sort field (deadline, createdAt, company)

**Example:** `GET /jobs?year=Final&department=Computer%20Science&page=1&limit=20`

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "Software Engineer",
      "company": "Tech Corp",
      "description": "We are looking for talented software engineers...",
      "skills": ["JavaScript", "React", "Node.js"],
      "deadline": "2024-12-31T23:59:59.000Z",
      "targetYears": ["Final"],
      "targetDepts": ["Computer Science", "Information Technology"],
      "mandatory": false,
      "externalLink": "https://techcorp.com/careers/123",
      "location": "Bangalore",
      "ctc": "12-15 LPA",
      "postedAt": "2024-10-01T10:00:00.000Z",
      "coordinator": {
        "id": 1,
        "name": "Dr. Admin",
        "department": "Placement Cell"
      }
    }
  ],
  "totalCount": 45,
  "currentPage": 1,
  "totalPages": 3
}
```

---

### 2.2 Get Job by ID
Retrieve a specific job by ID.

**Endpoint:** `GET /jobs/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "description": "Detailed job description...",
  "skills": ["JavaScript", "React", "Node.js"],
  "deadline": "2024-12-31T23:59:59.000Z",
  "targetYears": ["Final"],
  "targetDepts": ["Computer Science"],
  "mandatory": false,
  "externalLink": "https://techcorp.com/careers/123",
  "location": "Bangalore",
  "ctc": "12-15 LPA",
  "postedAt": "2024-10-01T10:00:00.000Z",
  "coordinator": {
    "id": 1,
    "name": "Dr. Admin",
    "email": "coordinator@college.edu",
    "department": "Placement Cell"
  }
}
```

---

### 2.3 Create Job (Coordinator Only)
Create a new job posting.

**Endpoint:** `POST /jobs`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "description": "We are looking for talented software engineers with strong problem-solving skills...",
  "skills": ["JavaScript", "React", "Node.js"],
  "deadline": "2024-12-31T23:59:59.000Z",
  "targetYears": ["Final"],
  "targetDepts": ["Computer Science", "Information Technology"],
  "mandatory": false,
  "externalLink": "https://techcorp.com/careers/123",
  "location": "Bangalore",
  "ctc": "12-15 LPA"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "description": "We are looking for...",
  "skills": ["JavaScript", "React", "Node.js"],
  "deadline": "2024-12-31T23:59:59.000Z",
  "targetYears": ["Final"],
  "targetDepts": ["Computer Science", "Information Technology"],
  "mandatory": false,
  "externalLink": "https://techcorp.com/careers/123",
  "location": "Bangalore",
  "ctc": "12-15 LPA",
  "postedBy": 1,
  "postedAt": "2024-10-12T14:30:00.000Z",
  "coordinator": {
    "id": 1,
    "name": "Dr. Admin",
    "department": "Placement Cell"
  }
}
```

**Note:** Email and push notifications will be sent to eligible students automatically.

---

### 2.4 Update Job (Coordinator Only)
Update an existing job posting.

**Endpoint:** `PUT /jobs/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "title": "Senior Software Engineer",
  "description": "Updated description...",
  "deadline": "2025-01-15T23:59:59.000Z"
}
```

**Response:** Updated job object

**Note:** Only the coordinator who created the job can update it.

---

### 2.5 Delete Job (Coordinator Only)
Soft delete a job posting.

**Endpoint:** `DELETE /jobs/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true
}
```

**Note:** Only the coordinator who created the job can delete it. This is a soft delete.

---

### 2.6 Get Job Applicants (Coordinator Only)
Get all applications for a specific job.

**Endpoint:** `GET /jobs/:id/applicants`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "jobId": 1,
    "studentId": 1,
    "status": "Applied",
    "notes": "",
    "appliedAt": "2024-10-15T10:00:00.000Z",
    "student": {
      "id": 1,
      "rollNo": "CS2021001",
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "phone": "9876543210",
      "year": "Final",
      "department": "Computer Science"
    }
  }
]
```

---

### 2.7 Save Job (Student Only)
Save a job for later reference.

**Endpoint:** `POST /jobs/:id/save`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Job saved"
}
```

---

### 2.8 Unsave Job (Student Only)
Remove a saved job.

**Endpoint:** `DELETE /jobs/:id/save`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true
}
```

---

### 2.9 Get Saved Jobs (Student Only)
Get all jobs saved by the student.

**Endpoint:** `GET /jobs/saved/all`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "description": "Job description...",
    "deadline": "2024-12-31T23:59:59.000Z",
    "coordinator": {
      "id": 1,
      "name": "Dr. Admin",
      "department": "Placement Cell"
    }
  }
]
```

---

## 3. Application Endpoints

### 3.1 Apply for Job (Student Only)
Submit an application for a job.

**Endpoint:** `POST /applications`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "jobId": 1,
  "notes": "I am very interested in this position..." (optional)
}
```

**Response:**
```json
{
  "id": 1,
  "studentId": 1,
  "jobId": 1,
  "status": "Applied",
  "notes": "I am very interested...",
  "appliedAt": "2024-10-15T10:00:00.000Z",
  "job": {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "coordinator": {
      "id": 1,
      "name": "Dr. Admin"
    }
  }
}
```

**Note:** 
- Confirmation email will be sent automatically
- Student must be eligible (matching year and department)
- Cannot apply to the same job twice
- Deadline must not have passed

---

### 3.2 Get My Applications (Student Only)
Get all applications submitted by the student.

**Endpoint:** `GET /applications/me`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (Applied, Interview, Offer, Rejected)

**Example:** `GET /applications/me?status=Applied`

**Response:**
```json
[
  {
    "id": 1,
    "jobId": 1,
    "status": "Applied",
    "notes": "Application notes...",
    "appliedAt": "2024-10-15T10:00:00.000Z",
    "job": {
      "id": 1,
      "title": "Software Engineer",
      "company": "Tech Corp",
      "deadline": "2024-12-31T23:59:59.000Z",
      "coordinator": {
        "id": 1,
        "name": "Dr. Admin",
        "department": "Placement Cell"
      }
    }
  }
]
```

---

### 3.3 Get Application Stats (Student Only)
Get application statistics for the student.

**Endpoint:** `GET /applications/me/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total": 10,
  "Applied": 5,
  "Interview": 3,
  "Offer": 1,
  "Rejected": 1
}
```

---

### 3.4 Get Application by ID
Get details of a specific application.

**Endpoint:** `GET /applications/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "studentId": 1,
  "jobId": 1,
  "status": "Interview",
  "notes": "First round scheduled for next week",
  "appliedAt": "2024-10-15T10:00:00.000Z",
  "job": {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "coordinator": {
      "id": 1,
      "name": "Dr. Admin",
      "email": "coordinator@college.edu",
      "department": "Placement Cell"
    }
  },
  "student": {
    "id": 1,
    "rollNo": "CS2021001",
    "name": "John Doe",
    "email": "john.doe@college.edu",
    "phone": "9876543210",
    "year": "Final",
    "department": "Computer Science"
  }
}
```

**Authorization:**
- Students can only view their own applications
- Coordinators can only view applications for jobs they posted

---

### 3.5 Update Application Status (Coordinator Only)
Update the status of an application.

**Endpoint:** `PATCH /applications/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "Interview",
  "notes": "First round scheduled for 20th October" (optional)
}
```

**Valid Statuses:** Applied, Interview, Offer, Rejected

**Response:**
```json
{
  "id": 1,
  "studentId": 1,
  "jobId": 1,
  "status": "Interview",
  "notes": "First round scheduled for 20th October",
  "appliedAt": "2024-10-15T10:00:00.000Z",
  "job": {...},
  "student": {...}
}
```

**Note:** Student will be notified via email and push notification automatically.

---

### 3.6 Withdraw Application (Student Only)
Withdraw an application.

**Endpoint:** `DELETE /applications/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true
}
```

**Note:** Can only withdraw your own applications.

---

## 4. Admin Endpoints (Coordinator Only)

All admin endpoints require coordinator authentication.

### 4.1 Get Dashboard Stats
Get overall placement statistics.

**Endpoint:** `GET /admin/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalStudents": 150,
  "totalJobs": 45,
  "activeJobs": 30,
  "totalApplications": 450,
  "applicationsByStatus": {
    "Applied": 200,
    "Interview": 150,
    "Offer": 50,
    "Rejected": 50
  }
}
```

---

### 4.2 Get All Students
Retrieve all students with optional filtering and pagination.

**Endpoint:** `GET /admin/students`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `year` (optional): Filter by year
- `department` (optional): Filter by department
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50, max: 100): Results per page

**Response:**
```json
{
  "students": [
    {
      "id": 1,
      "rollNo": "CS2021001",
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "phone": "9876543210",
      "year": "Final",
      "department": "Computer Science",
      "emailNotifications": true,
      "pushNotifications": true
    }
  ],
  "totalCount": 150,
  "currentPage": 1,
  "totalPages": 3
}
```

---

### 4.3 Create Student
Add a new student to the system.

**Endpoint:** `POST /admin/students`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rollNo": "CS2021001",
  "name": "John Doe",
  "email": "john.doe@college.edu",
  "phone": "9876543210",
  "year": "Final",
  "department": "Computer Science"
}
```

**Response:** Created student object

---

### 4.4 Bulk Import Students
Import multiple students at once.

**Endpoint:** `POST /admin/students/bulk`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "students": [
    {
      "rollNo": "CS2021001",
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "phone": "9876543210",
      "year": "Final",
      "department": "Computer Science"
    },
    {
      "rollNo": "CS2021002",
      "name": "Jane Smith",
      "email": "jane.smith@college.edu",
      "phone": "9876543211",
      "year": "Pre-Final",
      "department": "Computer Science"
    }
  ]
}
```

**Response:**
```json
{
  "success": 150,
  "failed": 2,
  "errors": [
    {
      "student": "duplicate@college.edu",
      "error": "Student with this email already exists"
    }
  ]
}
```

---

### 4.5 Update Student
Update student information.

**Endpoint:** `PUT /admin/students/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)
```json
{
  "name": "John Updated Doe",
  "phone": "9999999999"
}
```

**Response:** Updated student object

---

### 4.6 Delete Student
Delete a student from the system.

**Endpoint:** `DELETE /admin/students/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true
}
```

**Warning:** This will permanently delete the student and all their applications.

---

### 4.7 Get Audit Logs
Retrieve system audit logs.

**Endpoint:** `GET /admin/audit-logs`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `action` (optional): Filter by action type
- `userType` (optional): Filter by user type (Student, Coordinator)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50, max: 100): Results per page

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "userId": 1,
      "userType": "Coordinator",
      "action": "job_created",
      "details": "Created job: Software Engineer at Tech Corp",
      "ipAddress": "192.168.1.1",
      "timestamp": "2024-10-12T14:30:00.000Z"
    }
  ],
  "totalCount": 1000,
  "currentPage": 1,
  "totalPages": 20
}
```

**Available Actions:**
- login
- otp_requested
- job_created
- job_updated
- job_deleted
- application_created
- application_status_updated
- application_withdrawn
- student_created
- student_updated
- student_deleted
- bulk_import
- notification_sent
- broadcast_sent
- coordinator_created

---

### 4.8 Create Coordinator
Create a new coordinator account.

**Endpoint:** `POST /admin/coordinators`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Dr. Smith",
  "email": "smith@college.edu",
  "password": "secure_password_123",
  "role": "Admin",
  "department": "Placement Cell"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Dr. Smith",
  "email": "smith@college.edu",
  "role": "Admin",
  "department": "Placement Cell"
}
```

---

## 5. Notification Endpoints

### 5.1 Update FCM Token (Student Only)
Register or update Firebase Cloud Messaging token for push notifications.

**Endpoint:** `POST /notifications/fcm-token`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fcmToken": "firebase_cloud_messaging_token_here"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 5.2 Update Notification Preferences (Student Only)
Update email and push notification preferences.

**Endpoint:** `PUT /notifications/preferences`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 5.3 Send Notification (Coordinator Only)
Send a push notification to a specific student.

**Endpoint:** `POST /notifications/send`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "studentId": 1,
  "title": "Interview Scheduled",
  "body": "Your interview with Tech Corp is scheduled for tomorrow at 10 AM",
  "data": {
    "jobId": 1,
    "applicationId": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "mock-message-id"
}
```

---

### 5.4 Broadcast Notification (Coordinator Only)
Send a push notification to multiple students based on filters.

**Endpoint:** `POST /notifications/broadcast`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Job Posted",
  "body": "Tech Corp is hiring for Software Engineer positions",
  "filters": {
    "year": "Final",
    "department": "Computer Science"
  },
  "data": {
    "jobId": 1,
    "type": "new-job"
  }
}
```

**Note:** `filters` is optional. Without filters, broadcasts to all students with push notifications enabled.

**Response:**
```json
{
  "success": true,
  "sentCount": 45
}
```

---

## 6. Health Check

### 6.1 Health Check
Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-12T14:30:00.000Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource does not exist |
| 500  | Internal Server Error |

---

## Automated Features

### Email Notifications
The system automatically sends emails for:
- OTP codes for student login
- New job postings to eligible students
- Application confirmations
- Deadline reminders (3 days before)
- Application status updates

### Push Notifications
Push notifications are sent for:
- New job postings (to eligible students)
- Application status changes
- Custom notifications from coordinators
- Broadcast messages

### Cron Jobs
The system runs the following automated tasks:
- **Hourly:** Clean up expired OTPs
- **Daily 9 AM:** Send deadline reminders for jobs expiring within 3 days
- **Daily Midnight:** Archive jobs with deadlines older than 30 days

---

## Sample Data

The database is pre-seeded with:

**Student:**
- Email: john.doe@college.edu
- Year: Final
- Department: Computer Science
- Roll No: CS2021001

**Coordinator:**
- Email: coordinator@college.edu
- Password: coordinator123
- Role: Admin

**Sample Job:**
- Title: Software Engineer
- Company: Tech Corp
- Target: Final year CS/IT students

---

## Testing the API

### Using cURL

**1. Student Login Flow:**
```bash
# Request OTP
curl -X POST http://localhost:5000/api/auth/student/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@college.edu"}'

# Check server logs for OTP (e.g., 123456)

# Verify OTP
curl -X POST http://localhost:5000/api/auth/student/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@college.edu","otp":"123456"}'
```

**2. Coordinator Login:**
```bash
curl -X POST http://localhost:5000/api/auth/coordinator/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coordinator@college.edu","password":"coordinator123"}'
```

**3. Get Jobs (authenticated):**
```bash
curl -X GET http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**4. Create Job (coordinator):**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "company": "Tech Corp",
    "description": "Looking for talented engineers...",
    "skills": ["JavaScript", "React"],
    "deadline": "2024-12-31T23:59:59.000Z",
    "targetYears": ["Final"],
    "targetDepts": ["Computer Science"],
    "mandatory": false,
    "externalLink": "https://example.com/apply"
  }'
```

**5. Apply for Job (student):**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"jobId": 1, "notes": "I am interested in this position"}'
```

---

## Notes

1. **OTP in Development:** OTPs are logged to the server console. Check the logs after requesting an OTP.

2. **Email Service:** Email service is currently mocked. Check server logs for email content. In production, configure SMTP settings in environment variables.

3. **Push Notifications:** FCM service is currently mocked. Integrate Firebase Admin SDK for production.

4. **Rate Limiting:** Consider adding rate limiting middleware for production.

5. **CORS:** Configure CORS settings based on your frontend domain.

6. **Environment Variables:** 
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `SESSION_SECRET`: Secret for Express sessions
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Email configuration

---

## Database Schema

The system uses PostgreSQL with Prisma ORM. Main tables:
- **Students**: Student information and preferences
- **Coordinators**: Placement coordinator accounts
- **Jobs**: Job postings
- **Applications**: Student job applications
- **SavedJobs**: Student saved jobs
- **OTP**: One-time passwords for student login
- **AuditLog**: System activity logs

---

## Support

For issues or questions, contact the development team or check the server logs for detailed error messages.
