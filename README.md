# SkillFlow - Next-Generation Hiring & Talent Platform

SkillFlow is a deployment-ready, high-performance job board and candidate management platform designed for seamless recruitment workflow, real-time application processing, and enterprise administration.

---

## 🚀 Key Features

### 👨‍🎓 Candidate Experience
- **Interactive Profile Management**: Add, edit, and organize candidate details, education, experience, projects, certifications, and languages.
- **Instant Skill Tagging (Zero Reload)**: Fast CRUD operations on key skills without page flushes or loading spinners.
- **Profile Photo & Resume URL Links**: Add direct image links with live avatar rendering and resume link attachments.
- **Job Applications with Resume Attachment**: Submit custom resume links or profile resumes directly when applying for positions.
- **Application Tracking**: Real-time status updates (Applied, Shortlisted, Interview, Selected/Hired, Rejected).

### 🏢 Employer Dashboard
- **Job Posting & Management**: Create, edit, publish, draft, and close job postings.
- **Candidate Pipeline**: View incoming job applications per position.
- **Resume & Avatar Visibility**: Direct one-click access to candidate resumes and profile photos on application cards.
- **Bulk Candidate Actions**: Advance or reject multiple candidate applications simultaneously.

### 🛡️ Admin Dashboard (`/admin/dashboard`)
- **System Overview & Metrics**: Real-time stats on total users, organizations, jobs, applications, and hiring pipeline.
- **Skills Directory Management (`/admin/skills`)**: Complete CRUD suite to manage global skills catalog.
- **User & Company Verification**: Verify employer companies and manage platform user accounts.
- **Audit Logging**: Comprehensive log of platform events, status updates, and administrative actions.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, TypeScript
- **Backend**: Express 5, Node.js, Prisma ORM (v6), PostgreSQL
- **Database**: Render PostgreSQL Database
- **Authentication**: JWT (JSON Web Tokens), Cookie / Header Bearer Auth
- **Testing**: Vitest, Supertest, Playwright (E2E)

---

## 📁 Repository Structure & Branching Strategy

This project maintains clear separation between frontend and backend services across dedicated branches:

- **`main`**: Combined monorepo containing both frontend (`skillFlow-frontend`) and backend (`skillFlow-backend`) services.
- **`SkillFlow_backend`**: Backend Express 5 API service and Prisma schema.
- **`SkillFlow_frontend`**: Next.js frontend application.

---

## ⚙️ Environment Configuration

### Required Environment Variables

For local development or deployment, configure the environment variables as follows:

#### Backend (`skillFlow-backend/.env`)
- `PORT`: Service port (e.g. `4000`)
- `NODE_ENV`: Application environment (`development` / `production`)
- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: PostgreSQL direct connection string
- `JWT_ACCESS_SECRET`: Secret key for signing JWT access tokens
- `JWT_REFRESH_SECRET`: Secret key for signing JWT refresh tokens
- `CORS_ORIGIN`: Allowed frontend origin (e.g. `http://localhost:3000`)

#### Frontend (`skillFlow-frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`: Backend API base URL (e.g. `http://localhost:4000/api/v1`)

---

## 🔑 Test Credentials (For Testing Purposes Only)

You can use the following default credentials for testing different user roles on the platform:

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Candidate** | `candidate@skillflow.com` | `Candidate@123` |
| **Employer** | `employer@skillflow.com` | `Employer@123` |
| **Admin** | `admin@skillflow.com` | `Admin@123` |

Login Credentials for All Roles
🛡️ Admin Account (Superadmin)
Role: Superadmin (Full RBAC CRUD powers across all entities)
Email: admin@skillflow.com
Password: Admin@12345
🏢 Employer & Company Accounts
TechCorp Global (Primary Seeded Company & Employer)

Company: TechCorp Global
Email: employer@techcorp.com
Password: Employer@12345
NexusTech Solutions

Company: NexusTech Solutions
Email: employer1@nexustech.com
Password: Employer@12345
Apex Systems & Cloud

Company: Apex Systems & Cloud
Email: employer2@apexsystems.com
Password: Employer@12345
CyberPulse Security

Company: CyberPulse Security
Email: employer3@cyberpulse.com
Password: Employer@12345
DataDynamics AI

Company: DataDynamics AI
Email: employer4@datadynamics.com
Password: Employer@12345
Zenith Software Global

Company: Zenith Software Global
Email: employer5@zenithglobal.com
Password: Employer@12345
👨‍🎓 Candidate Account
Name: Rahul Sharma
Email: candidate@skillflow.com
Password: Candidate@12345


*Note: You can seed these default test accounts in local development by running `npm run db:seed` inside `skillFlow-backend`.*

---

## 💻 Local Development Setup

### 1. Backend Setup
```bash
cd skillFlow-backend
npm install
npx prisma generate
npm run db:seed
npm run dev
```

### 2. Frontend Setup
```bash
cd skillFlow-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

MIT License © SkillFlow
