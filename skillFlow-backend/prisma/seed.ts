import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, VerificationStatus, JobStatus, WorkType, ApplicationStatus } from "@prisma/client";
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
  console.log("🌱 Starting complete fresh database reset & seed...");

  // 1. Clean existing data
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

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const employerPassword = await bcrypt.hash("Employer@12345", 10);
  const candidatePassword = await bcrypt.hash("Candidate@12345", 10);

  // 2. Create Admin Account
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@skillflow.com",
      fullName: "SkillFlow Superadmin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin Account Created: ${adminUser.email}`);

  // 3. Create Comprehensive Skills Catalog
  const skillList = [
    // Programming
    "Java", "JavaScript", "TypeScript", "Python", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Dart", "Scala",
    // Frontend
    "HTML", "CSS", "React", "Next.js", "Angular", "Vue.js", "Redux", "Tailwind CSS", "Bootstrap", "Material UI",
    // Backend
    "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "FastAPI", ".NET", "Laravel", "REST API", "GraphQL", "Microservices",
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server", "Elasticsearch", "Firebase",
    // Cloud / DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Ansible", "CI/CD", "Linux", "Nginx",
    // Data / AI / ML
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Science", "Data Analysis", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Generative AI", "LLM", "OpenCV",
    // Mobile
    "Android", "Android Studio", "Flutter", "React Native", "iOS",
    // Testing
    "Manual Testing", "Selenium", "Cypress", "Playwright", "Jest", "JUnit", "Postman", "API Testing", "Unit Testing", "Integration Testing",
    // Security
    "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing", "OWASP", "Cryptography", "IAM",
    // Design & Product
    "UI/UX", "Figma", "Adobe XD", "Photoshop", "Product Design", "Wireframing", "Prototyping",
    // Professional
    "Communication", "Leadership", "Problem Solving", "Teamwork", "Project Management", "Agile", "Scrum", "Critical Thinking", "Time Management"
  ];

  const skillRecords = await Promise.all(
    skillList.map((name) =>
      prisma.skill.create({ data: { name } })
    )
  );
  const skillMap = new Map(skillRecords.map((s) => [s.name, s]));
  console.log(`✅ ${skillRecords.length} Skills Created in Master Catalog.`);

  // Helper to safely get skill ID
  const getSkill = (name: string) => skillMap.get(name)?.id || skillRecords[0].id;

  // 4. Create 5 Verified Companies & Employer Accounts
  const companiesData = [
    {
      name: "NexusTech Solutions",
      email: "employer1@nexustech.com",
      industry: "Software & IT Services",
      websiteUrl: "https://nexustech.example.com",
      location: "Bangalore, India",
      companySize: "250-500",
      description: "NexusTech Solutions is an enterprise cloud and AI engineering consultancy building mission-critical software solutions.",
      logoUrl: "https://images.unsplash.com/photo-1542744094-3a317272018a?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Apex Systems & Cloud",
      email: "employer2@apexsystems.com",
      industry: "Cloud Infrastructure & DevOps",
      websiteUrl: "https://apexsystems.example.com",
      location: "Hyderabad, India",
      companySize: "500-1000",
      description: "Apex Systems delivers automated cloud architecture, Kubernetes orchestration, and continuous deployment pipelines.",
      logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "CyberPulse Security",
      email: "employer3@cyberpulse.com",
      industry: "Cybersecurity & Fintech Support",
      websiteUrl: "https://cyberpulse.example.com",
      location: "Gurgaon, India",
      companySize: "100-250",
      description: "CyberPulse Security specializes in zero-trust architecture, automated vulnerability management, and threat intelligence.",
      logoUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "DataDynamics AI",
      email: "employer4@datadynamics.com",
      industry: "Artificial Intelligence & Analytics",
      websiteUrl: "https://datadynamics.example.com",
      location: "Pune, India",
      companySize: "50-100",
      description: "DataDynamics AI pioneers generative AI models, enterprise LLMs, and real-time predictive analytics platforms.",
      logoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Zenith Software Global",
      email: "employer5@zenithglobal.com",
      industry: "Mobile Applications & Web Platforms",
      websiteUrl: "https://zenithglobal.example.com",
      location: "Noida, India",
      companySize: "1000+",
      description: "Zenith Software Global designs consumer web applications, cross-platform mobile apps, and scalable digital products.",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const createdEmployers: any[] = [];

  for (const c of companiesData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        fullName: `${c.name} Hiring Team`,
        passwordHash: employerPassword,
        role: Role.EMPLOYER,
      },
    });

    const company = await prisma.company.create({
      data: {
        name: c.name,
        industry: c.industry,
        websiteUrl: c.websiteUrl,
        location: c.location,
        companySize: c.companySize,
        description: c.description,
        logoUrl: c.logoUrl,
        verificationStatus: VerificationStatus.VERIFIED,
      },
    });

    const empProfile = await prisma.employerProfile.create({
      data: {
        userId: user.id,
        companyId: company.id,
        designation: "Technical Hiring Lead",
      },
    });

    createdEmployers.push({ user, company, empProfile });
  }

  console.log(`✅ 5 Verified Companies & Employer Accounts Created.`);

  // 5. Create 22 Production Jobs across the 5 companies
  const jobsSeed = [
    // Company 0: NexusTech Solutions
    {
      companyIdx: 0,
      title: "Senior Full Stack Developer",
      workType: WorkType.HYBRID,
      location: "Bangalore, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1200000,
      salaryMax: 2000000,
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      description: "Design and implement end-to-end full stack web applications using modern React architecture and Express/PostgreSQL services.",
    },
    {
      companyIdx: 0,
      title: "Frontend React Engineer",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 800000,
      salaryMax: 1400000,
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
      description: "Build responsive, accessible, high-performance UI components in React and Next.js for enterprise dashboards.",
    },
    {
      companyIdx: 0,
      title: "Backend Node.js Architect",
      workType: WorkType.ONSITE,
      location: "Bangalore, India",
      experienceMin: 5,
      experienceMax: 8,
      salaryMin: 1800000,
      salaryMax: 2800000,
      skills: ["Node.js", "Express.js", "TypeScript", "Microservices", "Redis"],
      description: "Lead API strategy, microservice decomposition, Redis caching layers, and database optimization.",
    },
    {
      companyIdx: 0,
      title: "Junior Full Stack Engineer",
      workType: WorkType.HYBRID,
      location: "Bangalore, India",
      experienceMin: 1,
      experienceMax: 2,
      salaryMin: 500000,
      salaryMax: 800000,
      skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
      description: "Collaborate with senior developers to ship web features, resolve bug tickets, and build RESTful API endpoints.",
    },

    // Company 1: Apex Systems & Cloud
    {
      companyIdx: 1,
      title: "Senior DevOps & Cloud Engineer",
      workType: WorkType.HYBRID,
      location: "Hyderabad, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1500000,
      salaryMax: 2400000,
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
      description: "Manage AWS multi-region infrastructure, deploy Kubernetes container clusters, and configure GitHub Actions pipelines.",
    },
    {
      companyIdx: 1,
      title: "Site Reliability Engineer (SRE)",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1300000,
      salaryMax: 2100000,
      skills: ["Linux", "Python", "Kubernetes", "Nginx", "Elasticsearch"],
      description: "Ensure system uptime, configure Prometheus/Grafana monitoring, and automate incident recovery workflows.",
    },
    {
      companyIdx: 1,
      title: "Cloud Infrastructure Architect",
      workType: WorkType.ONSITE,
      location: "Hyderabad, India",
      experienceMin: 6,
      experienceMax: 10,
      salaryMin: 2200000,
      salaryMax: 3500000,
      skills: ["AWS", "Azure", "Google Cloud", "Kubernetes", "Terraform"],
      description: "Define multi-cloud strategies, cost optimization plans, and cloud security frameworks for enterprise clients.",
    },

    // Company 2: CyberPulse Security
    {
      companyIdx: 2,
      title: "Cybersecurity Analyst",
      workType: WorkType.HYBRID,
      location: "Gurgaon, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 900000,
      salaryMax: 1600000,
      skills: ["Cybersecurity", "Network Security", "Penetration Testing", "OWASP", "Linux"],
      description: "Conduct security audits, vulnerability scans, penetration tests, and remediate OWASP Top 10 web vulnerabilities.",
    },
    {
      companyIdx: 2,
      title: "Application Security Engineer",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1400000,
      salaryMax: 2200000,
      skills: ["OWASP", "Python", "Cryptography", "IAM", "API Testing"],
      description: "Review codebase security, implement OAuth2/JWT authentication schemes, and lead threat modeling sessions.",
    },
    {
      companyIdx: 2,
      title: "QA & Automation Testing Lead",
      workType: WorkType.HYBRID,
      location: "Gurgaon, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1100000,
      salaryMax: 1800000,
      skills: ["Playwright", "Cypress", "Selenium", "Jest", "API Testing"],
      description: "Build automated E2E and API testing suites ensuring software quality and release regression stability.",
    },

    // Company 3: DataDynamics AI
    {
      companyIdx: 3,
      title: "Machine Learning Engineer",
      workType: WorkType.HYBRID,
      location: "Pune, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1600000,
      salaryMax: 2600000,
      skills: ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "Machine Learning"],
      description: "Train and deploy deep learning models, natural language processing pipelines, and computer vision systems.",
    },
    {
      companyIdx: 3,
      title: "Generative AI & LLM Specialist",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 1800000,
      salaryMax: 3000000,
      skills: ["Generative AI", "LLM", "Python", "NLP", "PyTorch"],
      description: "Fine-tune open-weight Large Language Models (LLMs), build RAG architectures, and integrate AI APIs.",
    },
    {
      companyIdx: 3,
      title: "Data Analyst & Business Intelligence Specialist",
      workType: WorkType.HYBRID,
      location: "Pune, India",
      experienceMin: 1,
      experienceMax: 3,
      salaryMin: 600000,
      salaryMax: 1000000,
      skills: ["Data Analysis", "Python", "SQL", "Pandas", "NumPy"],
      description: "Transform complex raw business data into actionable dashboards, insights, and predictive models.",
    },
    {
      companyIdx: 3,
      title: "Python Backend Developer",
      workType: WorkType.ONSITE,
      location: "Pune, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 800000,
      salaryMax: 1300000,
      skills: ["Python", "FastAPI", "Django", "PostgreSQL", "Redis"],
      description: "Develop high-throughput REST and GraphQL APIs powering real-time analytics platforms using FastAPI.",
    },

    // Company 4: Zenith Software Global
    {
      companyIdx: 4,
      title: "Senior Java Spring Boot Developer",
      workType: WorkType.ONSITE,
      location: "Noida, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1400000,
      salaryMax: 2200000,
      skills: ["Java", "Spring Boot", "Microservices", "MySQL", "REST API"],
      description: "Develop scalable backend microservices, enterprise workflow engines, and relational database schemas in Java.",
    },
    {
      companyIdx: 4,
      title: "Mobile App Developer (Flutter & React Native)",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 900000,
      salaryMax: 1500000,
      skills: ["Flutter", "React Native", "Dart", "JavaScript", "iOS"],
      description: "Build cross-platform iOS and Android mobile applications with pixel-perfect UI and native performance.",
    },
    {
      companyIdx: 4,
      title: "UI/UX Product Designer",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 700000,
      salaryMax: 1300000,
      skills: ["UI/UX", "Figma", "Wireframing", "Prototyping", "Product Design"],
      description: "Design intuitive user journeys, wireframes, high-fidelity prototypes, and design systems for enterprise software.",
    },
    {
      companyIdx: 4,
      title: "Agile Product Manager",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 4,
      experienceMax: 8,
      salaryMin: 1600000,
      salaryMax: 2500000,
      skills: ["Product Management", "Agile", "Scrum", "Leadership", "Communication"],
      description: "Lead product strategy, define sprint backlogs, prioritize roadmap features, and align engineering teams.",
    },
    {
      companyIdx: 4,
      title: "Android Native Developer",
      workType: WorkType.ONSITE,
      location: "Noida, India",
      experienceMin: 3,
      experienceMax: 5,
      salaryMin: 1000000,
      salaryMax: 1700000,
      skills: ["Android", "Kotlin", "Android Studio", "Java", "REST API"],
      description: "Build high-performance native Android applications using Jetpack Compose, Kotlin, and clean architecture.",
    },
    {
      companyIdx: 4,
      title: "Software Engineer in Test (SEIT)",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 800000,
      salaryMax: 1200000,
      skills: ["Selenium", "Jest", "TypeScript", "Postman", "Unit Testing"],
      description: "Automate test pipelines, author unit/integration test suites, and improve continuous integration quality.",
    },
    {
      companyIdx: 4,
      title: "C# .NET Enterprise Developer",
      workType: WorkType.ONSITE,
      location: "Noida, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1100000,
      salaryMax: 1800000,
      skills: ["C#", ".NET", "SQL Server", "REST API", "Microservices"],
      description: "Build high-availability business services using C# .NET Core, Entity Framework, and SQL Server.",
    },
    {
      companyIdx: 4,
      title: "Technical Support & Systems Engineer",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 1,
      experienceMax: 3,
      salaryMin: 450000,
      salaryMax: 700000,
      skills: ["Linux", "SQL", "Communication", "Problem Solving", "Time Management"],
      description: "Provide tier-2 technical support, diagnose database query performance issues, and ensure client satisfaction.",
    },
  ];

  const createdJobs: any[] = [];

  for (const jData of jobsSeed) {
    const emp = createdEmployers[jData.companyIdx];

    const job = await prisma.job.create({
      data: {
        title: jData.title,
        description: jData.description,
        location: jData.location,
        workType: jData.workType,
        jobType: "FULL_TIME",
        salaryMin: jData.salaryMin,
        salaryMax: jData.salaryMax,
        experienceMin: jData.experienceMin,
        experienceMax: jData.experienceMax,
        vacancies: 2,
        status: JobStatus.PUBLISHED,
        companyId: emp.company.id,
        createdByEmployerId: emp.empProfile.id,
      },
    });

    // Link skills
    for (const sName of jData.skills) {
      const skillId = getSkill(sName);
      await prisma.jobSkill.create({
        data: {
          jobId: job.id,
          skillId,
        },
      });
    }

    createdJobs.push(job);
  }

  console.log(`✅ ${createdJobs.length} Production Jobs Created across 5 Companies.`);

  // 6. Create 1 Complete Test Candidate
  const candUser = await prisma.user.create({
    data: {
      email: "candidate@skillflow.com",
      fullName: "Rahul Sharma",
      passwordHash: candidatePassword,
      role: Role.CANDIDATE,
    },
  });

  const candidateProfile = await prisma.candidateProfile.create({
    data: {
      userId: candUser.id,
      headline: "Senior Full Stack Engineer (React | Node.js | TypeScript)",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      summary: "Passionate Full Stack Engineer with 4+ years of experience building modern web applications, scalable REST APIs, and cloud services using React, Node.js, and TypeScript.",
      preferredWorkType: WorkType.HYBRID,
      profilePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      linkedinUrl: "https://linkedin.com/in/rahul-sharma-dev",
      githubUrl: "https://github.com/rahulsharma-dev",
      portfolioUrl: "https://rahulsharma.dev",
    },
  });

  // Candidate Education
  await prisma.education.createMany({
    data: [
      {
        candidateId: candidateProfile.id,
        institution: "Indian Institute of Technology (IIT) Bangalore",
        degree: "Bachelor of Technology (B.Tech)",
        fieldOfStudy: "Computer Science & Engineering",
        startYear: 2018,
        endYear: 2022,
        grade: "8.9 CGPA",
      },
    ],
  });

  // Candidate Experience
  await prisma.candidateExperience.createMany({
    data: [
      {
        candidateId: candidateProfile.id,
        company: "TechCorp Labs",
        title: "Full Stack Engineer",
        startDate: "2022-07-01",
        endDate: "2024-08-01",
        isCurrent: false,
        description: "Built React dashboard applications, Node.js microservices, and PostgreSQL query optimizations.",
      },
    ],
  });

  // Candidate Projects
  await prisma.candidateProject.createMany({
    data: [
      {
        candidateId: candidateProfile.id,
        name: "SkillFlow Talent Engine",
        description: "Real-time hiring platform with candidate autocomplete, job application workflow, and admin monitoring.",
        technologies: "React, Next.js, Node.js, TypeScript, PostgreSQL",
        githubUrl: "https://github.com/rahulsharma-dev/skillflow",
        liveUrl: "https://skillflow.dev",
      },
    ],
  });

  // Candidate Skills
  const candSkills = ["React", "Node.js", "TypeScript", "JavaScript", "PostgreSQL", "AWS", "Docker", "Git"];
  for (const sName of candSkills) {
    const skillId = getSkill(sName);
    await prisma.candidateSkill.create({
      data: {
        candidateId: candidateProfile.id,
        skillId,
      },
    });
  }

  console.log(`✅ Candidate Profile Created: ${candUser.email} (Rahul Sharma).`);

  // 7. Create Applications for Candidate across Jobs
  const applicationStatuses: { jobIdx: number; status: ApplicationStatus; cover: string }[] = [
    { jobIdx: 0, status: ApplicationStatus.SELECTED, cover: "I have 4 years of experience building React/Node.js products. Excited to join NexusTech!" },
    { jobIdx: 1, status: ApplicationStatus.INTERVIEW, cover: "Next.js and React are my primary frontend tools. Looking forward to discussing the role." },
    { jobIdx: 4, status: ApplicationStatus.SHORTLISTED, cover: "I have hands-on experience with Docker containerization and AWS infrastructure." },
    { jobIdx: 7, status: ApplicationStatus.APPLIED, cover: "Interested in the cybersecurity analyst opening at CyberPulse." },
    { jobIdx: 10, status: ApplicationStatus.REJECTED, cover: "Applying for the ML engineer role to apply my Python and data science skills." },
  ];

  for (const appData of applicationStatuses) {
    const targetJob = createdJobs[appData.jobIdx];
    await prisma.jobApplication.create({
      data: {
        candidateId: candidateProfile.id,
        jobId: targetJob.id,
        coverLetter: appData.cover,
        resumeUrl: candidateProfile.resumeUrl,
        status: appData.status,
        appliedAt: new Date(Date.now() - Math.random() * 86400000 * 5),
      },
    });
  }

  console.log(`✅ 5 Candidate Applications Created across jobs with realistic statuses.`);
  console.log("🎉 Database Reset & Production Seed Completed Successfully!");
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
