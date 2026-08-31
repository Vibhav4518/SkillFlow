import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, VerificationStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL / DIRECT_URL is required in .env");
}

console.log("🔌 Connecting to PostgreSQL database...");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Resetting database and seeding EXACTLY: 1 Admin, 1 Company, 1 Employer, 1 Candidate...");

  // 1. Clean existing data in reverse relation order
  try { await prisma.jobApplication.deleteMany({}); } catch {}
  try { await prisma.bookmark.deleteMany({}); } catch {}
  try { await prisma.jobSkill.deleteMany({}); } catch {}
  try { await prisma.job.deleteMany({}); } catch {}
  try { await prisma.candidateSkill.deleteMany({}); } catch {}
  try { await prisma.education.deleteMany({}); } catch {}
  try { await prisma.candidateExperience.deleteMany({}); } catch {}
  try { await prisma.candidateProject.deleteMany({}); } catch {}
  try { await prisma.candidateCertification.deleteMany({}); } catch {}
  try { await prisma.candidateLanguage.deleteMany({}); } catch {}
  try { await prisma.employerProfile.deleteMany({}); } catch {}
  try { await prisma.company.deleteMany({}); } catch {}
  try { await prisma.candidateProfile.deleteMany({}); } catch {}
  try { await prisma.notification.deleteMany({}); } catch {}
  try { await prisma.contactMessage.deleteMany({}); } catch {}
  try { await prisma.auditLog.deleteMany({}); } catch {}
  try { await prisma.user.deleteMany({}); } catch {}
  try { await prisma.skill.deleteMany({}); } catch {}

  console.log("🧹 Database wiped completely clean.");

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const employerPassword = await bcrypt.hash("Employer@12345", 10);
  const candidatePassword = await bcrypt.hash("Candidate@12345", 10);

  // 2. Create 1 Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@skillflow.com",
      fullName: "SkillFlow Superadmin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Seeded 1 Admin: ${adminUser.email} (Password: Admin@12345)`);

  // 3. Create 1 Company
  const company = await prisma.company.create({
    data: {
      name: "TechCorp Global",
      industry: "Software & Cloud Services",
      websiteUrl: "https://techcorp.example.com",
      location: "Bangalore, India",
      companySize: "100-250",
      description: "TechCorp Global is an enterprise cloud software solutions provider.",
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  console.log(`✅ Seeded 1 Company: ${company.name}`);

  // 4. Create 1 Employer
  const employerUser = await prisma.user.create({
    data: {
      email: "employer@techcorp.com",
      fullName: "TechCorp Hiring Manager",
      passwordHash: employerPassword,
      role: Role.EMPLOYER,
    },
  });

  const employerProfile = await prisma.employerProfile.create({
    data: {
      userId: employerUser.id,
      companyId: company.id,
      designation: "Lead Technical Recruiter",
    },
  });
  console.log(`✅ Seeded 1 Employer: ${employerUser.email} (Password: Employer@12345)`);

  // 5. Create 1 Candidate
  const candidateUser = await prisma.user.create({
    data: {
      email: "candidate@skillflow.com",
      fullName: "Rahul Sharma",
      passwordHash: candidatePassword,
      role: Role.CANDIDATE,
    },
  });

  const candidateProfile = await prisma.candidateProfile.create({
    data: {
      userId: candidateUser.id,
      headline: "Full Stack Software Engineer",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      summary: "Passionate Full Stack Engineer with experience building modern web applications and APIs.",
    },
  });
  console.log(`✅ Seeded 1 Candidate: ${candidateUser.email} (Password: Candidate@12345)`);

  console.log("🎉 Seeding complete! ZERO skills and ZERO jobs were pre-seeded. All skills, jobs, companies, and applications can now be inserted via Browser GUI / Admin Dashboard / APIs.");
}

seed()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
