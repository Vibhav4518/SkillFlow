import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
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
  console.log("🌱 Resetting database and seeding ONLY Admin Account...");

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

  console.log("🧹 Database wiped clean.");

  // Password hash for admin
  const adminPassword = await bcrypt.hash("Admin@12345", 10);

  // 2. Seed ONLY Superadmin Account
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@skillflow.com",
      fullName: "SkillFlow Superadmin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin Account Seeded: ${adminUser.email} (Password: Admin@12345)`);

  // 3. Seed Master Skills Catalog for Autocomplete
  const masterSkills = [
    "Java", "JavaScript", "TypeScript", "Python", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Dart", "Scala",
    "HTML", "CSS", "React", "Next.js", "Angular", "Vue.js", "Redux", "Tailwind CSS", "Bootstrap", "Material UI",
    "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "FastAPI", ".NET", "Laravel", "REST API", "GraphQL", "Microservices",
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server", "Elasticsearch", "Firebase",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Ansible", "CI/CD", "Linux", "Nginx",
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Science", "Data Analysis", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Generative AI", "LLM", "OpenCV",
    "Android", "Android Studio", "Flutter", "React Native", "iOS",
    "Manual Testing", "Selenium", "Cypress", "Playwright", "Jest", "JUnit", "Postman", "API Testing", "Unit Testing", "Integration Testing",
    "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing", "OWASP", "Cryptography", "IAM",
    "UI/UX", "Figma", "Adobe XD", "Photoshop", "Product Design", "Wireframing", "Prototyping",
    "Communication", "Leadership", "Problem Solving", "Teamwork", "Project Management", "Agile", "Scrum", "Critical Thinking", "Time Management"
  ];

  await Promise.all(
    masterSkills.map((name) =>
      prisma.skill.create({ data: { name } })
    )
  );
  console.log(`✅ ${masterSkills.length} Master Skills Seeded for Autocomplete.`);

  console.log("🎉 Seeding complete. All other users, companies, jobs, and candidate profiles will be created organically through the site/APIs.");
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
