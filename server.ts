import express from "express";
import path from "path";
import fs from "fs";
import {
  Course,
  Enrollment,
  ContactRequest,
  User,
  SyncMessage,
} from "./src/app/models/models";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "local_db.json");

interface LocalDb {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  contacts: ContactRequest[];
  systemLog: Array<{ time: string; event: string; detail: string }>;
}

// Default seed database matching the TVK Technologies poster!
const defaultDb: LocalDb = {
  users: [
    {
      id: "u-admin",
      name: "Global Registrar",
      email: "admin@tvktechs.com",
      password: "password123",
      role: "admin",
      approvalStatus: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-trainer1",
      name: "Mr. Satish Raghavan (Sr. Java Architect)",
      email: "trainer.java@tvktechs.com",
      password: "password123",
      role: "trainer",
      approvalStatus: "approved",
      specialization: "Enterprise Java Architect",
      strongTechnologies: "Core Java, Spring Boot, Hibernate",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-trainer2",
      name: "Ms. Priyanka Sen (Frontend UX Specialist)",
      email: "trainer.angular@tvktechs.com",
      password: "password123",
      role: "trainer",
      approvalStatus: "approved",
      specialization: "Frontend & UI/UX Expert",
      strongTechnologies: "Angular, React, Tailwind CSS",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-frontdesk",
      name: "Ms. Sneha Reddy (Admissions Follow-up)",
      email: "frontdesk@tvktechs.com",
      password: "password123",
      role: "frontdesk",
      approvalStatus: "approved",
      attendanceStatus: "ON_DUTY",
      specialization: "Student Admissions & Telecaller",
      strongTechnologies: "Lead Follow-up, Counseling, Student Outreach",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-frontdesk2",
      name: "Mr. Karthik Varma (Career Counselor)",
      email: "karthik.counselor@tvktechs.com",
      password: "password123",
      role: "frontdesk",
      approvalStatus: "approved",
      attendanceStatus: "ON_DUTY",
      specialization: "Telecalling & Technical Counseling",
      strongTechnologies: "Career Guidance, Batch Scheduling",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-frontdesk3",
      name: "Ms. Divya Menon (Admissions Lead)",
      email: "divya.admissions@tvktechs.com",
      password: "password123",
      role: "frontdesk",
      approvalStatus: "approved",
      attendanceStatus: "ON_DUTY",
      specialization: "Admissions & Corporate Outreach",
      strongTechnologies: "Candidate Conversion, Fee Processing",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-student1",
      name: "Rahul Bose",
      firstName: "Rahul",
      lastName: "Bose",
      email: "rahul.b@gmail.com",
      password: "password123",
      role: "student",
      approvalStatus: "approved",
      paymentStatus: "paid",
      batchNumber: "B-2026-WKND-1",
      assignedTrainer: "Mr. Satish Raghavan",
      contactNum: "9876543210",
      emergencyContactNum: "9876543211",
      preferredLocation: "Bengaluru",
      trainingTrack: "Full Stack Java Developer with Angular",
      programCategory: "internship",
      selectedSkills: ["Core Java", "Spring Boot", "Angular"],
      availableFromDate: "2026-10-01",
      collegeName: "IIT Madras",
      branch: "Computer Science",
      academicStatus: "Graduated",
      followUpStatus: "Ready to Join",
      candidateReply: "Ready for upcoming weekend batch. Fees processed.",
      followUpDate: "2026-09-28",
      whatsappStatus: "Opened",
      assignedCounselor: "Sneha Reddy",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-student2",
      name: "Ananya Rao",
      firstName: "Ananya",
      lastName: "Rao",
      email: "ananya.r@gmail.com",
      password: "password123",
      role: "student",
      approvalStatus: "pending",
      paymentStatus: "yet to pay",
      batchNumber: "B-2026-WKDAY-2",
      assignedTrainer: "Ms. Priyanka Sen",
      contactNum: "8877665544",
      emergencyContactNum: "8877665545",
      preferredLocation: "Chennai",
      trainingTrack: "Frontend & UI/UX Expert",
      programCategory: "internship",
      selectedSkills: ["Angular", "React developer", "HTML & CSS"],
      availableFromDate: "2026-10-05",
      collegeName: "NIT Trichy",
      branch: "Information Technology",
      academicStatus: "Pursuing (4th Year)",
      followUpStatus: "Follow-up Needed",
      candidateReply: "Requested syllabus PDF & timing schedule for weekday morning batch.",
      followUpDate: "2026-09-26",
      whatsappStatus: "Opened",
      assignedCounselor: "Sneha Reddy",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-student3",
      name: "Saranya Murugan",
      firstName: "Saranya",
      lastName: "Murugan",
      email: "saranya.m@gmail.com",
      password: "password123",
      role: "student",
      approvalStatus: "pending",
      paymentStatus: "yet to pay",
      contactNum: "9187970815",
      emergencyContactNum: "9187970816",
      preferredLocation: "Bengaluru",
      trainingTrack: "Full Stack Java Developer with Angular",
      programCategory: "job",
      selectedSkills: ["Java Developer", "Spring Boot", "React developer"],
      availableFromDate: "2026-10-10",
      collegeName: "Anna University",
      branch: "Computer Science",
      academicStatus: "Graduated",
      followUpStatus: "Replied",
      candidateReply: "Interested in 100% placement support. Will attend demo session tomorrow.",
      followUpDate: "2026-09-27",
      whatsappStatus: "Opened",
      assignedCounselor: "Sneha Reddy",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-student4",
      name: "Manoj Kumar",
      firstName: "Manoj",
      lastName: "Kumar",
      email: "manoj.k@gmail.com",
      password: "password123",
      role: "student",
      approvalStatus: "pending",
      paymentStatus: "yet to pay",
      contactNum: "9384092996",
      emergencyContactNum: "9384092997",
      preferredLocation: "Chennai",
      trainingTrack: "Java Full Stack with React",
      programCategory: "internship",
      selectedSkills: ["Java Full Stack with React", "Spring Boot"],
      availableFromDate: "2026-10-15",
      collegeName: "SRM University",
      branch: "ECE",
      academicStatus: "Pursuing (4th Year)",
      followUpStatus: "Need to Contact",
      candidateReply: "",
      followUpDate: "2026-09-26",
      whatsappStatus: "Unsent",
      assignedCounselor: "Sneha Reddy",
      createdAt: new Date().toISOString(),
    },
  ],
  courses: [
    {
      id: "c-java-fullstack",
      title: "Java with Angular: Professional Full Stack Developer",
      description:
        "Our premier training & placement program. Master high-performance Java frameworks paired with Angular enterprise SPA architecture.",
      duration: "12 Weeks (Weekend & Weekday Batches)",
      trainerName: "Mr. Satish Raghavan & Ms. Priyanka Sen",
      features: [
        "100% Job Confirmation Guarantee",
        "Expert Trainer & Placement Support",
        "Resume Building & Mock Interviews",
        "Real-Time Live Projects",
      ],
      syllabus: [
        "Core Java (OOPs, Collections, Exceptions, Multithreading, Streams)",
        "Advanced Java (JDBC, Hibernate ORM, SQL Databases)",
        "Spring Boot & RESTful APIs Microservice Architecture",
        "Angular 17+ Essentials (Components, RxJS Routing, HTTP Client)",
        "Git, GitHub & Cloud CI/CD Deployment Practice",
      ],
      capacity: 30,
      enrolledCount: 12,
      isLive: true,
      price: "$299 (Flexible EMI Options)",
      batches: ["Weekend Batch (10 AM - 2 PM)", "Weekday Batch (7 AM - 9 AM)"],
    },
    {
      id: "c-spring-micro",
      title: "Enterprise Spring Boot & Microservices",
      description:
        "Deep dive into production-grade microservices with Spring Cloud, OAuth2, and scalable Docker container deployments.",
      duration: "6 Weeks",
      trainerName: "Mr. Satish Raghavan",
      features: [
        "Advanced Concepts",
        "API Gateway & Security",
        "Doubt Slay Sessions",
      ],
      syllabus: [
        "Spring Boot Configuration & Spring Data JPA",
        "Microservices Core principles (Eureka, Spring Cloud Gateway)",
        "Security & Authentication with JWT and OAuth2",
        "Kafka/RabbitMQ Messaging Systems",
        "Kubernetes & Docker Deployment",
      ],
      capacity: 25,
      enrolledCount: 8,
      isLive: true,
      price: "$199",
    },
    {
      id: "c-angular-pro",
      title: "Angular 17+ Modern Web Applications",
      description:
        "Master modern reactive web architecture using standalone components, RxJS, NgRx, and server-side pre-rendering.",
      duration: "6 Weeks",
      trainerName: "Ms. Priyanka Sen",
      features: [
        "Reactive Architecture",
        "Mock Interview Training",
        "Real-Time Project Support",
      ],
      syllabus: [
        "Standalone Components & Signals Control State",
        "Advanced Routers & Guard Interceptors",
        "RxJS Observables Flow & Reactive Forms",
        "State Management with NgRx Store",
        "Optimizing Performance & Accessibility",
      ],
      capacity: 25,
      enrolledCount: 9,
      isLive: true,
      price: "$149",
    },
  ],
  enrollments: [
    {
      id: "e1",
      courseId: "c-java-fullstack",
      courseTitle: "Java with Angular: Professional Full Stack Developer",
      studentId: "u-student1",
      studentName: "Rahul Bose",
      studentEmail: "rahul.b@gmail.com",
      status: "active",
      registeredAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      progress: 45,
      grade: "A",
      feedback:
        "Demonstrates exceptional understanding of database schemas and Spring JPA queries.",
    },
    {
      id: "e2",
      courseId: "c-angular-pro",
      courseTitle: "Angular 17+ Modern Web Applications",
      studentId: "u-student2",
      studentName: "Ananya Rao",
      studentEmail: "ananya.r@gmail.com",
      status: "active",
      registeredAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      progress: 20,
      feedback:
        "Responsive components are fully functional. Keep up the high dedication!",
    },
  ],
  contacts: [
    {
      id: "cnt1",
      name: "Karan Johar",
      email: "karan.j@gmail.com",
      phone: "+91 9876543210",
      subject: "Queries on Job Placement Assistance",
      message:
        "Hi TVK Techs, I graduated from BE in 2024. Can I apply for the Java with Angular Training? Please let me know how the placement assurance program works.",
      status: "read",
      createdAt: new Date().toISOString(),
    },
  ],
  systemLog: [
    {
      time: new Date().toISOString(),
      event: "SYSTEM_INITIALIZED",
      detail:
        "TVK Technologies Realtime Platform booted successfully on local storage.",
    },
  ],
};

// Ensure database file exists or create with seed data
function loadDb(): LocalDb {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(
      "Failed to read database file. Reverting to default DB state.",
      error,
    );
  }
  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(data: LocalDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist database to local system JSON.", error);
  }
}

// Active SSE SSE Connection Pool
interface SSEClient {
  id: string;
  response: express.Response;
}
let sseClients: SSEClient[] = [];

// Helper to broadcast sync updates in real-time
function broadcast(type: string, payload: any) {
  const message: SyncMessage = {
    type: type as any,
    payload,
    timestamp: new Date().toISOString(),
  };

  const serialized = `data: ${JSON.stringify(message)}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.response.write(serialized);
    } catch (e) {
      console.error(`Error sending message to client ${client.id}:`, e);
    }
  });

  // Log inside our system logs
  const db = loadDb();
  db.systemLog.unshift({
    time: message.timestamp,
    event: type,
    detail: `Broadcast transmitted: ${JSON.stringify(payload).substring(0, 100)}...`,
  });
  if (db.systemLog.length > 50) db.systemLog.pop(); // limit size
  saveDb(db);
}

async function run() {
  const app = express();
  app.use(express.json());

  // API - Realtime Event Synchronization Stream (SSE)
  app.get("/api/sync/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newClient: SSEClient = { id: clientId, response: res };
    sseClients.push(newClient);

    // Send initial test event to confirm socket connection
    const welcomeEvent: SyncMessage = {
      type: "REALTIME_ALERT",
      payload: {
        message: "Connected to TVK Technologies Live Sync System Gateway",
      },
      timestamp: new Date().toISOString(),
    };
    res.write(`data: ${JSON.stringify(welcomeEvent)}\n\n`);

    // Keepalive system heatbeats every 30 seconds to prevent pipeline freezes
    const heartbeatTimer = setInterval(() => {
      try {
        res.write(
          `data: ${JSON.stringify({ type: "REALTIME_ALERT", payload: { heartbeat: true }, timestamp: new Date().toISOString() })}\n\n`,
        );
      } catch (err) {
        // failed timer
      }
    }, 30000);

    req.on("close", () => {
      clearInterval(heartbeatTimer);
      sseClients = sseClients.filter((c) => c.id !== clientId);
      console.log(
        `SSE connection closed: ${clientId}. Total active pools: ${sseClients.length}`,
      );
    });
  });

  // Auth: Users Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email address and password are required." });
    }

    const db = loadDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
    );
    if (!user) {
      return res.status(404).json({
        error:
          "No user found with this email. Please check your spelling or register a new account.",
      });
    }

    const status = user.approvalStatus || "PENDING_APPROVAL";
    if (status.toUpperCase() === "PENDING_APPROVAL" || status.toLowerCase() === "pending") {
      return res.status(403).json({ error: "Your application is under review. You will receive your login details after approval." });
    }

    if (status.toUpperCase() === "REJECTED" || status.toLowerCase() === "rejected") {
      return res.status(403).json({ error: "Your application was not approved. Please contact the admissions desk." });
    }

    const matchRegular = user.password && user.password === password;
    const matchTemp = user.tempPassword && user.tempPassword === password;

    if (!matchRegular && !matchTemp) {
      return res.status(401).json({ error: "Incorrect password. First time? Use the temporary password sent to you after approval." });
    }

    if (matchTemp && !matchRegular) {
      if (user.tempPasswordExpiresAt) {
        try {
          const exp = new Date(user.tempPasswordExpiresAt).getTime();
          if (Date.now() > exp) {
            return res.status(403).json({ error: "Your temporary password has expired. Contact admissions to get a new one." });
          }
        } catch (e) {}
      }
      user.mustChangePassword = true;
      saveDb(db);
    }

    res.json({ success: true, user, mustChangePassword: Boolean(user.mustChangePassword) });
  });

  // Auth: Users Registration (Approval-based Access, No password created)
  app.post("/api/auth/register", (req, res) => {
    const {
      firstName,
      lastName,
      name,
      email,
      password,
      role = "student",
      personalPhone,
      emergencyPhone,
      contactNum,
      street,
      city,
      state,
      pincode,
      address,
      preferredLocation,
      trackType,
      targetCourse,
      internshipSkills,
      availabilityToJoin,
      techStack,
      collegeName,
      branch,
      customBranch,
      academicStatus,
      idDetails,
      resumeFileName,
      resumeFileSize,
      resumeData,
      paymentMode,
      paymentTxnId,
      paymentAmount,
      paymentScreenshotName,
      isInstituteMember,
      courseId,
      specialization,
      strongTechnologies,
    } = req.body;

    const studentName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || "Student");

    if (!email) {
      return res.status(400).json({ error: "Email is a required field." });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const db = loadDb();

    // Check duplication
    const duplicate = db.users.find(
      (u) => u.email.toLowerCase() === trimmedEmail,
    );
    if (duplicate) {
      return res
        .status(409)
        .json({ error: "An account with this email address already exists." });
    }

    const fullAddress = address || [street, city, state, pincode].filter(Boolean).join(", ");
    const primaryPhone = personalPhone || contactNum || "";

    const isStaff = role !== "student" && password;

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: studentName,
      firstName,
      lastName,
      email: trimmedEmail,
      password: isStaff ? password : undefined,
      tempPassword: undefined,
      mustChangePassword: false,
      role: (role as any) || "student",
      approvalStatus: isStaff ? "APPROVED" : "PENDING_APPROVAL",
      createdAt: new Date().toISOString(),

      personalPhone,
      emergencyPhone,
      contactNum: primaryPhone,
      street,
      city,
      state,
      pincode,
      address: fullAddress,
      preferredLocation,
      trackType,
      targetCourse,
      internshipSkills,
      availabilityToJoin,
      techStack,
      collegeName,
      branch,
      customBranch,
      academicStatus,
      idDetails,
      resumeFileName,
      resumeFileSize,
      resumeData,
      paymentMode,
      paymentTxnId,
      paymentAmount,
      paymentScreenshotName,
      isInstituteMember: Boolean(isInstituteMember),
      specialization,
      strongTechnologies,
      followUpStatus: "Need to Contact",
      whatsappStatus: "Unsent",
    };

    db.users.push(newUser);

    let enrolledCourseTitle = targetCourse || "";
    if (role === "student" && courseId) {
      const course = db.courses.find((c) => c.id === courseId);
      if (course) {
        const newEnrollment: Enrollment = {
          id: `e-${Date.now()}`,
          courseId: course.id,
          courseTitle: course.title,
          studentId: newUser.id,
          studentName: newUser.name,
          studentEmail: newUser.email,
          status: "pending",
          registeredAt: new Date().toISOString(),
          progress: 0,
        };
        db.enrollments.push(newEnrollment);
        course.enrolledCount = (course.enrolledCount || 0) + 1;
        enrolledCourseTitle = course.title;
        broadcast("ENROLLMENT_MUTATED", { enrollment: newEnrollment });
      }
    }

    db.systemLog.push({
      time: new Date().toISOString(),
      event: "STUDENT_REGISTERED",
      detail: `Application submitted for ${newUser.name} (${newUser.email}). Status: PENDING_APPROVAL.`,
    });

    saveDb(db);

    const alertMsg = `🔔 New student application received: '${newUser.name}'. Pending Admissions Approval.`;
    broadcast("REALTIME_ALERT", { message: alertMsg });
    broadcast("USER_MUTATED", { user: newUser });
    broadcast("SYSTEM_STATS_MUTATED", { usersCount: db.users.length });

    res.status(201).json({
      success: true,
      message: "Application received. Your login will be enabled once our admissions team approves your application. You will be notified by email/SMS.",
      user: newUser,
    });
  });

  // Auth: Request / Check Temporary Password status
  app.post("/api/auth/temp-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "No registration found with this email." });
    }

    const status = user.approvalStatus || "PENDING_APPROVAL";
    if (status.toUpperCase() === "PENDING_APPROVAL" || status.toLowerCase() === "pending") {
      return res.status(403).json({ error: "Your application is under review. You will receive your login details after approval." });
    }

    if (status.toUpperCase() === "REJECTED" || status.toLowerCase() === "rejected") {
      return res.status(403).json({ error: "Your application was not approved. Please contact the admissions desk." });
    }

    if (user.tempPasswordExpiresAt) {
      try {
        const exp = new Date(user.tempPasswordExpiresAt).getTime();
        if (Date.now() > exp) {
          return res.status(403).json({ error: "Your temporary password has expired. Contact admissions to get a new one." });
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      email: user.email,
      name: user.name,
      message: "Your account is approved. Use the temporary password issued by admissions to log in.",
    });
  });

  // Auth: Change Password
  app.post("/api/auth/change-password", (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: "Email and new password are required." });

    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return res.status(404).json({ error: "User not found." });

    if (currentPassword) {
      const valid = user.password === currentPassword || user.tempPassword === currentPassword;
      if (!valid) return res.status(401).json({ error: "Current or temporary password does not match." });
    }

    user.password = newPassword.trim();
    user.tempPassword = undefined;
    user.tempPasswordExpiresAt = undefined;
    user.mustChangePassword = false;
    user.approvalStatus = "APPROVED";

    db.systemLog.push({
      time: new Date().toISOString(),
      event: "PASSWORD_CHANGED",
      detail: `User ${user.name} (${user.email}) changed password.`,
    });

    saveDb(db);

    broadcast("USER_MUTATED", { user });

    res.json({
      success: true,
      message: "Password set successfully! You can now access your training portal.",
      user,
    });
  });

  // API Courses List
  app.get("/api/courses", (req, res) => {
    const db = loadDb();
    res.json(db.courses);
  });

  // Create or Edit Courses (Admin panel)
  app.post("/api/courses", (req, res) => {
    const db = loadDb();
    const courseData = req.body;

    if (!courseData.title || !courseData.description) {
      return res
        .status(400)
        .json({ error: "Course title and description are strictly required." });
    }

    let updatedCourse: Course;

    if (courseData.id) {
      // Edit
      const index = db.courses.findIndex((c) => c.id === courseData.id);
      if (index === -1) {
        return res.status(404).json({ error: "Requested course not found." });
      }
      db.courses[index] = {
        ...db.courses[index],
        ...courseData,
        features: courseData.features || db.courses[index].features,
        syllabus: courseData.syllabus || db.courses[index].syllabus,
      };
      updatedCourse = db.courses[index];
    } else {
      // New Core Course
      updatedCourse = {
        id: `c-${Date.now()}`,
        title: courseData.title,
        description: courseData.description,
        duration: courseData.duration || "8 Weeks",
        trainerName: courseData.trainerName || "To Be Assigned",
        features: courseData.features || [
          "Industry-Oriented Training",
          "Practical Live Lab sessions",
        ],
        syllabus: courseData.syllabus || [
          "Overview Modules",
          "Capstone Application Build",
        ],
        capacity: Number(courseData.capacity) || 30,
        enrolledCount: 0,
        isLive: true,
        price: courseData.price || "$150",
      };
      db.courses.push(updatedCourse);
    }

    saveDb(db);
    broadcast("COURSE_MUTATED", { course: updatedCourse });
    broadcast("REALTIME_ALERT", {
      message: `Course list updated: '${updatedCourse.title}' was added or updated.`,
    });

    res.json({ success: true, course: updatedCourse });
  });

  // Delete Courses
  app.delete("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const index = db.courses.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Course not found" });
    }
    const removedCourse = db.courses.splice(index, 1)[0];
    saveDb(db);

    broadcast("COURSE_MUTATED", { deletedId: id });
    res.json({
      success: true,
      message: `Successfully deleted course: ${removedCourse.title}`,
    });
  });

  // Enroll in a Course (Student action)
  app.post("/api/enroll", (req, res) => {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({
        error: "Both active StudentID and CourseID must be provided.",
      });
    }

    const db = loadDb();
    const student = db.users.find((u) => u.id === studentId);
    const course = db.courses.find((c) => c.id === courseId);

    if (!student || student.role !== "student") {
      return res.status(403).json({ error: "Invalid student profile." });
    }

    if (!course) {
      return res
        .status(404)
        .json({ error: "The selected course is unavailable." });
    }

    // Check duplicate enrollment
    const existing = db.enrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId,
    );
    if (existing) {
      return res.status(409).json({
        error:
          "You are already actively enrolled in this specific training program.",
      });
    }

    // Check capacity limit
    if (course.enrolledCount >= course.capacity) {
      return res.status(410).json({
        error: "Sorry, all limited seats have been booked out for this batch.",
      });
    }

    // Save registration
    const newEnrollment: Enrollment = {
      id: `e-${Date.now()}`,
      courseId: course.id,
      courseTitle: course.title,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      status: "active",
      registeredAt: new Date().toISOString(),
      progress: 0,
    };

    course.enrolledCount += 1;
    db.enrollments.push(newEnrollment);
    saveDb(db);

    // Sync Event to all connected client browsers
    broadcast("ENROLLMENT_MUTATED", { enrollment: newEnrollment });
    broadcast("REALTIME_ALERT", {
      message: `🎉 Student '${student.name}' just registered in the '${course.title}' course!`,
    });
    broadcast("SYSTEM_STATS_MUTATED", {
      enrollmentsCount: db.enrollments.length,
    });

    res.status(201).json({ success: true, enrollment: newEnrollment });
  });

  // Enrollments List
  app.get("/api/enrollments", (req, res) => {
    const db = loadDb();
    res.json(db.enrollments);
  });

  // Trainer Updates: progress, grade, feedback
  app.post("/api/enrollment/update", (req, res) => {
    const { enrollmentId, progress, grade, feedback } = req.body;
    if (!enrollmentId) {
      return res
        .status(400)
        .json({ error: "Active enrollment identifier required." });
    }

    const db = loadDb();
    const index = db.enrollments.findIndex((e) => e.id === enrollmentId);
    if (index === -1) {
      return res
        .status(404)
        .json({ error: "Matching enrollment registry not found." });
    }

    const original = db.enrollments[index];
    db.enrollments[index] = {
      ...original,
      progress:
        progress !== undefined
          ? Math.min(100, Math.max(0, Number(progress)))
          : original.progress,
      grade: grade !== undefined ? grade : original.grade,
      feedback: feedback !== undefined ? feedback : original.feedback,
      status: progress >= 100 ? "completed" : original.status,
    };

    const updated = db.enrollments[index];
    saveDb(db);

    // Realtime broadcast sync
    broadcast("FEEDBACK_MUTATED", {
      enrollmentId,
      studentId: updated.studentId,
      updated,
    });
    broadcast("REALTIME_ALERT", {
      message: `Trainer added updates/feedback for student '${updated.studentName}' in '${updated.courseTitle}'.`,
    });

    res.json({ success: true, enrollment: updated });
  });

  // Contact US Submission
  app.post("/api/contact", (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        error:
          "Please fill out the name, email, and inquiry description fields.",
      });
    }

    const db = loadDb();
    const newRequest: ContactRequest = {
      id: `cnt-${Date.now()}`,
      name,
      email,
      phone: phone || "Not Provided",
      subject: subject || "Course Inquiry",
      message,
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    db.contacts.push(newRequest);
    saveDb(db);

    // Notify and sync contacts
    broadcast("CONTACT_MUTATED", { contact: newRequest });
    broadcast("REALTIME_ALERT", {
      message: `🔔 Realtime Alert: New Inquiry from client '${name}' regarding: '${newRequest.subject}'`,
    });

    res.status(201).json({ success: true, contact: newRequest });
  });

  // Contact List (Admin only view)
  app.get("/api/contacts", (req, res) => {
    const db = loadDb();
    res.json(db.contacts);
  });

  // Admin Mark Contact as Read/Replied
  app.post("/api/contact/respond", (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
      return res
        .status(400)
        .json({ error: "Inquiry ID and new status are required." });
    }

    const db = loadDb();
    const index = db.contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Inquiry item not found." });
    }

    db.contacts[index].status = status;
    saveDb(db);

    broadcast("CONTACT_MUTATED", { contactId: id, updatedStatus: status });
    res.json({ success: true, contact: db.contacts[index] });
  });

  // User Management
  app.post("/api/users/update", (req, res) => {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    db.users[index] = { ...db.users[index], ...updates };
    saveDb(db);

    broadcast("USER_MUTATED", { user: db.users[index] });
    res.json({ success: true, user: db.users[index] });
  });

  // Helper generator for 10-char temp password (letters + numbers + symbol)
  function generate10CharTempPassword(): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const digits = "23456789";
    const symbols = "@#$%&*!";
    const all = upper + lower + digits + symbols;
    let pwd = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    for (let i = 4; i < 10; i++) {
      pwd.push(all[Math.floor(Math.random() * all.length)]);
    }
    return pwd.sort(() => Math.random() - 0.5).join("");
  }

  // Admin Approve Candidate
  app.post("/api/users/approve", (req, res) => {
    const { id, userId, operatorRole = "admin", approvedBy = "Admissions Desk" } = req.body;
    const targetId = id || userId;
    if (!targetId) return res.status(400).json({ error: "Candidate ID required." });

    if (!["admin", "frontdesk", "admission_desk"].includes(String(operatorRole).toLowerCase())) {
      return res.status(403).json({ error: "Permission denied. Only ADMIN or ADMISSION_DESK can approve candidates." });
    }

    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === targetId);
    if (index === -1) return res.status(404).json({ error: "Candidate not found." });

    const rawTempPassword = generate10CharTempPassword();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.users[index] = {
      ...db.users[index],
      approvalStatus: "APPROVED",
      tempPassword: rawTempPassword,
      password: rawTempPassword,
      mustChangePassword: true,
      tempPasswordExpiresAt: expiresAt,
      approvedBy,
      approvedAt: new Date().toISOString(),
      rejectionReason: undefined,
      rejectedBy: undefined,
      rejectedAt: undefined,
    };

    db.systemLog.push({
      time: new Date().toISOString(),
      event: "CANDIDATE_APPROVED",
      detail: `Candidate ${db.users[index].name} (${db.users[index].email}) approved by ${approvedBy}. 7-day temporary access key issued.`,
    });

    saveDb(db);
    broadcast("USER_MUTATED", { user: db.users[index] });

    res.json({
      success: true,
      user: db.users[index],
      tempPassword: rawTempPassword,
      expiresAt,
      message: `Candidate ${db.users[index].name} approved! Temporary password generated.`,
    });
  });

  // Admin Reject Candidate
  app.post("/api/users/reject", (req, res) => {
    const { id, userId, reason = "Application does not meet current batch requirements.", operatorRole = "admin", rejectedBy = "Admissions Desk" } = req.body;
    const targetId = id || userId;
    if (!targetId) return res.status(400).json({ error: "Candidate ID required." });

    if (!["admin", "frontdesk", "admission_desk"].includes(String(operatorRole).toLowerCase())) {
      return res.status(403).json({ error: "Permission denied. Only ADMIN or ADMISSION_DESK can reject candidates." });
    }

    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === targetId);
    if (index === -1) return res.status(404).json({ error: "Candidate not found." });

    db.users[index] = {
      ...db.users[index],
      approvalStatus: "REJECTED",
      rejectionReason: reason,
      rejectedBy,
      rejectedAt: new Date().toISOString(),
      password: undefined,
      tempPassword: undefined,
      tempPasswordExpiresAt: undefined,
      mustChangePassword: false,
    };

    db.systemLog.push({
      time: new Date().toISOString(),
      event: "CANDIDATE_REJECTED",
      detail: `Candidate ${db.users[index].name} (${db.users[index].email}) rejected by ${rejectedBy}. Reason: ${reason}`,
    });

    saveDb(db);
    broadcast("USER_MUTATED", { user: db.users[index] });

    res.json({
      success: true,
      user: db.users[index],
      message: "Candidate application marked as rejected.",
    });
  });

  // Admin Regenerate Temporary Password
  app.post("/api/users/regenerate-temp-password", (req, res) => {
    const { id, userId, operatorRole = "admin", operatorName = "Admissions Desk" } = req.body;
    const targetId = id || userId;
    if (!targetId) return res.status(400).json({ error: "Candidate ID required." });

    if (!["admin", "frontdesk", "admission_desk"].includes(String(operatorRole).toLowerCase())) {
      return res.status(403).json({ error: "Permission denied. Only ADMIN or ADMISSION_DESK can regenerate temporary passwords." });
    }

    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === targetId);
    if (index === -1) return res.status(404).json({ error: "Candidate not found." });

    const rawTempPassword = generate10CharTempPassword();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.users[index] = {
      ...db.users[index],
      tempPassword: rawTempPassword,
      password: rawTempPassword,
      mustChangePassword: true,
      tempPasswordExpiresAt: expiresAt,
    };

    db.systemLog.push({
      time: new Date().toISOString(),
      event: "TEMP_PASSWORD_REGENERATED",
      detail: `Temporary password regenerated for ${db.users[index].name} (${db.users[index].email}) by ${operatorName}.`,
    });

    saveDb(db);
    broadcast("USER_MUTATED", { user: db.users[index] });

    res.json({
      success: true,
      user: db.users[index],
      tempPassword: rawTempPassword,
      expiresAt,
      message: `New temporary password generated successfully for ${db.users[index].name}.`,
    });
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "User not found." });
    }
    
    const removedUser = db.users.splice(index, 1)[0];
    saveDb(db);

    broadcast("USER_MUTATED", { deletedId: id });
    res.json({ success: true, message: `Deleted user: ${removedUser.name}` });
  });

  // Global Admin stats view
  app.get("/api/admin/dashboard", (req, res) => {
    const db = loadDb();
    const totalStudents = db.users.filter((u) => u.role === "student").length;
    const totalTrainers = db.users.filter((u) => u.role === "trainer").length;
    const activeInquiries = db.contacts.filter(
      (c) => c.status === "unread",
    ).length;
    const totalEnrollments = db.enrollments.length;

    res.json({
      stats: {
        students: totalStudents,
        trainers: totalTrainers,
        courses: db.courses.length,
        pendingInquiries: activeInquiries,
        totalEnrollments,
      },
      systemLog: db.systemLog,
      users: db.users,
    });
  });

  // Angular Integration for Assets/Render
  const distPath = path.join(process.cwd(), "dist", "browser");

  // Serve static assets with cache control
  app.use(
    express.static(distPath, {
      maxAge: "1d",
      index: false, // disable automatic index.html serving
    }),
  );

  // SPA fallback: all non-API routes serve index.html for Angular routing
  app.get("*", (req, res) => {
    // Don't intercept API calls
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===============================================`);
    console.log(`TVK TECHNOLOGIES TRAINING PORTAL SERVING API`);
    console.log(`Dev/Prod deployment running on node port ${PORT}`);
    console.log(`Using persistent local database: ${DB_FILE}`);
    console.log(`===============================================`);
  });
}

run().catch((err) => {
  console.error("Critical failure during training portal startup:", err);
});
