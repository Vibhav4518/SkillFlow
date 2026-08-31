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

### Backend (`skillFlow-backend/.env` & `.env`)
```env
PORT=4000
NODE_ENV=development

# PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/skillflow_db?sslmode=require"
DIRECT_URL="postgresql://user:password@localhost:5432/skillflow_db?sslmode=require"

JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (`skillFlow-frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

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
