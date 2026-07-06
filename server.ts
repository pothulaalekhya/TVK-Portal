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
      id: "u-student1",
      name: "Rahul Bose",
      email: "rahul.b@gmail.com",
      password: "password123",
      role: "student",
      approvalStatus: "approved",
      paymentStatus: "paid",
      batchNumber: "B-2026-WKND-1",
      assignedTrainer: "Mr. Satish Raghavan",
      contactNum: "+91 9876543210",
      collegeName: "IIT Madras",
      branch: "Computer Science",
      academicStatus: "Graduated",
      createdAt: new Date().toISOString(),
    },
    {
      id: "u-student2",
      name: "Ananya Rao",
      email: "ananya.r@gmail.com",
      password: "password123",
      role: "student",
      approvalStatus: "pending",
      paymentStatus: "yet to pay",
      batchNumber: "B-2026-WKDAY-2",
      assignedTrainer: "Ms. Priyanka Sen",
      contactNum: "+91 8877665544",
      collegeName: "NIT Trichy",
      branch: "Information Technology",
      academicStatus: "Pursuing (4th Year)",
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

    if (user.password && user.password !== password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    if (user.approvalStatus === "pending") {
      return res.status(403).json({ error: "Account pending admin approval. Please wait until your account is approved." });
    }

    res.json({ success: true, user });
  });

  // Auth: Users Registration
  app.post("/api/auth/register", (req, res) => {
    const {
      name,
      email,
      password,
      role,
      contactNum,
      collegeName,
      branch,
      customBranch,
      academicStatus,
      address,
      idDetails,
      resumeFileName,
      resumeFileSize,
      paymentMode,
      paymentTxnId,
      paymentAmount,
      paymentScreenshotName,
      isInstituteMember,
      courseId,
      specialization,
      strongTechnologies,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and selected role are required fields." });
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

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email: trimmedEmail,
      password,
      role: role as any,
      approvalStatus: "pending",
      createdAt: new Date().toISOString(),

      // Institute extra student fields
      contactNum,
      collegeName,
      branch,
      customBranch,
      academicStatus,
      address,
      idDetails,
      resumeFileName,
      resumeFileSize,
      paymentMode,
      paymentTxnId,
      paymentAmount,
      paymentScreenshotName,
      isInstituteMember: Boolean(isInstituteMember),
      specialization,
      strongTechnologies,
    };

    db.users.push(newUser);

    let enrolledCourseTitle = "";
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
          status: "pending", // starts as pending approval from registrars/trainers
          registeredAt: new Date().toISOString(),
          progress: 0,
        };
        db.enrollments.push(newEnrollment);
        course.enrolledCount = (course.enrolledCount || 0) + 1;
        enrolledCourseTitle = course.title;
        broadcast("ENROLLMENT_MUTATED", { enrollment: newEnrollment });
      }
    }

    saveDb(db);

    // Notify about a new user registered!
    const alertMsg = isInstituteMember
      ? `🎉 New Student Member '${name}' registered to JOIN THE INSTITUTE for '${enrolledCourseTitle || "Assigned Course"}'! Admissions processing started.`
      : `New user '${name}' registered as a ${role}.`;

    broadcast("REALTIME_ALERT", { message: alertMsg });
    broadcast("SYSTEM_STATS_MUTATED", {
      usersCount: db.users.length,
      enrollmentsCount: db.enrollments.length,
    });

    res.status(201).json({ success: true, user: newUser });
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
