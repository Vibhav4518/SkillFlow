// import { Pool } from 'pg';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';
// import dotenv from 'dotenv';

// dotenv.config();

// const connectionString = process.env.DATABASE_URL;
// if (!connectionString) {
//   throw new Error('DATABASE_URL is required in environment');
// }

// const pool = new Pool({ connectionString });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// async function seed() {
//   console.log('🌱 Seeding database...');

//   const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
//   const userPassword = await bcrypt.hash('UserPassword123!', 12);

//   const admin = await prisma.user.upsert({
//     where: { email: 'admin@project0.com' },
//     update: {},
//     create: {
//       email: 'admin@project0.com',
//       fullName: 'Admin User',
//       passwordHash: adminPassword,
//       role: 'ADMIN',
//     },
//   });

//   const user = await prisma.user.upsert({
//     where: { email: 'user@project0.com' },
//     update: {},
//     create: {
//       email: 'user@project0.com',
//       fullName: 'John Doe',
//       passwordHash: userPassword,
//       role: 'USER',
//     },
//   });

//   console.log('✅ Database seeded successfully:');
//   console.log(`   - Admin: ${admin.email}`);
//   console.log(`   - User: ${user.email}`);
// }

// seed()
//   .catch((e) => {
//     console.error('❌ Seeding error:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//     await pool.end();
//   });



import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// LOAD ROOT .env
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});


// ============================================================
// DATABASE CONNECTION
// ============================================================

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is required in .env");
}

if (
  connectionString.startsWith("prisma://") ||
  connectionString.startsWith("prisma+postgres://")
) {
  throw new Error(
    "DIRECT_URL must be a direct PostgreSQL URL starting with postgresql:// or postgres://"
  );
}

console.log("🔌 Connecting using DIRECT_URL...");

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// ============================================================
// SEED
// ============================================================

async function seed() {
  console.log("🌱 Starting database seed...");

  // ==========================================================
  // PASSWORDS
  // ==========================================================

  const adminPassword = await bcrypt.hash(
    "AdminPassword123!",
    12
  );

  const userPassword = await bcrypt.hash(
    "UserPassword123!",
    12
  );

  const candidatePassword = await bcrypt.hash(
    "Candidate@123",
    12
  );

  // ==========================================================
  // ADMIN
  // ==========================================================

  await prisma.user.upsert({
    where: {
      email: "admin@skillflow.com",
    },

    update: {
      fullName: "SkillFlow Administrator",
      role: "ADMIN",
      passwordHash: adminPassword,
      updatedAt: new Date(),
    },

    create: {
      email: "admin@skillflow.com",
      fullName: "SkillFlow Administrator",
      passwordHash: adminPassword,
      role: "ADMIN",
      updatedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: {
      email: "admin@project0.com",
    },

    update: {
      fullName: "Admin User",
      role: "ADMIN",
      passwordHash: adminPassword,
      updatedAt: new Date(),
    },

    create: {
      email: "admin@project0.com",
      fullName: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // NORMAL USER
  // ==========================================================

  await prisma.user.upsert({
    where: {
      email: "user@project0.com",
    },

    update: {
      fullName: "John Doe",
      role: "CANDIDATE",
      updatedAt: new Date(),
    },

    create: {
      email: "user@project0.com",
      fullName: "John Doe",
      passwordHash: userPassword,
      role: "CANDIDATE",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // CANDIDATE 1
  // ==========================================================

  const candidate1 = await prisma.user.upsert({
    where: {
      email: "candidate1@project0.com",
    },

    update: {
      fullName: "Rahul Sharma",
      role: "CANDIDATE",
      updatedAt: new Date(),
    },

    create: {
      email: "candidate1@project0.com",
      fullName: "Rahul Sharma",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      updatedAt: new Date(),
    },
  });

  await prisma.candidateProfile.upsert({
    where: {
      userId: candidate1.id,
    },

    update: {
      headline: "Software Developer",
      summary:
        "Full-stack developer interested in building scalable web applications.",
      phone: "9876543210",
      location: "Lucknow, India",
      experienceYears: 1,
      preferredWorkType: "REMOTE",
      linkedinUrl: "https://linkedin.com/in/rahul-sharma",
      githubUrl: "https://github.com/rahul-sharma",
      portfolioUrl: "https://rahul.dev",
      updatedAt: new Date(),
    },

    create: {
      userId: candidate1.id,
      headline: "Software Developer",
      summary:
        "Full-stack developer interested in building scalable web applications.",
      phone: "9876543210",
      location: "Lucknow, India",
      experienceYears: 1,
      preferredWorkType: "REMOTE",
      linkedinUrl: "https://linkedin.com/in/rahul-sharma",
      githubUrl: "https://github.com/rahul-sharma",
      portfolioUrl: "https://rahul.dev",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // CANDIDATE 2
  // ==========================================================

  const candidate2 = await prisma.user.upsert({
    where: {
      email: "candidate2@project0.com",
    },

    update: {
      fullName: "Priya Singh",
      role: "CANDIDATE",
      updatedAt: new Date(),
    },

    create: {
      email: "candidate2@project0.com",
      fullName: "Priya Singh",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      updatedAt: new Date(),
    },
  });

  await prisma.candidateProfile.upsert({
    where: {
      userId: candidate2.id,
    },

    update: {
      headline: "Frontend Developer",
      summary:
        "Frontend developer focused on React, TypeScript, and modern UI development.",
      phone: "9876543211",
      location: "Kanpur, India",
      experienceYears: 1,
      preferredWorkType: "HYBRID",
      linkedinUrl: "https://linkedin.com/in/priya-singh",
      githubUrl: "https://github.com/priya-singh",
      portfolioUrl: "https://priya.dev",
      updatedAt: new Date(),
    },

    create: {
      userId: candidate2.id,
      headline: "Frontend Developer",
      summary:
        "Frontend developer focused on React, TypeScript, and modern UI development.",
      phone: "9876543211",
      location: "Kanpur, India",
      experienceYears: 1,
      preferredWorkType: "HYBRID",
      linkedinUrl: "https://linkedin.com/in/priya-singh",
      githubUrl: "https://github.com/priya-singh",
      portfolioUrl: "https://priya.dev",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // CANDIDATE 3
  // ==========================================================

  const candidate3 = await prisma.user.upsert({
    where: {
      email: "candidate3@project0.com",
    },

    update: {
      fullName: "Amit Verma",
      role: "CANDIDATE",
      updatedAt: new Date(),
    },

    create: {
      email: "candidate3@project0.com",
      fullName: "Amit Verma",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      updatedAt: new Date(),
    },
  });

  await prisma.candidateProfile.upsert({
    where: {
      userId: candidate3.id,
    },

    update: {
      headline: "Backend Developer",
      summary:
        "Backend developer interested in Node.js, Express, PostgreSQL, and API development.",
      phone: "9876543212",
      location: "Noida, India",
      experienceYears: 2,
      preferredWorkType: "ONSITE",
      linkedinUrl: "https://linkedin.com/in/amit-verma",
      githubUrl: "https://github.com/amit-verma",
      portfolioUrl: "https://amit.dev",
      updatedAt: new Date(),
    },

    create: {
      userId: candidate3.id,
      headline: "Backend Developer",
      summary:
        "Backend developer interested in Node.js, Express, PostgreSQL, and API development.",
      phone: "9876543212",
      location: "Noida, India",
      experienceYears: 2,
      preferredWorkType: "ONSITE",
      linkedinUrl: "https://linkedin.com/in/amit-verma",
      githubUrl: "https://github.com/amit-verma",
      portfolioUrl: "https://amit.dev",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // CANDIDATE 4
  // ==========================================================

  const candidate4 = await prisma.user.upsert({
    where: {
      email: "candidate4@project0.com",
    },

    update: {
      fullName: "Neha Gupta",
      role: "CANDIDATE",
      updatedAt: new Date(),
    },

    create: {
      email: "candidate4@project0.com",
      fullName: "Neha Gupta",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      updatedAt: new Date(),
    },
  });

  await prisma.candidateProfile.upsert({
    where: {
      userId: candidate4.id,
    },

    update: {
      headline: "React Developer",
      summary:
        "React developer experienced in building responsive and maintainable frontend applications.",
      phone: "9876543213",
      location: "Delhi, India",
      experienceYears: 2,
      preferredWorkType: "REMOTE",
      linkedinUrl: "https://linkedin.com/in/neha-gupta",
      githubUrl: "https://github.com/neha-gupta",
      portfolioUrl: "https://neha.dev",
      updatedAt: new Date(),
    },

    create: {
      userId: candidate4.id,
      headline: "React Developer",
      summary:
        "React developer experienced in building responsive and maintainable frontend applications.",
      phone: "9876543213",
      location: "Delhi, India",
      experienceYears: 2,
      preferredWorkType: "REMOTE",
      linkedinUrl: "https://linkedin.com/in/neha-gupta",
      githubUrl: "https://github.com/neha-gupta",
      portfolioUrl: "https://neha.dev",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // CANDIDATE 5
  // ==========================================================

  const candidate5 = await prisma.user.upsert({
    where: {
      email: "candidate5@project0.com",
    },

    update: {
      fullName: "Vikas Yadav",
      role: "CANDIDATE",
      updatedAt: new Date(),
    },

    create: {
      email: "candidate5@project0.com",
      fullName: "Vikas Yadav",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      updatedAt: new Date(),
    },
  });

  await prisma.candidateProfile.upsert({
    where: {
      userId: candidate5.id,
    },

    update: {
      headline: "Full Stack Developer",
      summary:
        "Full-stack developer working with React, Node.js, Express, PostgreSQL, and REST APIs.",
      phone: "9876543214",
      location: "Gurugram, India",
      experienceYears: 3,
      preferredWorkType: "HYBRID",
      linkedinUrl: "https://linkedin.com/in/vikas-yadav",
      githubUrl: "https://github.com/vikas-yadav",
      portfolioUrl: "https://vikas.dev",
      updatedAt: new Date(),
    },

    create: {
      userId: candidate5.id,
      headline: "Full Stack Developer",
      summary:
        "Full-stack developer working with React, Node.js, Express, PostgreSQL, and REST APIs.",
      phone: "9876543214",
      location: "Gurugram, India",
      experienceYears: 3,
      preferredWorkType: "HYBRID",
      linkedinUrl: "https://linkedin.com/in/vikas-yadav",
      githubUrl: "https://github.com/vikas-yadav",
      portfolioUrl: "https://vikas.dev",
      updatedAt: new Date(),
    },
  });

  // ==========================================================
  // RESULTS
  // ==========================================================

  console.log("");
  console.log("✅ Database seeded successfully!");
  // console.log("");
  // console.log("👤 Users:");
  // console.log(`   Admin      : ${admin.email}`);
  // console.log(`   User       : ${user.email}`);
  // console.log(`   Candidate 1: ${candidate1.email}`);
  // console.log(`   Candidate 2: ${candidate2.email}`);
  // console.log(`   Candidate 3: ${candidate3.email}`);
  // console.log(`   Candidate 4: ${candidate4.email}`);
  // console.log(`   Candidate 5: ${candidate5.email}`);

   
  

  // ============================================================
// JOB DATA
// ============================================================

// Create a company
const company = await prisma.company.upsert({
  where: {
    id: "company-tech-solutions",
  },
  update: {},
  create: {
    id: "company-tech-solutions",
    name: "Tech Solutions Pvt Ltd",
    websiteUrl: "https://techsolutions.example.com",
    logoUrl: "https://placehold.co/200x200",
    description:
      "A technology company building modern web and software solutions.",
    location: "Lucknow, India",
    companySize: "51-200",
    verificationStatus: "VERIFIED",
  },
});

// Create job category
const category = await prisma.jobCategory.upsert({
  where: {
    name: "Software Development",
  },
  update: {},
  create: {
    name: "Software Development",
  },
});

// Create skills
const skillNames = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "PostgreSQL",
];

const skills = [];

for (const name of skillNames) {
  const skill = await prisma.skill.upsert({
    where: {
      name,
    },
    update: {},
    create: {
      name,
    },
  });

  skills.push(skill);
}

// ============================================================
// EMPLOYER
// ============================================================

const employer = await prisma.user.upsert({
  where: {
    email: "employer@project0.com",
  },
  update: {
    fullName: "Tech Solutions Employer",
    role: "EMPLOYER",
  },
  create: {
    email: "employer@project0.com",
    fullName: "Tech Solutions Employer",
    passwordHash: candidatePassword,
    role: "EMPLOYER",
    updatedAt: new Date(),
  },
});

const employerProfile = await prisma.employerProfile.upsert({
  where: {
    userId: employer.id,
  },
  update: {
    companyId: company.id,
    designation: "Hiring Manager",
    department: "Engineering",
    phone: "9876543210",
  },
  create: {
    userId: employer.id,
    companyId: company.id,
    designation: "Hiring Manager",
    department: "Engineering",
    phone: "9876543210",
  },
});

// ============================================================
// JOBS
// ============================================================

const jobs = [
  {
    title: "Junior React Developer",
    description:
      "We are looking for a Junior React Developer to build modern and responsive web applications.",
    location: "Lucknow, India",
    workType: "HYBRID" as const,
    jobType: "FULL_TIME" as const,
    salaryMin: 400000,
    salaryMax: 700000,
    experienceMin: 0,
    experienceMax: 2,
    vacancies: 2,
  },

  {
    title: "Node.js Backend Developer",
    description:
      "Looking for a backend developer experienced with Node.js, Express and PostgreSQL.",
    location: "Noida, India",
    workType: "REMOTE" as const,
    jobType: "FULL_TIME" as const,
    salaryMin: 600000,
    salaryMax: 1000000,
    experienceMin: 1,
    experienceMax: 3,
    vacancies: 3,
  },

  {
    title: "Full Stack MERN Developer",
    description:
      "Join our engineering team as a Full Stack MERN Developer and work on scalable applications.",
    location: "Bangalore, India",
    workType: "HYBRID" as const,
    jobType: "FULL_TIME" as const,
    salaryMin: 700000,
    salaryMax: 1200000,
    experienceMin: 1,
    experienceMax: 4,
    vacancies: 2,
  },

  {
    title: "Frontend Developer Intern",
    description:
      "Paid internship opportunity for candidates interested in React and modern frontend development.",
    location: "Remote",
    workType: "REMOTE" as const,
    jobType: "INTERNSHIP" as const,
    salaryMin: 150000,
    salaryMax: 250000,
    experienceMin: 0,
    experienceMax: 1,
    vacancies: 5,
  },

  {
    title: "TypeScript Developer",
    description:
      "We are hiring a TypeScript developer to work on production-grade web applications and APIs.",
    location: "Delhi, India",
    workType: "ONSITE" as const,
    jobType: "FULL_TIME" as const,
    salaryMin: 800000,
    salaryMax: 1400000,
    experienceMin: 2,
    experienceMax: 5,
    vacancies: 2,
  },
];

for (const jobData of jobs) {
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      createdByEmployerId: employerProfile.id,
      categoryId: category.id,

      title: jobData.title,
      description: jobData.description,
      location: jobData.location,

      workType: jobData.workType,
      jobType: jobData.jobType,

      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
      isSalaryVisible: true,

      experienceMin: jobData.experienceMin,
      experienceMax: jobData.experienceMax,

      vacancies: jobData.vacancies,

      status: "PUBLISHED",
      publishedAt: new Date(),

      isPromoted: false,
    },
  });

  // Add skills to each job
  for (const skill of skills) {
    await prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: skill.id,
      },
    });
  }

  console.log(`   ✓ Job created: ${job.title}`);
}

}



// ============================================================
// RUN SEED
// ============================================================

seed()
  .catch((error) => {
    console.error("");
    console.error("❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

