import { db } from "@workspace/db";
import {
  usersTable,
  studentProfilesTable,
  employerProfilesTable,
  jobsTable,
  applicationsTable,
  microInternshipsTable,
  notificationsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const studentHash = await bcrypt.hash("password123", 12);
  const employerHash = await bcrypt.hash("password123", 12);
  const adminHash = await bcrypt.hash("admin123", 12);

  // Users
  const [student1] = await db.insert(usersTable).values({
    email: "maria@student.ie",
    passwordHash: studentHash,
    name: "Maria Gonzalez",
    role: "STUDENT",
    emailVerified: true,
  }).onConflictDoNothing().returning();

  const [student2] = await db.insert(usersTable).values({
    email: "lei@student.ie",
    passwordHash: studentHash,
    name: "Lei Zhang",
    role: "STUDENT",
    emailVerified: true,
  }).onConflictDoNothing().returning();

  const [employer1] = await db.insert(usersTable).values({
    email: "jobs@techcork.ie",
    passwordHash: employerHash,
    name: "TechCork HR",
    role: "EMPLOYER",
    emailVerified: true,
  }).onConflictDoNothing().returning();

  const [employer2] = await db.insert(usersTable).values({
    email: "hiring@dublinbakery.ie",
    passwordHash: employerHash,
    name: "Dublin Bakery Manager",
    role: "EMPLOYER",
    emailVerified: true,
  }).onConflictDoNothing().returning();

  const [employer3] = await db.insert(usersTable).values({
    email: "jobs@startuplimerick.ie",
    passwordHash: employerHash,
    name: "StartupLimerick Team",
    role: "EMPLOYER",
    emailVerified: true,
  }).onConflictDoNothing().returning();

  const [admin] = await db.insert(usersTable).values({
    email: "admin@visavantage.ie",
    passwordHash: adminHash,
    name: "VisaVantage Admin",
    role: "ADMIN",
    emailVerified: true,
  }).onConflictDoNothing().returning();

  console.log("✅ Users created");

  // Student profiles
  if (student1) {
    await db.insert(studentProfilesTable).values({
      userId: student1.id,
      university: "University College Cork",
      course: "MSc Computer Science",
      graduationYear: 2026,
      visaType: "STAMP_2",
      visaExpiryDate: "2026-10-15",
      skills: ["JavaScript", "React", "Python", "SQL"],
      bio: "Passionate software developer with experience in full-stack development.",
      isVerified: true,
    }).onConflictDoNothing();
  }

  if (student2) {
    await db.insert(studentProfilesTable).values({
      userId: student2.id,
      university: "Dublin City University",
      course: "BSc Business Analytics",
      graduationYear: 2025,
      visaType: "STAMP_1G",
      visaExpiryDate: "2025-12-31",
      skills: ["Excel", "Power BI", "SQL", "Python", "Data Analysis"],
      bio: "Data-driven analyst looking for part-time opportunities in Ireland.",
      isVerified: true,
    }).onConflictDoNothing();
  }

  // Employer profiles
  if (employer1) {
    await db.insert(employerProfilesTable).values({
      userId: employer1.id,
      companyName: "TechCork Ltd",
      companyRegistration: "IE123456",
      website: "https://techcork.ie",
      sector: "Technology",
      employeeCount: "11-50",
      isVerified: true,
      trustScore: 92,
      description: "Cork-based software company specialising in SaaS solutions for Irish SMEs.",
    }).onConflictDoNothing();
  }

  if (employer2) {
    await db.insert(employerProfilesTable).values({
      userId: employer2.id,
      companyName: "The Dublin Bakery",
      companyRegistration: "IE654321",
      website: "https://dublinbakery.ie",
      sector: "Food & Hospitality",
      employeeCount: "1-10",
      isVerified: true,
      trustScore: 87,
      description: "Award-winning artisan bakery in the heart of Dublin city.",
    }).onConflictDoNothing();
  }

  if (employer3) {
    await db.insert(employerProfilesTable).values({
      userId: employer3.id,
      companyName: "StartupLimerick",
      companyRegistration: "IE789012",
      website: "https://startuplimerick.ie",
      sector: "Marketing",
      employeeCount: "1-10",
      isVerified: false,
      trustScore: 78,
      description: "A young, vibrant startup helping local businesses grow online.",
    }).onConflictDoNothing();
  }

  console.log("✅ Profiles created");

  // Jobs
  const jobs: { id: number }[] = [];
  if (employer1) {
    const [j1] = await db.insert(jobsTable).values({
      employerId: employer1.id,
      title: "Junior Frontend Developer (Part-Time)",
      description: "We're looking for a skilled junior developer to join our team part-time. You'll work on building React components and improving our UI. Perfect for international students looking for hands-on experience.\n\nResponsibilities:\n- Build and maintain React components\n- Collaborate with senior devs\n- Write clean, tested code\n\nRequirements:\n- React & JavaScript proficiency\n- Knowledge of TypeScript preferred\n- Available 16-20 hours/week",
      category: "Technology",
      jobType: "PART_TIME",
      visaEligible: ["STAMP_2", "STAMP_1G", "GRADUATE_VISA"],
      hoursPerWeek: 20,
      payRate: 18,
      payPeriod: "HOURLY",
      location: "Cork, Ireland",
      isRemote: false,
      isFeatured: true,
      status: "ACTIVE",
    }).returning();
    if (j1) jobs.push(j1);

    const [j2] = await db.insert(jobsTable).values({
      employerId: employer1.id,
      title: "QA Engineer Intern",
      description: "Assist our engineering team with quality assurance testing of our web applications.\n\nThis role is ideal for students with an eye for detail.\n\nResponsibilities:\n- Write and execute test cases\n- Report and track bugs\n- Help automate test suites\n\nRequirements:\n- Basic programming skills\n- Understanding of software testing principles\n- 10 hours/week availability",
      category: "Technology",
      jobType: "INTERNSHIP",
      visaEligible: ["STAMP_2", "STAMP_1G", "GRADUATE_VISA", "STUDENT_VISA"],
      hoursPerWeek: 10,
      payRate: 14,
      payPeriod: "HOURLY",
      location: "Cork, Ireland",
      isRemote: true,
      isFeatured: false,
      status: "ACTIVE",
    }).returning();
    if (j2) jobs.push(j2);
  }

  if (employer2) {
    const [j3] = await db.insert(jobsTable).values({
      employerId: employer2.id,
      title: "Café Assistant (Weekends)",
      description: "Join our friendly team at The Dublin Bakery as a weekend café assistant.\n\nYou'll serve customers, manage tills, and help keep our café looking great.\n\nShifts: Saturday & Sunday, 8am - 3pm\n\nIdeal for students who enjoy working with people in a fast-paced but fun environment.",
      category: "Hospitality",
      jobType: "PART_TIME",
      visaEligible: ["STAMP_2", "STAMP_1G", "GRADUATE_VISA", "STUDENT_VISA"],
      hoursPerWeek: 14,
      payRate: 13.5,
      payPeriod: "HOURLY",
      location: "Dublin 1, Ireland",
      isRemote: false,
      isFeatured: true,
      status: "ACTIVE",
    }).returning();
    if (j3) jobs.push(j3);
  }

  if (employer3) {
    const [j4] = await db.insert(jobsTable).values({
      employerId: employer3.id,
      title: "Social Media Manager (Part-Time)",
      description: "Help us grow our clients' social media presence.\n\nYou'll create content, schedule posts, and analyse engagement metrics across Instagram, LinkedIn, and TikTok.\n\nPerfect for marketing or communications students.\n\nFully remote - work anywhere in Ireland!",
      category: "Marketing",
      jobType: "PART_TIME",
      visaEligible: ["STAMP_2", "STAMP_1G", "GRADUATE_VISA", "STUDENT_VISA"],
      hoursPerWeek: 15,
      payRate: 15,
      payPeriod: "HOURLY",
      location: "Limerick, Ireland",
      isRemote: true,
      isFeatured: false,
      status: "ACTIVE",
    }).returning();
    if (j4) jobs.push(j4);

    const [j5] = await db.insert(jobsTable).values({
      employerId: employer3.id,
      title: "Content Writer",
      description: "Write compelling blog posts and marketing copy for our growing portfolio of clients.\n\nWe need someone with excellent written English and a knack for SEO.\n\nOutput: 2-3 articles per week.",
      category: "Marketing",
      jobType: "FREELANCE",
      visaEligible: ["STAMP_2", "STAMP_1G", "GRADUATE_VISA", "STUDENT_VISA"],
      hoursPerWeek: 8,
      payRate: 16,
      payPeriod: "HOURLY",
      location: "Remote",
      isRemote: true,
      isFeatured: false,
      status: "ACTIVE",
    }).returning();
    if (j5) jobs.push(j5);
  }

  console.log("✅ Jobs created");

  // Micro-internships
  if (employer3) {
    await db.insert(microInternshipsTable).values({
      employerId: employer3.id,
      title: "Build a Google Analytics Dashboard",
      description: "We need a clean, interactive dashboard pulling data from Google Analytics 4 to visualise our client's website traffic. Output should be a React component or a standalone HTML page with charts.\n\nDeadline: 3 weeks from agreement.",
      duration: "3 weeks",
      budget: 450,
      platformFee: 90,
      skills: ["React", "JavaScript", "Google Analytics", "Data Viz"],
      status: "OPEN",
    });
  }

  if (employer1) {
    await db.insert(microInternshipsTable).values({
      employerId: employer1.id,
      title: "Write 10 Technical Blog Posts on SaaS Topics",
      description: "We're looking for a skilled writer to produce 10 SEO-optimised blog posts (1,200-1,500 words each) on SaaS industry topics.\n\nTopics will be provided. Writers must have a strong grasp of B2B tech writing.",
      duration: "4 weeks",
      budget: 600,
      platformFee: 120,
      skills: ["Technical Writing", "SEO", "SaaS", "Content Marketing"],
      status: "OPEN",
    });
  }

  if (employer2) {
    await db.insert(microInternshipsTable).values({
      employerId: employer2.id,
      title: "Design a New Menu & Brand Refresh",
      description: "The Dublin Bakery is refreshing its brand. We need someone to redesign our printed menu and create updated brand guidelines.\n\nDeliverables: Menu PDF (A4 & A3), brand colour palette, 2 logo variants.",
      duration: "2 weeks",
      budget: 350,
      platformFee: 70,
      skills: ["Graphic Design", "Adobe Illustrator", "Brand Design", "Print Design"],
      status: "OPEN",
    });
  }

  console.log("✅ Micro-internships created");

  // Sample applications and notifications
  if (student1 && jobs.length > 0) {
    await db.insert(applicationsTable).values({
      jobId: jobs[0].id,
      studentId: student1.id,
      coverLetter: "Hi, I'm a Computer Science student at UCC with strong React and JavaScript skills. I'm particularly excited about this role as it aligns perfectly with my academic work and career goals. I am available 20 hours a week during the semester. Looking forward to hearing from you!",
      status: "SHORTLISTED",
    }).onConflictDoNothing();

    await db.insert(notificationsTable).values({
      userId: student1.id,
      title: "Application Shortlisted!",
      message: `Congratulations! Your application for "Junior Frontend Developer (Part-Time)" at TechCork Ltd has been shortlisted.`,
      link: "/student/dashboard",
      read: false,
    });
  }

  if (student2 && jobs.length > 2) {
    await db.insert(applicationsTable).values({
      jobId: jobs[2].id,
      studentId: student2.id,
      coverLetter: "Hello, I am a Business Analytics student at DCU. I would love to work at The Dublin Bakery on weekends. I have previous customer service experience and work well under pressure.",
      status: "PENDING",
    }).onConflictDoNothing();
  }

  console.log("✅ Applications & notifications created");
  console.log("\n🎉 Seed complete! Demo accounts:");
  console.log("  Student:  maria@student.ie / password123");
  console.log("  Student:  lei@student.ie / password123");
  console.log("  Employer: jobs@techcork.ie / password123");
  console.log("  Employer: hiring@dublinbakery.ie / password123");
  console.log("  Admin:    admin@visavantage.ie / admin123");
}

seed().catch(console.error).finally(() => process.exit(0));
