import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, VerificationStatus, JobStatus, WorkType } from "@prisma/client";
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

console.log("🔌 Connecting to PostgreSQL database for API Insertion script...");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function insertData() {
  console.log("🚀 Starting Insertion of Master Skills, 5 Verified Companies, 5 Employers, and 25 Jobs...");

  // Password for generated accounts
  const employerPassword = await bcrypt.hash("Employer@12345", 10);

  // 1. Insert Master Skills Catalog (100+ Skills)
  const skillNames = [
    // Programming Languages
    "Java", "JavaScript", "TypeScript", "Python", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Dart", "Scala",
    // Frontend
    "HTML", "CSS", "React", "Next.js", "Angular", "Vue.js", "Redux", "Tailwind CSS", "Bootstrap", "Material UI", "Sass", "WebAssembly",
    // Backend
    "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "FastAPI", ".NET", "Laravel", "REST API", "GraphQL", "Microservices", "gRPC",
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server", "Elasticsearch", "Firebase", "Cassandra", "DynamoDB",
    // Cloud & DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Terraform", "Ansible", "CI/CD", "Linux", "Nginx", "Helm", "Prometheus", "Grafana",
    // Data, AI & Machine Learning
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Science", "Data Analysis", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Generative AI", "LLM", "OpenCV", "Spark",
    // Mobile Development
    "Android", "Android Studio", "Flutter", "React Native", "iOS", "Xcode",
    // Testing & QA
    "Manual Testing", "Selenium", "Cypress", "Playwright", "Jest", "JUnit", "Postman", "API Testing", "Unit Testing", "Integration Testing",
    // Security
    "Cybersecurity", "Network Security", "Ethical Hacking", "Penetration Testing", "OWASP", "Cryptography", "IAM", "Zero Trust",
    // Design & Product Management
    "UI/UX", "Figma", "Adobe XD", "Photoshop", "Product Design", "Wireframing", "Prototyping", "Product Management",
    // Professional & Agile
    "Communication", "Leadership", "Problem Solving", "Teamwork", "Project Management", "Agile", "Scrum", "Critical Thinking", "Time Management"
  ];

  const skillRecords: any[] = [];
  for (const sName of skillNames) {
    const s = await prisma.skill.upsert({
      where: { name: sName },
      update: {},
      create: { name: sName },
    });
    skillRecords.push(s);
  }
  const skillMap = new Map(skillRecords.map((s) => [s.name.toLowerCase(), s.id]));
  console.log(`✅ ${skillRecords.length} Master Skills inserted into database.`);

  const getSkillId = (name: string) => {
    return skillMap.get(name.toLowerCase()) || skillRecords[0].id;
  };

  // 2. Insert 5 Verified Companies & Employer Accounts
  const companiesData = [
    {
      name: "NexusTech Solutions",
      email: "employer1@nexustech.com",
      industry: "Software & Cloud Engineering",
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
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: c.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: c.email,
          fullName: `${c.name} Hiring Lead`,
          passwordHash: employerPassword,
          role: Role.EMPLOYER,
        },
      });
    }

    let company = await prisma.company.findFirst({ where: { name: c.name } });
    if (!company) {
      company = await prisma.company.create({
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
    }

    let empProfile = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
    if (!empProfile) {
      empProfile = await prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyId: company.id,
          designation: "Technical Hiring Lead",
        },
      });
    }

    createdEmployers.push({ user, company, empProfile });
  }

  console.log(`✅ 5 Verified Companies & Employer Accounts inserted/configured.`);

  // 3. Insert 25 Realistic Jobs distributed across the 5 companies
  const jobsData = [
    // Company 0: NexusTech Solutions (5 Jobs)
    {
      companyIdx: 0,
      title: "Senior Full Stack Developer (React & Node.js)",
      workType: WorkType.HYBRID,
      location: "Bangalore, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1400000,
      salaryMax: 2200000,
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      description: "Architect and implement full stack web applications using modern React architecture and Express/PostgreSQL backend services.",
    },
    {
      companyIdx: 0,
      title: "Frontend Next.js Developer",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 900000,
      salaryMax: 1500000,
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
      description: "Build accessible, responsive, high-performance UI components in React and Next.js for high-volume enterprise SaaS dashboards.",
    },
    {
      companyIdx: 0,
      title: "Backend Microservices Architect",
      workType: WorkType.ONSITE,
      location: "Bangalore, India",
      experienceMin: 5,
      experienceMax: 8,
      salaryMin: 2000000,
      salaryMax: 3000000,
      skills: ["Node.js", "Express.js", "TypeScript", "Microservices", "Redis"],
      description: "Lead backend architecture, API gateways, database performance tuning, and Redis caching infrastructure.",
    },
    {
      companyIdx: 0,
      title: "Cloud Solutions Engineer",
      workType: WorkType.HYBRID,
      location: "Bangalore, India",
      experienceMin: 3,
      experienceMax: 5,
      salaryMin: 1200000,
      salaryMax: 1800000,
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
      description: "Configure containerized AWS deployment pipelines, monitor cluster health, and automate operational workflows.",
    },
    {
      companyIdx: 0,
      title: "Junior Web Developer",
      workType: WorkType.HYBRID,
      location: "Bangalore, India",
      experienceMin: 1,
      experienceMax: 2,
      salaryMin: 500000,
      salaryMax: 800000,
      skills: ["JavaScript", "HTML", "CSS", "React", "Git"],
      description: "Assist senior software engineers in writing clean code, building reusable components, and fixing customer bug reports.",
    },

    // Company 1: Apex Systems & Cloud (5 Jobs)
    {
      companyIdx: 1,
      title: "Senior DevOps Engineer",
      workType: WorkType.HYBRID,
      location: "Hyderabad, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1600000,
      salaryMax: 2500000,
      skills: ["AWS", "Kubernetes", "Terraform", "Docker", "GitHub Actions"],
      description: "Architect multi-region AWS cloud infrastructure, manage Kubernetes clusters, and write Infrastructure-as-Code Terraform scripts.",
    },
    {
      companyIdx: 1,
      title: "Site Reliability Engineer (SRE)",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1400000,
      salaryMax: 2200000,
      skills: ["Linux", "Python", "Kubernetes", "Nginx", "Elasticsearch"],
      description: "Ensure platform availability, configure Prometheus/Grafana alerts, and automate zero-downtime application deployments.",
    },
    {
      companyIdx: 1,
      title: "Cloud Security Specialist",
      workType: WorkType.ONSITE,
      location: "Hyderabad, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1500000,
      salaryMax: 2400000,
      skills: ["AWS", "Azure", "Cybersecurity", "IAM", "Network Security"],
      description: "Implement zero-trust security controls, audit cloud IAM policies, and enforce compliance across cloud accounts.",
    },
    {
      companyIdx: 1,
      title: "Kubernetes & Infrastructure Specialist",
      workType: WorkType.HYBRID,
      location: "Hyderabad, India",
      experienceMin: 3,
      experienceMax: 5,
      salaryMin: 1300000,
      salaryMax: 2000000,
      skills: ["Kubernetes", "Docker", "Ansible", "Linux", "CI/CD"],
      description: "Maintain microservice container workloads, optimize pod auto-scaling, and manage ingress networks.",
    },
    {
      companyIdx: 1,
      title: "Systems Administrator",
      workType: WorkType.ONSITE,
      location: "Hyderabad, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 700000,
      salaryMax: 1100000,
      skills: ["Linux", "Nginx", "Network Security", "Bash", "Troubleshooting"],
      description: "Manage internal Linux servers, configure domain routing, and troubleshoot operational network hardware.",
    },

    // Company 2: CyberPulse Security (5 Jobs)
    {
      companyIdx: 2,
      title: "Senior Penetration Tester & Ethical Hacker",
      workType: WorkType.HYBRID,
      location: "Gurgaon, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1600000,
      salaryMax: 2600000,
      skills: ["Ethical Hacking", "Penetration Testing", "OWASP", "Linux", "Cybersecurity"],
      description: "Execute offensive security testing, ethical hacking operations, web application penetration tests, and vulnerability reports.",
    },
    {
      companyIdx: 2,
      title: "Application Security Engineer",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1500000,
      salaryMax: 2300000,
      skills: ["OWASP", "Python", "Cryptography", "IAM", "API Testing"],
      description: "Perform static code reviews, audit OAuth2/JWT security implementations, and lead threat modeling for financial clients.",
    },
    {
      companyIdx: 2,
      title: "QA Automation Test Lead",
      workType: WorkType.HYBRID,
      location: "Gurgaon, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1200000,
      salaryMax: 1900000,
      skills: ["Playwright", "Cypress", "Selenium", "Jest", "API Testing"],
      description: "Design automated web and API regression test frameworks ensuring zero defect releases in mission-critical applications.",
    },
    {
      companyIdx: 2,
      title: "SOC Security Analyst",
      workType: WorkType.ONSITE,
      location: "Gurgaon, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 800000,
      salaryMax: 1300000,
      skills: ["Cybersecurity", "Network Security", "Linux", "Troubleshooting", "Communication"],
      description: "Monitor security operations center (SOC) event logs, investigate intrusion alerts, and neutralize threat vectors.",
    },
    {
      companyIdx: 2,
      title: "API Security Tester",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 2,
      experienceMax: 4,
      salaryMin: 900000,
      salaryMax: 1400000,
      skills: ["Postman", "API Testing", "OWASP", "REST API", "Python"],
      description: "Validate REST and GraphQL API security posture, enforce rate limits, and test authentication payload boundaries.",
    },

    // Company 3: DataDynamics AI (5 Jobs)
    {
      companyIdx: 3,
      title: "Senior Machine Learning Engineer",
      workType: WorkType.HYBRID,
      location: "Pune, India",
      experienceMin: 4,
      experienceMax: 7,
      salaryMin: 1800000,
      salaryMax: 2800000,
      skills: ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "Machine Learning"],
      description: "Design, train, and deploy deep learning neural networks, computer vision algorithms, and predictive ML models.",
    },
    {
      companyIdx: 3,
      title: "Generative AI & LLM Engineer",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 2000000,
      salaryMax: 3200000,
      skills: ["Generative AI", "LLM", "Python", "NLP", "PyTorch"],
      description: "Build Retrieval-Augmented Generation (RAG) applications, fine-tune open-source Large Language Models, and integrate vector databases.",
    },
    {
      companyIdx: 3,
      title: "Data Engineer (Spark & PostgreSQL)",
      workType: WorkType.ONSITE,
      location: "Pune, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1300000,
      salaryMax: 2100000,
      skills: ["Python", "PostgreSQL", "SQL", "Pandas", "Data Analysis"],
      description: "Develop automated ETL pipelines, data warehouses, and real-time streaming analytics pipelines.",
    },
    {
      companyIdx: 3,
      title: "FastAPI Python Backend Developer",
      workType: WorkType.HYBRID,
      location: "Pune, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 1000000,
      salaryMax: 1600000,
      skills: ["Python", "FastAPI", "Django", "PostgreSQL", "Redis"],
      description: "Build high-speed asynchronous REST microservices using Python FastAPI powering AI model inference servers.",
    },
    {
      companyIdx: 3,
      title: "Data Analyst & Dashboard Specialist",
      workType: WorkType.HYBRID,
      location: "Pune, India",
      experienceMin: 1,
      experienceMax: 3,
      salaryMin: 600000,
      salaryMax: 1000000,
      skills: ["Data Analysis", "Python", "SQL", "Pandas", "NumPy"],
      description: "Clean complex datasets, perform exploratory data analysis, and build executive intelligence reporting dashboards.",
    },

    // Company 4: Zenith Software Global (5 Jobs)
    {
      companyIdx: 4,
      title: "Senior Java Spring Boot Architect",
      workType: WorkType.ONSITE,
      location: "Noida, India",
      experienceMin: 5,
      experienceMax: 8,
      salaryMin: 1600000,
      salaryMax: 2500000,
      skills: ["Java", "Spring Boot", "Microservices", "MySQL", "REST API"],
      description: "Lead enterprise Java microservice engineering, design scalable database schemas, and enforce architectural patterns.",
    },
    {
      companyIdx: 4,
      title: "Flutter Mobile App Developer",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 1000000,
      salaryMax: 1600000,
      skills: ["Flutter", "Dart", "Android", "iOS", "REST API"],
      description: "Develop cross-platform iOS and Android consumer mobile applications using Flutter with clean architecture.",
    },
    {
      companyIdx: 4,
      title: "React Native Senior Engineer",
      workType: WorkType.REMOTE,
      location: "Remote, India",
      experienceMin: 3,
      experienceMax: 6,
      salaryMin: 1200000,
      salaryMax: 1900000,
      skills: ["React Native", "JavaScript", "TypeScript", "Redux", "iOS"],
      description: "Build high-performance React Native mobile products with native bridges, push notifications, and offline sync.",
    },
    {
      companyIdx: 4,
      title: "UI/UX Product Designer",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 800000,
      salaryMax: 1400000,
      skills: ["UI/UX", "Figma", "Wireframing", "Prototyping", "Product Design"],
      description: "Create pixel-perfect component design systems, conduct user research, and produce interactive Figma prototypes.",
    },
    {
      companyIdx: 4,
      title: "Agile Product Manager",
      workType: WorkType.HYBRID,
      location: "Noida, India",
      experienceMin: 4,
      experienceMax: 8,
      salaryMin: 1800000,
      salaryMax: 2700000,
      skills: ["Product Management", "Agile", "Scrum", "Leadership", "Communication"],
      description: "Define product roadmap strategies, prioritize sprint backlogs, analyze metrics, and lead engineering teams to delivery.",
    },
  ];

  let insertedCount = 0;
  for (const jData of jobsData) {
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

    const uniqueSkills = Array.from(new Set(jData.skills));
    for (const sName of uniqueSkills) {
      const sId = getSkillId(sName);
      try {
        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: sId,
          },
        });
      } catch {}
    }

    insertedCount++;
  }

  console.log(`🎉 API/Service Insertion Complete: ${insertedCount} Jobs, 5 Companies, 5 Employers, and ${skillRecords.length} Skills inserted into live database!`);
}

insertData()
  .catch((e) => {
    console.error("❌ Insertion Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
