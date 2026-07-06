# TVK Technologies — Training & Placement Portal

<div align="center">

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.8+-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A complete full-stack Training & Placement Management System**  
_Multi-role dashboards · Real-time SSE · MySQL persistence · Advanced filters_

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Features](#-features)
4. [System Requirements](#%EF%B8%8F-system-requirements)
5. [Installation & Setup](#-installation--setup)
6. [Running the Application](#-running-the-application)
7. [Available Commands](#-available-commands)
8. [Default Login Accounts](#-default-login-accounts)
9. [Project Structure](#-project-structure)
10. [REST API Reference](#-rest-api-reference)
11. [MySQL Database Schema](#%EF%B8%8F-mysql-database-schema)
12. [Real-Time SSE System](#-real-time-sse-system)
13. [Dashboard Features](#-dashboard-features)
14. [Configuration Reference](#-configuration-reference)
15. [Troubleshooting](#-troubleshooting)
16. [License](#-license)

---

## 🌟 Project Overview

**TVK Technologies Training Portal** is a production-grade, full-stack web application for managing technical training programs, student enrollments, trainer assignments, and placement activities.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🖥️ **Frontend** | Angular 18 + TypeScript + Tailwind CSS | Responsive SPA with multi-role dashboards |
| ⚙️ **Backend** | Java 17 + Spring Boot 3.2 | REST API server, business logic, SSE |
| 🗄️ **Database** | MySQL 8.0 via JPA/Hibernate | Persistent data storage with auto schema |
| 📡 **Real-Time** | Server-Sent Events (SSE) | Live broadcast to all connected browsers |
| 🔨 **Build** | Maven (backend) + npm (frontend) | Unified build via npm scripts |

> **Is this Full-Stack?** YES. Both frontend and backend are in this single repository. Spring Boot serves the Angular SPA as static files and exposes a full REST API — no separate server processes needed.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                               │
│                                                                 │
│   Angular 18 SPA (TypeScript + Tailwind CSS)                    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│   │  Home    │ │ Courses  │ │ Contact  │ │    Dashboard     │  │
│   │  Page    │ │ Catalog  │ │  Form    │ │ Admin│Trainer│Std │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│         ↕ HTTP REST calls to /api/**                            │
│         ↕ SSE stream from /api/sync/stream                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │  HTTP / SSE
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              SPRING BOOT SERVER  (Port 8080)                    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                  REST Controllers                      │     │
│  │  AuthCtrl  CourseCtrl  EnrollCtrl  ContactCtrl  etc.   │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                      │
│  ┌───────────────────────▼────────────────────────────────┐     │
│  │                  Service Layer                         │     │
│  │  AuthSvc  CourseSvc  EnrollSvc  ContactSvc  SseSvc     │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                      │
│  ┌───────────────────────▼────────────────────────────────┐     │
│  │            Spring Data JPA / Hibernate                 │     │
│  │         (UserRepo, CourseRepo, EnrollRepo ...)         │     │
│  └───────────────────────┬────────────────────────────────┘     │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │  JDBC
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   MySQL 8.0 Database                            │
│                   Database: tvk_portal                          │
│                                                                 │
│  users  │  courses  │  enrollments  │  contact_requests         │
│  course_features  │  course_syllabus  │  system_logs            │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow
```
Browser → GET  /home          → SpaController → index.html (Angular)
Browser → GET  /api/courses   → CourseController → CourseService → MySQL
Browser → POST /api/auth/login → AuthController → AuthService → MySQL
Browser → GET  /api/sync/stream → SseController → SseEmitter pool (real-time)
```

---

## ✨ Features

### 🏠 Home Page
- Hero landing section with animated headline
- Live enrollment countdown timer
- Course capacity tracker
- Program benefits and testimonials

### 📚 Course Catalog
- Browse all available training programs
- View course details (syllabus, trainer, batch schedule, pricing)
- One-click enrollment with confirmation

### 📬 Contact Form
- Submit inquiries directly from the portal
- Real-time notification to admin on submission
- Admin can mark as Read or Replied

### 🎓 Student Dashboard
- View all enrolled courses with progress bars
- See grades and trainer feedback
- Status filter tabs: All / Active / Pending / Completed

### 🧑‍🏫 Trainer Dashboard
- View all students enrolled in trainer's courses
- Update student progress (0–100%)
- Assign grades and write feedback notes
- Search by student name, email, or course
- Status filter: All / Active / Pending / Completed

### 🔑 Admin Dashboard
- **Stats & Logs** — View live metrics counters (students, trainers, courses, enrollments, inquiries) and the real-time activity log stream.
- **Manage Courses** — Full CRUD support for curriculum training programs (create, edit details, assign instructors, manage seats/capacity, delete).
- **Registered Users** — Advanced directory search and filters (role, payment status, approval status, batches) to approve/reject registrations, assign trainers/batches, and delete users.
- **Inquiries** — Manage client inquiries submitted through the contact form, filter by status, and mark them as read or replied.
- **Trainers** — View expert trainers, update their name, specialization, contact email, strong technologies/skills, or delete them.
- **Certificates** — Portal to generate and manage student course completion certificates (Coming Soon).


### 📡 Real-Time SSE
- All connected browser tabs receive live updates instantly
- Events: user registration, enrollment, grade updates, inquiries
- No page refresh needed — changes appear automatically
- Heartbeat every 30 seconds to keep connections alive

### 🔐 Authentication
- Email + password login with role detection
- Admin approves new accounts before they can log in
- Detailed student registration with academic info and payment details
- Session persistence via localStorage

---

## 🖥️ System Requirements

> ⚠️ **All three must be installed before running this project.**

### 1. Node.js (for Angular Frontend)

| Software | Minimum Version | Check Command | Download |
|----------|----------------|---------------|---------|
| **Node.js** | v18.0 or higher | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | v9.0 or higher | `npm --version` | Bundled with Node.js |

### 2. Java + Maven (for Spring Boot Backend)

| Software | Minimum Version | Check Command | Download |
|----------|----------------|---------------|---------|
| **Java JDK** | 17 or higher | `java -version` | [adoptium.net](https://adoptium.net) |
| **Apache Maven** | 3.8 or higher | `mvn -version` | [maven.apache.org](https://maven.apache.org/download.cgi) |

> 💡 **Windows tip:** After installing Maven, add `C:\apache-maven-x.x.x\bin` to your System PATH.

### 3. MySQL Database

| Software | Minimum Version | Check Command | Download |
|----------|----------------|---------------|---------|
| **MySQL Server** | 8.0 or higher | `mysql --version` | [mysql.com](https://dev.mysql.com/downloads/mysql/) |

> 💡 **MySQL Workbench** (optional) provides a GUI for viewing the database: [mysql.com/workbench](https://www.mysql.com/products/workbench/)

### Verify All Prerequisites

Run these commands to check everything is ready:

```bash
node --version    # Should show: v18.x.x or higher
npm --version     # Should show: 9.x.x or higher
java -version     # Should show: openjdk version "17.x.x" or higher
mvn -version      # Should show: Apache Maven 3.8.x or higher
mysql --version   # Should show: mysql  Ver 8.x.x
```

---

## 📦 Installation & Setup

### Step 1 — Clone or Extract the Project

```bash
# If using Git:
git clone <repository-url>
cd tvk-technologies-training-portal

# If you have the ZIP file: extract it, then open a terminal inside the folder
```

### Step 2 — Install Angular (Frontend) Dependencies

```bash
npm install
```

> ⏳ This downloads Angular, Tailwind CSS, and all frontend packages into `node_modules/`. Takes 1–3 minutes on first run.

### Step 3 — Configure MySQL Connection

Open `backend/src/main/resources/application.properties` and update:

```properties
# ---- Update these 3 lines with YOUR MySQL details ----
spring.datasource.url=jdbc:mysql://localhost:3306/tvk_portal?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
```

| Setting | What to change |
|---------|---------------|
| `localhost:3306` | Change if MySQL runs on a different host/port |
| `tvk_portal` | Database name (auto-created on first run) |
| `root` | Your MySQL username |
| `YOUR_MYSQL_PASSWORD_HERE` | Your MySQL password |

> ✅ The database `tvk_portal` is **automatically created** — you do NOT need to run `CREATE DATABASE` manually.

### Step 4 — Build the Angular Frontend

```bash
npm run frontend:build
```

**Expected output:**
```
✔ Building...
Application bundle generation complete. [~15 seconds]
Output location: dist/browser
```

### Step 5 — Build the Spring Boot Backend

```bash
npm run backend:build
```

**Expected output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 30–60 seconds
[INFO] Final artifact: backend/target/tvk-portal.jar
```

---

## 🚀 Running the Application

### Production Mode (Recommended for First Run)

```bash
npm start
```

**Expected console output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.2.0)

[TVK] First run detected — seeding MySQL database with default data...
[TVK] ✅ Database seeded successfully!

===============================================
TVK TECHNOLOGIES TRAINING PORTAL RUNNING
Open browser: http://localhost:8080
API Base    : http://localhost:8080/api
===============================================
```

**Then open your browser at:** 🌐 **http://localhost:8080**

---

### Development Mode (Live Reload for Code Changes)

Open **TWO terminal windows** in the project folder:

**Terminal 1 — Start Spring Boot with live reload:**
```bash
npm run backend:dev
```

**Terminal 2 — Start Angular dev server with API proxy:**
```bash
npm run frontend:dev
```

Then open: 🌐 **http://localhost:4200**

> 📡 The Angular dev server automatically proxies all `/api/**` requests to Spring Boot on port 8080. This is configured in `proxy.conf.json`.

---

## 🔁 Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install Angular/npm dependencies |
| `npm run frontend:build` | Compile Angular → `dist/browser/` |
| `npm run frontend:dev` | Angular dev server on port 4200 (with API proxy) |
| `npm run backend:build` | Package Spring Boot → `backend/target/tvk-portal.jar` |
| `npm run backend:dev` | Spring Boot dev mode (Maven spring-boot:run) |
| `npm run backend:start` | Run the pre-built Spring Boot JAR |
| `npm run build` | Build **both** frontend and backend |
| `npm start` | Run the production Spring Boot server |
| `npm run clean` | Delete all build outputs |
| `npm run lint` | Run Angular linting |

---

## 🔑 Default Login Accounts

On the very first startup, the database is automatically populated with these seed accounts:

### 🔐 Password for all accounts: `password123`

| Role | Email Address | Name | What They Can Do |
|------|--------------|------|-----------------|
| 👑 **Admin** | `admin@tvktechs.com` | Global Registrar | Full access: manage all users, courses, inquiries, view logs |
| 🧑‍🏫 **Trainer** | `trainer.java@tvktechs.com` | Mr. Satish Raghavan | View & grade students in Java/Spring Boot courses |
| 🧑‍🏫 **Trainer** | `trainer.angular@tvktechs.com` | Ms. Priyanka Sen | View & grade students in Angular/Frontend courses |
| 🎓 **Student** | `rahul.b@gmail.com` | Rahul Bose | View own enrollments, progress, grades (account approved) |
| 🎓 **Student** | `ananya.r@gmail.com` | Ananya Rao | **⚠️ Pending admin approval** — cannot log in until approved |

### How to Approve Ananya's Account
1. Log in as `admin@tvktechs.com` / `password123`
2. Click **Dashboard** in the navigation bar
3. Go to the **Registered Users** tab
4. Find **Ananya Rao** → click the **✓ Accept** button
5. Now `ananya.r@gmail.com` can log in

---

## 📁 Project Structure

```
tvk-technologies-training-portal/
│
├── 📁 backend/                           ← Java Spring Boot Backend
│   ├── pom.xml                           ← Maven: dependencies, build, JAR config
│   └── src/
│       ├── main/
│       │   ├── java/com/tvk/portal/
│       │   │   │
│       │   │   ├── TvkPortalApplication.java     ← 🚀 App entry point (@SpringBootApplication)
│       │   │   │
│       │   │   ├── 📁 config/
│       │   │   │   ├── CorsConfig.java            ← CORS: allows port 4200 to call port 8080
│       │   │   │   ├── DataSeeder.java            ← Seeds MySQL tables on first startup
│       │   │   │   └── WebConfig.java             ← Serves Angular dist/ as static files
│       │   │   │
│       │   │   ├── 📁 model/                      ← JPA Entities (MySQL table definitions)
│       │   │   │   ├── User.java                  ← Table: users
│       │   │   │   ├── Course.java                ← Table: courses + 3 collection tables
│       │   │   │   ├── Enrollment.java            ← Table: enrollments
│       │   │   │   ├── ContactRequest.java        ← Table: contact_requests
│       │   │   │   └── SystemLog.java             ← Table: system_logs
│       │   │   │
│       │   │   ├── 📁 repository/                 ← Spring Data JPA Interfaces
│       │   │   │   ├── UserRepository.java        ← findByEmail, countByRole
│       │   │   │   ├── CourseRepository.java
│       │   │   │   ├── EnrollmentRepository.java  ← findByStudentId, existsByStudentAndCourse
│       │   │   │   ├── ContactRequestRepository.java
│       │   │   │   └── SystemLogRepository.java   ← findTop50ByOrderByIdDesc
│       │   │   │
│       │   │   ├── 📁 service/                    ← Business Logic Layer
│       │   │   │   ├── SseService.java            ← SSE emitter pool + heartbeat scheduler
│       │   │   │   ├── AuthService.java           ← Login validation + registration
│       │   │   │   ├── CourseService.java         ← Course CRUD + SSE broadcast
│       │   │   │   ├── EnrollmentService.java     ← Enrollment + progress/grade updates
│       │   │   │   ├── ContactService.java        ← Inquiry submit + admin respond
│       │   │   │   ├── UserService.java           ← User update + delete
│       │   │   │   └── AdminService.java          ← Dashboard stats aggregation
│       │   │   │
│       │   │   └── 📁 controller/                 ← REST API Layer
│       │   │       ├── AuthController.java        ← POST /api/auth/login, /register
│       │   │       ├── CourseController.java      ← GET/POST/DELETE /api/courses
│       │   │       ├── EnrollmentController.java  ← GET /api/enrollments, POST /api/enroll
│       │   │       ├── ContactController.java     ← GET /api/contacts, POST /api/contact
│       │   │       ├── UserController.java        ← POST /api/users/update, DELETE /api/users/{id}
│       │   │       ├── AdminController.java       ← GET /api/admin/dashboard
│       │   │       ├── SseController.java         ← GET /api/sync/stream (SSE endpoint)
│       │   │       ├── StatsController.java       ← GET /api/stats (Public dashboard statistics)
│       │   │       └── SpaController.java         ← Forwards Angular routes to index.html
│       │   │
│       │   └── resources/
│       │       └── application.properties         ← ⚠️ CONFIGURE MySQL credentials here
│       │
│       └── test/
│           └── java/com/tvk/portal/
│               └── TvkPortalApplicationTests.java
│
├── 📁 src/                               ← Angular 18 Frontend (unchanged)
│   ├── index.html                        ← Angular HTML entry point
│   ├── main.ts                           ← Angular bootstrap
│   ├── styles.css                        ← Global styles (Tailwind)
│   └── app/
│       ├── app.component.*              ← Root: navbar, login modal, toasts
│       ├── app.config.ts                ← Angular providers (HttpClient, Router)
│       ├── app.routes.ts                ← Client routes: /home, /courses, /contact, /dashboard
│       ├── models/
│       │   └── models.ts                ← TypeScript interfaces (User, Course, Enrollment...)
│       ├── services/
│       │   ├── data.service.ts          ← HTTP client + SSE EventSource listener
│       │   └── toast.service.ts         ← Toast notification popup service
│       └── components/
│           ├── home/                    ← Landing page component
│           ├── courses/                 ← Course catalog + enrollment
│           ├── contact/                 ← Contact form
│           └── dashboard/              ← Multi-role dashboard (Admin/Trainer/Student)
│
├── 📁 dist/                             ← Auto-generated after `npm run frontend:build`
│   └── browser/                         ← Compiled Angular files served by Spring Boot
│
├── proxy.conf.json                       ← Angular dev server → Spring Boot proxy config
├── angular.json                          ← Angular CLI workspace config
├── package.json                          ← npm scripts for combined frontend+backend builds
├── tsconfig.json                         ← TypeScript compiler config
├── tailwind.config.js                   ← Tailwind CSS config
└── README.md                            ← This file
```

---

## 🌐 REST API Reference

All endpoints are served by **Spring Boot on `http://localhost:8080`**.

### Authentication

#### `POST /api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@tvktechs.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "u-admin",
    "name": "Global Registrar",
    "email": "admin@tvktechs.com",
    "role": "admin",
    "approvalStatus": "approved",
    "createdAt": "2026-06-23T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Wrong password
- `403` — Account pending approval
- `404` — Email not found

---

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "mypassword",
  "role": "student",
  "contactNum": "+91 9999999999",
  "collegeName": "IIT Delhi",
  "branch": "Computer Science",
  "academicStatus": "Graduated",
  "courseId": "c-java-fullstack",
  "paymentMode": "UPI",
  "paymentTxnId": "TXN123456",
  "isInstituteMember": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "user": { "id": "u-1234567890", "name": "John Doe", "role": "student", ... }
}
```

---

### Courses

#### `GET /api/courses`
Returns all training courses with features, syllabus, and batch info.

**Response (200):**
```json
[
  {
    "id": "c-java-fullstack",
    "title": "Java with Angular: Professional Full Stack Developer",
    "description": "Our premier training program...",
    "duration": "12 Weeks",
    "trainerName": "Mr. Satish Raghavan & Ms. Priyanka Sen",
    "features": ["100% Job Guarantee", "Live Projects", ...],
    "syllabus": ["Core Java", "Spring Boot", ...],
    "batches": ["Weekend Batch (10 AM - 2 PM)", ...],
    "capacity": 30,
    "enrolledCount": 12,
    "isLive": true,
    "price": "$299"
  }
]
```

#### `POST /api/courses`
Create a new course OR update existing. Send `id` field to update.

#### `DELETE /api/courses/{id}`
Delete a course by ID.

---

### Enrollments

#### `GET /api/enrollments`
Get all enrollments.

#### `POST /api/enroll`
Enroll a student in a course.

**Request Body:**
```json
{ "studentId": "u-student1", "courseId": "c-java-fullstack" }
```

#### `POST /api/enrollment/update`
Update enrollment progress, grade, or feedback (Trainer action).

**Request Body:**
```json
{
  "enrollmentId": "e1",
  "progress": 75,
  "grade": "A",
  "feedback": "Excellent performance in Spring Boot concepts!"
}
```

---

### Contact Inquiries

#### `GET /api/contacts`
Get all contact inquiries (Admin only).

#### `POST /api/contact`
Submit a new inquiry from the contact form.

**Request Body:**
```json
{
  "name": "Kiran Kumar",
  "email": "kiran@gmail.com",
  "phone": "+91 9876543210",
  "subject": "Placement Assistance Query",
  "message": "I want to know about the job placement guarantee..."
}
```

#### `POST /api/contact/respond`
Mark an inquiry as read or replied (Admin action).

**Request Body:**
```json
{ "id": "cnt1", "status": "replied" }
```

---

### Statistics

#### `GET /api/stats`
Get high-level counters for students, trainers, courses, and total enrollments. Accessible by the landing page.

**Success Response (200):**
```json
{
  "students": 2,
  "trainers": 2,
  "courses": 3,
  "totalEnrollments": 2
}
```

---

### User Management (Admin)

#### `GET /api/admin/dashboard`
Get aggregated statistics for the admin dashboard.

**Response:**
```json
{
  "stats": {
    "students": 2,
    "trainers": 2,
    "courses": 3,
    "pendingInquiries": 1,
    "totalEnrollments": 2
  },
  "systemLog": [
    { "time": "2026-06-23T10:00:00Z", "event": "ENROLLMENT_MUTATED", "detail": "..." }
  ],
  "users": [ ... ]
}
```

#### `POST /api/users/update`
Partially update any user field.

**Request Body:**
```json
{
  "id": "u-student1",
  "approvalStatus": "approved",
  "paymentStatus": "paid",
  "batchNumber": "B-2026-WKND-1",
  "assignedTrainer": "Mr. Satish Raghavan"
}
```

#### `DELETE /api/users/{id}`
Permanently delete a user account.

---

### Real-Time SSE

#### `GET /api/sync/stream`
Server-Sent Events stream. Angular connects automatically on app load.

**Event Format:**
```json
{
  "type": "ENROLLMENT_MUTATED",
  "payload": { "enrollment": { ... } },
  "timestamp": "2026-06-23T10:30:00Z"
}
```

**Event Types:**
| Type | Trigger |
|------|---------|
| `REALTIME_ALERT` | Any important activity (shows toast notification) |
| `ENROLLMENT_MUTATED` | New enrollment or enrollment update |
| `COURSE_MUTATED` | Course created, updated, or deleted |
| `CONTACT_MUTATED` | New inquiry or inquiry status change |
| `USER_MUTATED` | User profile updated or deleted |
| `FEEDBACK_MUTATED` | Trainer adds grade or feedback |
| `SYSTEM_STATS_MUTATED` | Dashboard stats changed |

---

## 🗄️ MySQL Database Schema

Spring Boot/Hibernate **automatically creates** all tables on first run.

### Tables Overview

| Table | Records | Description |
|-------|---------|-------------|
| `users` | All roles | Students, trainers, admin accounts |
| `courses` | Courses | Training program catalog |
| `course_features` | Per-course | Feature bullet points (join table) |
| `course_syllabus` | Per-course | Syllabus topic list (join table) |
| `course_batches` | Per-course | Batch schedule info (join table) |
| `enrollments` | Per enrollment | Student-course relationship + progress |
| `contact_requests` | Inquiries | Contact form submissions |
| `system_logs` | Events | Admin activity audit log |

### Key Column Details

**`users` table:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR | Custom e.g. "u-admin", "u-1234567890" |
| `role` | VARCHAR | "student" / "trainer" / "admin" |
| `approval_status` | VARCHAR | "pending" / "approved" |
| `payment_status` | VARCHAR | "paid" / "unpaid" / "yet to pay" / "not interested" |
| `batch_number` | VARCHAR | e.g. "B-2026-WKND-1" |

**`enrollments` table:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR | Custom e.g. "e1", "e-1234567890" |
| `status` | VARCHAR | "pending" / "active" / "completed" |
| `progress` | INT | 0–100 percentage |

### Reset All Data

To wipe and re-seed the database:

```sql
-- In MySQL client:
DROP DATABASE tvk_portal;
```

Then restart the Spring Boot server — it will auto-create `tvk_portal` and re-seed all default data.

---

## 📡 Real-Time SSE System

The application uses **Server-Sent Events (SSE)** to push live updates to all connected browser tabs.

### How It Works

```
Admin changes data
       ↓
Spring Boot Service broadcasts event
       ↓
SseService.broadcast("EVENT_TYPE", payload)
       ↓
All connected SseEmitters receive the event
       ↓
Angular EventSource.onmessage fires
       ↓
DataService.handleSyncMessage() updates the reactive state
       ↓
Angular components re-render automatically
```

### Implementation
- Each browser tab creates a persistent connection to `/api/sync/stream`
- `SseService` maintains a `CopyOnWriteArrayList<SseEmitter>` of all active connections
- When data changes, all emitters receive the event simultaneously
- Heartbeat every 30 seconds prevents connection timeouts
- Dead connections are automatically cleaned up

---

## 🔍 Dashboard Features

### Admin — Registered Users Tab
| Feature | Description |
|---------|-------------|
| 🔍 **Text Search** | Search by name, email, phone, batch number, or assigned trainer |
| 💳 **Payment Filter** | Paid / Unpaid / Yet to Pay / Not Interested / Not Set |
| ✔ **Approval Filter** | Approved / Pending |
| 🗂 **Batch Filter** | Dynamic dropdown from actual batch data |
| 👤 **Role Filter** | Student / Trainer / Admin |
| 🏷️ **Active Pills** | Dismiss individual filters with × button |
| 📊 **Result Count** | "Showing X of Y users" |
| ↺ **Reset All** | Clears all filters at once |

### Admin — Inquiries Tab
| Feature | Description |
|---------|-------------|
| 🔍 **Search** | By name, email, phone, subject, or message content |
| 📊 **Status Tabs** | All / 🔴 Unread / 🟡 Read / ✅ Replied |

### Trainer Dashboard
| Feature | Description |
|---------|-------------|
| 🔍 **Search** | By student name, email, or course title |
| 📊 **Status Filter** | All / Active / Pending / Completed |

### Student Dashboard
| Feature | Description |
|---------|-------------|
| 📊 **Status Tabs** | All (count) / Active / Pending / Completed |

### Admin — Stats & Logs Tab
| Feature | Description |
|---------|-------------|
| 📊 **High-Level Counters** | Real-time totals for Students, Trainers, Courses, Enrollments, and Inquiries |
| 📡 **Activity Stream** | Scrollable live audit log of system mutations (registrations, enrollments, grading, inquiries) |

### Admin — Trainers Tab
| Feature | Description |
|---------|-------------|
| 🧑‍🏫 **Trainers Directory** | View all registered trainers, specializations, email addresses, and key technologies |
| 📝 **Edit Profile** | Inline form to update trainer name, specialization, email, and skills list |
| ❌ **Delete Trainer** | Remove trainer profile from database |

### Admin — Certificates Tab
| Feature | Description |
|---------|-------------|
| 📜 **Certificates Hub** | Course completion credential generator (Coming Soon) |

---

## ⚙️ Configuration Reference

Full contents of `backend/src/main/resources/application.properties`:

```properties
# =============================================
# TVK Technologies Portal - Spring Boot Config
# =============================================

# Server
server.port=8080

# ---- MySQL Database ----
spring.datasource.url=jdbc:mysql://localhost:3306/tvk_portal?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_mysql_password   # ← CHANGE THIS

# ---- JPA / Hibernate ----
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# ---- Jackson JSON ----
spring.jackson.default-property-inclusion=non_null

# ---- SSE / Async ----
spring.mvc.async.request-timeout=-1

# ---- Static Resources ----
spring.web.resources.static-locations=file:../dist/browser/,classpath:/static/
```

### Common Configuration Changes

| What to Change | Property | Example |
|---------------|---------|---------|
| Server port | `server.port` | `server.port=9090` |
| MySQL host | `spring.datasource.url` | Change `localhost:3306` |
| Show SQL queries | `spring.jpa.show-sql` | `spring.jpa.show-sql=true` |

---

## 🔧 Troubleshooting

### ❌ `java: command not found` or `mvn: command not found`

**Problem:** Java JDK or Maven not installed / not in system PATH.

**Fix:**
1. Download JDK 17 from https://adoptium.net and install it
2. Download Maven from https://maven.apache.org/download.cgi
3. Add Maven `bin/` folder to your system PATH
4. Restart your terminal and re-run `java -version` and `mvn -version`

---

### ❌ `BUILD FAILURE` when running `npm run backend:build`

**Problem:** Java version too old, or compilation errors.

**Fix:**
```bash
java -version   # Must show 17.x.x or higher
```
If Java is below 17, install JDK 17 from https://adoptium.net

---

### ❌ Cannot connect to MySQL — `Access denied` or `Connection refused`

**Problem:** Wrong credentials or MySQL not running.

**Fix:**
1. Make sure MySQL is running: open MySQL Workbench or run `mysql -u root -p`
2. Check your password is correct
3. Update `application.properties` with the correct username/password
4. Make sure MySQL is on port 3306 (or update the URL)

---

### ❌ `Port 8080 already in use`

**Problem:** Another application is using port 8080.

**Fix:** Edit `application.properties`:
```properties
server.port=9090   # Change to any available port
```
Then rebuild and restart. Access at `http://localhost:9090`

---

### ❌ Blank white page at `http://localhost:8080`

**Problem:** Angular build output missing.

**Fix:**
```bash
npm run frontend:build   # Compile Angular first
npm start                # Then restart the server
```

---

### ❌ `npm run backend:dev` fails with "No plugin found for prefix 'spring-boot'"

**Problem:** Maven cannot find the Spring Boot plugin.

**Fix:** Run Maven from the backend directory explicitly:
```bash
cd backend
mvn spring-boot:run
cd ..
```

---

### ❌ Login shows "Account pending approval"

**Problem:** Newly registered accounts need admin approval.

**Fix:**
1. Log in as `admin@tvktechs.com` / `password123`
2. Go to **Dashboard → Registered Users tab**
3. Find the user → click the green **✓ Accept** button

---

### ❌ Real-time SSE not working (no live updates)

**Problem:** SSE connection dropped or CORS issue.

**Fix:**
- Check browser console for `EventSource` errors
- Ensure Spring Boot is running on port 8080
- In development mode, ensure you're using `http://localhost:4200` (not 8080)

---

## 👨‍💻 Developer Notes

### Adding a New API Endpoint

1. Add method to the appropriate **Service** class in `backend/.../service/`
2. Add `@GetMapping`/`@PostMapping` in the corresponding **Controller** class
3. No changes needed in Angular if the path follows existing `/api/...` pattern

### Adding a New User Field

1. Add field to `User.java` entity (it will auto-add the MySQL column on restart)
2. Update `UserService.java` `updateUser()` method to handle the new field
3. Update `DataSeeder.java` if the seed data needs it
4. Angular `User` interface in `models.ts` may need updating

### Changing the Database

To switch from MySQL to another database:
1. Replace `mysql-connector-j` in `pom.xml` with the new JDBC driver
2. Update `spring.datasource.url` in `application.properties`
3. Update `spring.jpa.properties.hibernate.dialect` to the appropriate dialect

---

## 📄 License

© 2026 TVK Technologies. All Rights Reserved.

This project was built as a training demonstration for TVK Technologies' internal programs covering Java Spring Boot, Angular, MySQL, and full-stack development best practices.
