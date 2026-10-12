import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { User, Enrollment, ContactRequest, Course } from "../models/models";
import { ToastService } from "./toast.service";

export const INITIAL_COURSES: Course[] = [
  {
    id: "c-java-fullstack-angular",
    title: "Java Full Stack with Angular",
    description: "Enterprise Java 21 & Spring Boot 3 paired with modern Angular 18 reactive SPA architecture, JPA/Hibernate, REST APIs, and microservices.",
    duration: "12 Weeks (Weekday & Weekend)",
    trainerName: "Mr. Satish Raghavan (Sr. Java Architect)",
    trainer: "Mr. Satish Raghavan (Sr. Java Architect)",
    price: "₹34,999",
    fee: 34999,
    emiPrice: "₹2,916/mo",
    rating: 4.95,
    ratingCount: 2450,
    level: "Beginner to Advanced",
    mode: "Classroom & Live Online",
    category: "Full Stack",
    badge: "100% Placement Guarantee",
    capacity: 30,
    enrolledCount: 22,
    isLive: true,
    batches: [
      "Starting Next Monday • Weekday (7:00 PM - 9:00 PM)",
      "Upcoming Saturday • Weekend (10:00 AM - 2:00 PM)"
    ],
    features: [
      "100% Job Placement Guarantee",
      "Real-time Enterprise Microservices Labs",
      "1-on-1 Mock Technical Interviews",
      "Classroom (BLR/CHN) & Hybrid"
    ],
    syllabus: [
      "Core Java 21 (OOPs, Collections, Streams, Concurrency)",
      "Spring Boot 3, Spring Data JPA & Hibernate",
      "Microservices, REST APIs, Docker & JWT Auth",
      "Angular 18, RxJS, Signals & Reactive Architecture",
      "CI/CD, AWS Deployment & Live Capstone Project"
    ],
    projects: [
      "Enterprise E-Commerce Microservices Architecture",
      "Real-Time Banking & Payment Gateway Service",
      "Cloud-Native CI/CD DevOps Automated Deployment"
    ]
  },
  {
    id: "c-java-fullstack-react",
    title: "Java Full Stack with React",
    description: "Build scalable cloud microservices in Spring Boot 3 paired with reactive, high-performance React 18 frontend with Redux Toolkit and Next.js.",
    duration: "12 Weeks (Weekday & Weekend)",
    trainerName: "Mr. Satish Raghavan & Ms. Priyanka Sen",
    trainer: "Mr. Satish Raghavan & Ms. Priyanka Sen",
    price: "₹34,999",
    fee: 34999,
    emiPrice: "₹2,916/mo",
    rating: 4.92,
    ratingCount: 1820,
    level: "Beginner to Advanced",
    mode: "Classroom & Live Online",
    category: "Full Stack",
    badge: "High Demand",
    capacity: 30,
    enrolledCount: 24,
    isLive: true,
    batches: [
      "Starting Next Monday • Weekday (7:00 AM - 9:00 AM)",
      "Upcoming Saturday • Weekend (2:30 PM - 6:30 PM)"
    ],
    features: [
      "100% Placement Support",
      "Full Stack Microservices Architecture",
      "React 18 & Next.js App Router",
      "AWS & Docker Cloud Deployment"
    ],
    syllabus: [
      "Core Java 21 & Advanced Multithreading",
      "Spring Boot 3 Microservices & API Gateway",
      "React 18, Hooks, Context API & Redux Toolkit",
      "PostgreSQL, Redis & Kafka Messaging",
      "End-to-End Cloud Deployment on AWS"
    ],
    projects: [
      "Multi-tenant SaaS Workflow Engine",
      "Distributed Event-Driven Order Processing",
      "Next.js Customer Portal with SSR"
    ]
  },
  {
    id: "c-spring-microservices",
    title: "Enterprise Java & Spring Boot Microservices",
    description: "Deep dive into production-grade microservices with Spring Cloud, OAuth2, Kafka event streaming, and scalable Docker/Kubernetes container deployments.",
    duration: "8 Weeks (Weekday & Weekend)",
    trainerName: "Mr. Vikramaditya Rao (Lead Enterprise Architect)",
    trainer: "Mr. Vikramaditya Rao (Lead Enterprise Architect)",
    price: "₹29,999",
    fee: 29999,
    emiPrice: "₹2,499/mo",
    rating: 4.94,
    ratingCount: 1420,
    level: "Intermediate to Advanced",
    mode: "Classroom & Live Online",
    category: "Backend",
    badge: "Enterprise Specialization",
    capacity: 25,
    enrolledCount: 14,
    isLive: true,
    batches: [
      "Starting Next Monday • Weekday (8:00 PM - 10:00 PM)",
      "Upcoming Saturday • Weekend (10:00 AM - 2:00 PM)"
    ],
    features: [
      "Distributed Systems & Kafka",
      "Spring Security 6 with OAuth2 & JWT",
      "Docker & Kubernetes Orchestration",
      "System Design & Mock Drills"
    ],
    syllabus: [
      "Spring Boot 3 Internals & Spring Data JPA",
      "Service Discovery, Eureka & API Gateway",
      "Distributed Tracing (Micrometer & Zipkin)",
      "Event-Driven Architecture with Apache Kafka",
      "Production CI/CD with GitHub Actions & Docker"
    ],
    projects: [
      "High-Throughput Financial Ledger Service",
      "Distributed Stock Brokerage Order Engine",
      "Resilient Microservices with Resilience4j"
    ]
  },
  {
    id: "c-cloud-devops",
    title: "Cloud DevOps, Docker & Kubernetes for Java Developers",
    description: "Master modern containerization, CI/CD automated deployment pipelines, AWS cloud infrastructure, Terraform, and Kubernetes orchestration.",
    duration: "6 Weeks (Weekend)",
    trainerName: "Mr. Arun Prakash (Cloud Infrastructure Lead)",
    trainer: "Mr. Arun Prakash (Cloud Infrastructure Lead)",
    price: "₹28,999",
    fee: 28999,
    emiPrice: "₹2,416/mo",
    rating: 4.88,
    ratingCount: 890,
    level: "Intermediate",
    mode: "Classroom & Live Online",
    category: "Backend",
    badge: "Cloud Certified",
    capacity: 25,
    enrolledCount: 16,
    isLive: true,
    batches: [
      "Upcoming Saturday • Weekend (2:30 PM - 6:30 PM)",
      "Starting Next Tuesday • Weekday (7:00 AM - 9:00 AM)"
    ],
    features: [
      "Hands-on AWS & Terraform Labs",
      "Kubernetes Cluster Deployment",
      "Zero-Downtime CI/CD Blue/Green",
      "Cloud Security & Monitoring"
    ],
    syllabus: [
      "Docker Containerization & Multi-stage Builds",
      "Kubernetes Pods, Deployments & Ingress Controllers",
      "AWS Core Services (EC2, S3, RDS, EKS, IAM)",
      "CI/CD with GitHub Actions & Jenkins",
      "Monitoring with Prometheus & Grafana"
    ],
    projects: [
      "Automated GitOps CI/CD Deployment Pipeline",
      "High-Availability Kubernetes Microservices Cluster",
      "Infrastructure-as-Code with Terraform on AWS"
    ]
  },
  {
    id: "c-angular-specialist",
    title: "Angular 18 Specialist & Reactive Architecture",
    description: "Master modern reactive web architecture using Angular Signals, standalone components, RxJS stream patterns, NgRx state management, and Tailwind CSS.",
    duration: "8 Weeks (Weekday & Weekend)",
    trainerName: "Ms. Swathi Sundaram (Staff Frontend Architect)",
    trainer: "Ms. Swathi Sundaram (Staff Frontend Architect)",
    price: "₹24,999",
    fee: 24999,
    emiPrice: "₹2,083/mo",
    rating: 4.91,
    ratingCount: 1150,
    level: "Beginner to Advanced",
    mode: "Classroom & Live Online",
    category: "Frontend",
    badge: "Trending",
    capacity: 25,
    enrolledCount: 18,
    isLive: true,
    batches: [
      "Starting Next Monday • Weekday (6:30 PM - 8:30 PM)",
      "Upcoming Sunday • Weekend (10:00 AM - 2:00 PM)"
    ],
    features: [
      "Angular 18 Signals & Standalone Components",
      "RxJS Reactive Stream Patterns",
      "Tailwind CSS & Component Design Systems",
      "Live Production App Build"
    ],
    syllabus: [
      "TypeScript Fundamentals & Modern ESNext",
      "Angular 18 Standalone Components & Directives",
      "RxJS Operators & Reactive Form Architecture",
      "State Management with NgRx & Signals",
      "Performance Tuning, Lazy Loading & SSR"
    ],
    projects: [
      "Enterprise SaaS Analytics & Reporting Dashboard",
      "Real-Time Collaboration Board with WebSockets",
      "Design System & UI Component Library"
    ]
  },
  {
    id: "c-react-modern",
    title: "React 18 & Next.js Modern Full Stack",
    description: "Build reactive, blazing fast web applications with React 18, Next.js App Router, Redux Toolkit, TypeScript, Tailwind CSS, and Server Components.",
    duration: "8 Weeks (Weekday & Weekend)",
    trainerName: "Ms. Priyanka Sen (Frontend UX Specialist)",
    trainer: "Ms. Priyanka Sen (Frontend UX Specialist)",
    price: "₹24,999",
    fee: 24999,
    emiPrice: "₹2,083/mo",
    rating: 4.89,
    ratingCount: 960,
    level: "Beginner to Advanced",
    mode: "Classroom & Live Online",
    category: "Frontend",
    badge: "High Demand",
    capacity: 25,
    enrolledCount: 13,
    isLive: true,
    batches: [
      "Starting Next Tuesday • Weekday (7:00 AM - 9:00 AM)",
      "Upcoming Saturday • Weekend (10:00 AM - 2:00 PM)"
    ],
    features: [
      "React 18 Hooks & Next.js Server Components",
      "State Management with Redux Toolkit & Zustand",
      "REST & GraphQL Integration",
      "Full Stack Deployment on Vercel & AWS"
    ],
    syllabus: [
      "Modern JavaScript ES6+ & TypeScript",
      "React 18 Core, Hooks & Custom Hook Design",
      "Next.js 14 App Router, SSR, SSG & ISR",
      "Redux Toolkit, RTK Query & State Hydration",
      "Testing with Jest, React Testing Library & Vitest"
    ],
    projects: [
      "Next.js E-Commerce Platform with Server Actions",
      "Real-Time Chat App with Socket.io & Redis",
      "Admin Analytics Dashboard with Chart.js"
    ]
  }
];

@Injectable({
  providedIn: "root",
})
export class DataService {
  private registerModalTrigger = new Subject<string>();
  public registerModalTrigger$ = this.registerModalTrigger.asObservable();

  triggerRegisterModal(courseId = ""): void {
    this.registerModalTrigger.next(courseId);
  }

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  public enrollments$ = this.enrollmentsSubject.asObservable();

  private contactRequestsSubject = new BehaviorSubject<ContactRequest[]>([]);
  public contactRequests$ = this.contactRequestsSubject.asObservable();

  private coursesSubject = new BehaviorSubject<Course[]>(INITIAL_COURSES);
  public courses$ = this.coursesSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();



  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  private statsSubject = new BehaviorSubject({
    students: 2500,
    trainers: 12,
    courses: 8,
    pendingInquiries: 0,
    totalEnrollments: 340,
  });
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient, private toastService: ToastService) {
    if (typeof window !== "undefined") {
      // Dark Mode initialization
      const savedTheme = localStorage.getItem("tvk_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
      this.setDarkMode(isDark);

      const savedUser = localStorage.getItem("tvk_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUserSubject.next(user);
          if (user.role === "admin" || user.role === "frontdesk") {
            this.fetchAdminDashboard();
            this.loadContacts();
          }
        } catch (e) {
          console.error("Failed to parse saved user", e);
        }
      }
    }
    this.loadCourses();
    this.loadEnrollments();
    this.loadStats();
    this.initRealtimeSync();
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkModeSubject.value);
  }

  setDarkMode(enable: boolean): void {
    this.isDarkModeSubject.next(enable);
    if (typeof window !== "undefined") {
      if (enable) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("tvk_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("tvk_theme", "light");
      }
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem("tvk_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tvk_user");
    }
    this.currentUserSubject.next(user);
    if (user?.role === "admin" || user?.role === "frontdesk") {
      this.fetchAdminDashboard();
      this.loadContacts();
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  loadStats(): void {
    this.http.get<any>("/api/stats").subscribe({
      next: (stats) => {
        this.statsSubject.next({
          ...this.statsSubject.value,
          ...stats,
        });
      },
      error: (err) => console.error("Failed to load stats", err),
    });
  }

  enrichCourse(c: Course): Course {
    let category: any = "Full Stack";
    let badge: any = "Job Guaranteed";
    let rating = 4.9;
    let ratingCount = 1280;
    let level = "Beginner to Advanced";
    let mode = "Classroom (BLR/CHN) & Live Online";
    let price = c.price || "₹34,999";
    let emiPrice = "₹2,916/mo";
    let projects = [
      "Enterprise E-Commerce Microservices Architecture",
      "Real-Time Banking & Payment Gateway Gateway Service",
      "Cloud-Native CI/CD DevOps Automated Deployment"
    ];

    const titleLower = (c.title || "").toLowerCase();
    if (titleLower.includes("angular") || titleLower.includes("react")) {
      category = "Frontend";
      badge = "Trending";
      rating = 4.85;
      ratingCount = 890;
      price = (!price || price.startsWith("$")) ? "₹24,999" : price;
      emiPrice = "₹2,083/mo";
    } else if (titleLower.includes("spring") || titleLower.includes("micro")) {
      category = "Backend";
      badge = "High Demand";
      rating = 4.92;
      ratingCount = 1140;
      price = (!price || price.startsWith("$")) ? "₹29,999" : price;
      emiPrice = "₹2,499/mo";
    } else if (titleLower.includes("data") || titleLower.includes("ai")) {
      category = "AI & Data";
      badge = "Bestseller";
      rating = 4.95;
      ratingCount = 1620;
      price = (!price || price.startsWith("$")) ? "₹34,999" : price;
      emiPrice = "₹2,916/mo";
    } else if (titleLower.includes("devops") || titleLower.includes("cloud")) {
      category = "Cloud & DevOps";
      badge = "High Demand";
      rating = 4.9;
      ratingCount = 760;
      price = (!price || price.startsWith("$")) ? "₹28,999" : price;
      emiPrice = "₹2,416/mo";
    } else if (titleLower.includes("qa") || titleLower.includes("testing")) {
      category = "Testing";
      badge = "Fast Track";
      rating = 4.8;
      ratingCount = 640;
      price = (!price || price.startsWith("$")) ? "₹19,999" : price;
      emiPrice = "₹1,666/mo";
    } else if (titleLower.includes("full stack") || titleLower.includes("java")) {
      category = "Full Stack";
      badge = "100% Placement Guarantee";
      rating = 4.98;
      ratingCount = 2450;
      price = (!price || price.startsWith("$")) ? "₹39,999" : price;
      emiPrice = "₹3,333/mo";
    }

    // Compute numeric fee
    const numericFee = parseInt(price.replace(/[^0-9]/g, ""), 10) || 34999;

    return {
      ...c,
      price,
      fee: c.fee || numericFee,
      trainer: c.trainer || c.trainerName || "Senior Enterprise Architect",
      emiPrice: c.emiPrice || emiPrice,
      rating: c.rating || rating,
      ratingCount: c.ratingCount || ratingCount,
      level: c.level || level,
      mode: c.mode || mode,
      category: c.category || category,
      badge: c.badge || badge,
      projects: c.projects && c.projects.length ? c.projects : projects
    };
  }

  loadCourses(): void {
    this.http.get<Course[]>("/api/courses").subscribe({
      next: (courses) => {
        if (courses && courses.length >= 6) {
          const enriched = courses.map((c) => this.enrichCourse(c));
          this.coursesSubject.next(enriched);
        } else if (courses && courses.length > 0) {
          // Merge API courses with canonical INITIAL_COURSES
          const existingIds = new Set(courses.map(c => c.id));
          const combined = [
            ...courses.map(c => this.enrichCourse(c)),
            ...INITIAL_COURSES.filter(c => !existingIds.has(c.id))
          ];
          this.coursesSubject.next(combined);
        } else {
          this.coursesSubject.next(INITIAL_COURSES);
        }
        const currentStats = this.statsSubject.value;
        this.statsSubject.next({
          ...currentStats,
          courses: this.coursesSubject.value.length,
        });
      },
      error: (err) => {
        console.warn("Could not fetch remote courses; using local verified catalogue.", err);
        this.coursesSubject.next(INITIAL_COURSES);
      },
    });
  }

  loadEnrollments(): void {
    this.http.get<Enrollment[]>("/api/enrollments").subscribe({
      next: (enrollments) => {
        this.enrollmentsSubject.next(enrollments);
        const currentStats = this.statsSubject.value;
        this.statsSubject.next({
          ...currentStats,
          totalEnrollments: enrollments.length,
        });
      },
      error: (err) => console.error("Failed to load enrollments", err),
    });
  }

  loadContacts(): void {
    this.http.get<ContactRequest[]>("/api/contacts").subscribe({
      next: (contacts) => {
        this.contactRequestsSubject.next(contacts);
        const currentStats = this.statsSubject.value;
        this.statsSubject.next({
          ...currentStats,
          pendingInquiries: contacts.filter((c) => c.status === "unread").length,
        });
      },
      error: (err) => console.error("Failed to load contact requests", err),
    });
  }

  fetchAdminDashboard(): void {
    const user = this.getCurrentUser();
    if (user?.role === "admin" || user?.role === "frontdesk") {
      this.http.get<any>("/api/admin/dashboard").subscribe({
        next: (res) => {
          if (res?.stats) {
            this.statsSubject.next({
              ...this.statsSubject.value,
              ...res.stats,
            });
          }

          if (res?.users) {
            this.usersSubject.next(res.users);
          }
        },
        error: (err) => console.error("Failed to fetch admin stats", err),
      });
    }
  }

  login(email: string, password?: string): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>("/api/auth/login", { email, password }).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.setCurrentUser(res.user);
        }
      })
    );
  }

  updateUser(userData: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>("/api/users/update", userData).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  setStaffAttendance(userId: string, status: "ON_DUTY" | "ON_LEAVE" | "OFF", leaveReason?: string): Observable<{ success: boolean; user: User }> {
    return this.updateUser({
      id: userId,
      attendanceStatus: status,
      leaveReason: leaveReason || (status === "ON_DUTY" ? "" : "Day off"),
      lastAttendanceUpdate: new Date().toISOString()
    });
  }

  bulkAllocateLeads(leadIds: string[], counselorName: string, counselorId?: string, allocatedDate?: string): Observable<any> {
    const todayStr = allocatedDate || new Date().toISOString().split("T")[0];
    const updateObservables = leadIds.map(id =>
      this.http.post<any>("/api/users/update", {
        id,
        assignedCounselor: counselorName,
        assignedCounselorId: counselorId,
        allocatedDate: todayStr
      })
    );
    // Execute updates
    return new Observable(observer => {
      let completed = 0;
      let hasError = false;
      if (leadIds.length === 0) {
        observer.next({ success: true, count: 0 });
        observer.complete();
        return;
      }
      leadIds.forEach(id => {
        this.http.post<any>("/api/users/update", {
          id,
          assignedCounselor: counselorName,
          assignedCounselorId: counselorId,
          allocatedDate: todayStr
        }).subscribe({
          next: () => {
            completed++;
            if (completed === leadIds.length && !hasError) {
              this.fetchAdminDashboard();
              observer.next({ success: true, count: completed });
              observer.complete();
            }
          },
          error: (err) => {
            hasError = true;
            observer.error(err);
          }
        });
      });
    });
  }

  redistributeCounselorLeads(fromCounselorName: string, targetCounselors: Array<{ name: string; id: string }>): Observable<any> {
    const allUsers = this.usersSubject.value;
    const leadsToReassign = allUsers.filter(u =>
      u.role === "student" &&
      u.assignedCounselor === fromCounselorName &&
      (!u.followUpStatus || u.followUpStatus === "Need to Contact" || u.followUpStatus === "Follow-up Needed")
    );

    if (leadsToReassign.length === 0 || targetCounselors.length === 0) {
      return new Observable(obs => {
        obs.next({ success: true, count: 0, message: "No active leads found to redistribute." });
        obs.complete();
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    return new Observable(observer => {
      let completed = 0;
      let hasError = false;
      leadsToReassign.forEach((lead, idx) => {
        const target = targetCounselors[idx % targetCounselors.length];
        this.http.post<any>("/api/users/update", {
          id: lead.id,
          assignedCounselor: target.name,
          assignedCounselorId: target.id,
          allocatedDate: todayStr,
          followUpNotes: (lead.followUpNotes ? lead.followUpNotes + "\n" : "") + `[Reassigned from ${fromCounselorName} on ${todayStr}]`
        }).subscribe({
          next: () => {
            completed++;
            if (completed === leadsToReassign.length && !hasError) {
              this.fetchAdminDashboard();
              observer.next({ success: true, count: completed });
              observer.complete();
            }
          },
          error: (err) => {
            hasError = true;
            observer.error(err);
          }
        });
      });
    });
  }

  approveCandidate(userId: string, approvedBy = "Admissions Desk"): Observable<{ success: boolean; user: User; tempPassword?: string; expiresAt?: string; message?: string }> {
    const operatorRole = this.getCurrentUser()?.role || "admin";
    const operatorName = this.getCurrentUser()?.name || approvedBy;
    return this.http.post<{ success: boolean; user: User; tempPassword?: string; expiresAt?: string; message?: string }>("/api/users/approve", {
      id: userId,
      userId,
      operatorRole,
      approvedBy: operatorName
    }).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  rejectCandidate(userId: string, reason?: string, rejectedBy = "Admissions Desk"): Observable<{ success: boolean; user: User; message?: string }> {
    const operatorRole = this.getCurrentUser()?.role || "admin";
    const operatorName = this.getCurrentUser()?.name || rejectedBy;
    return this.http.post<{ success: boolean; user: User; message?: string }>("/api/users/reject", {
      id: userId,
      userId,
      reason,
      operatorRole,
      rejectedBy: operatorName
    }).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  regenerateTempPassword(userId: string): Observable<{ success: boolean; user: User; tempPassword?: string; expiresAt?: string; message?: string }> {
    const operatorRole = this.getCurrentUser()?.role || "admin";
    const operatorName = this.getCurrentUser()?.name || "Admissions Desk";
    return this.http.post<{ success: boolean; user: User; tempPassword?: string; expiresAt?: string; message?: string }>("/api/users/regenerate-temp-password", {
      id: userId,
      userId,
      operatorRole,
      operatorName
    }).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/users/${id}`).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  transitionUserRole(payload: {
    userId: string;
    newRole: string;
    designation?: string;
    department?: string;
    employeeId?: string;
    specialization?: string;
    strongTechnologies?: string;
    notes?: string;
  }): Observable<{ success: boolean; user: User; message: string }> {
    const operatorRole = this.getCurrentUser()?.role || "admin";
    const operatorName = this.getCurrentUser()?.name || "Global Administrator";
    return this.http.post<{ success: boolean; user: User; message: string }>("/api/users/transition-role", {
      ...payload,
      id: payload.userId,
      operatorRole,
      operatorName,
    }).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  register(userData: any): Observable<{ success: boolean; user: User; message?: string }> {
    return this.http.post<{ success: boolean; user: User; message?: string }>("/api/auth/register", userData);
  }

  sendOtp(email: string): Observable<{ success: boolean; message: string; otp?: string; expiresInSeconds?: number }> {
    return this.http.post<{ success: boolean; message: string; otp?: string; expiresInSeconds?: number }>("/api/auth/send-otp", { email });
  }

  verifyOtp(email: string, otp: string): Observable<{ success: boolean; message: string; verified?: boolean }> {
    return this.http.post<{ success: boolean; message: string; verified?: boolean }>("/api/auth/verify-otp", { email, otp });
  }

  requestTempPassword(email: string): Observable<{ success: boolean; tempPassword?: string; message: string; name?: string }> {
    return this.http.post<{ success: boolean; tempPassword?: string; message: string; name?: string }>("/api/auth/temp-password", { email });
  }

  changePassword(email: string, currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string; user?: User }> {
    return this.http.post<{ success: boolean; message: string; user?: User }>("/api/auth/change-password", { email, currentPassword, newPassword }).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.setCurrentUser(res.user);
        }
      })
    );
  }

  createUserByAdmin(userData: any): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>("/api/auth/register", userData).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  enrollInCourse(studentId: string, courseId: string): Observable<any> {
    return this.http.post<any>("/api/enroll", { studentId, courseId }).pipe(
      tap(() => {
        this.loadEnrollments();
        this.loadCourses();
      })
    );
  }

  updateEnrollment(enrollmentId: string, progress: number, grade: string, feedback: string): Observable<any> {
    return this.http.post<any>("/api/enrollment/update", { enrollmentId, progress, grade, feedback }).pipe(
      tap(() => {
        this.loadEnrollments();
      })
    );
  }

  submitContactRequest(contact: any): Observable<any> {
    return this.http.post<any>("/api/contact", contact).pipe(
      tap(() => {
        this.loadContacts();
      })
    );
  }

  respondToContact(id: string, status: string): Observable<any> {
    return this.http.post<any>("/api/contact/respond", { id, status }).pipe(
      tap(() => {
        this.loadContacts();
      })
    );
  }

  createOrEditCourse(course: any): Observable<any> {
    return this.http.post<any>("/api/courses", course).pipe(
      tap(() => {
        this.loadCourses();
      })
    );
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete<any>(`/api/courses/${id}`).pipe(
      tap(() => {
        this.loadCourses();
      })
    );
  }

  private initRealtimeSync(): void {
    if (typeof window !== "undefined") {
      const eventSource = new EventSource("/api/sync/stream");

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleSyncMessage(message);
        } catch (e) {
          console.error("Failed to parse SSE sync message:", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE sync stream connection error:", err);
      };
    }
  }

  private handleSyncMessage(message: any): void {
    const { type, payload } = message;

    switch (type) {
      case "REALTIME_ALERT":
        if (payload?.message) {
          const isRegistrationAlert = payload.message.includes("registered") || payload.message.includes("approve");
          const user = this.getCurrentUser();
          if (isRegistrationAlert) {
            if (user?.role === "admin") {
              this.toastService.showInfo(payload.message);
            }
          } else {
            this.toastService.showInfo(payload.message);
          }
        }
        break;

      case "ENROLLMENT_MUTATED":
        if (payload?.enrollment) {
          const current = this.enrollmentsSubject.value;
          const idx = current.findIndex((e) => e.id === payload.enrollment.id);
          if (idx !== -1) {
            current[idx] = payload.enrollment;
            this.enrollmentsSubject.next([...current]);
          } else {
            this.enrollmentsSubject.next([...current, payload.enrollment]);
          }
          const currentStats = this.statsSubject.value;
          this.statsSubject.next({
            ...currentStats,
            totalEnrollments: this.enrollmentsSubject.value.length,
          });
        }
        break;

      case "COURSE_MUTATED":
        if (payload?.course) {
          const current = this.coursesSubject.value;
          const idx = current.findIndex((c) => c.id === payload.course.id);
          if (idx !== -1) {
            current[idx] = payload.course;
            this.coursesSubject.next([...current]);
          } else {
            this.coursesSubject.next([...current, payload.course]);
          }
        } else if (payload?.deletedId) {
          const current = this.coursesSubject.value;
          this.coursesSubject.next(current.filter((c) => c.id !== payload.deletedId));
        }
        const currentStats = this.statsSubject.value;
        this.statsSubject.next({
          ...currentStats,
          courses: this.coursesSubject.value.length,
        });
        break;

      case "CONTACT_MUTATED":
        if (payload?.contact) {
          const current = this.contactRequestsSubject.value;
          const idx = current.findIndex((c) => c.id === payload.contact.id);
          if (idx !== -1) {
            current[idx] = payload.contact;
            this.contactRequestsSubject.next([...current]);
          } else {
            this.contactRequestsSubject.next([...current, payload.contact]);
          }
        } else if (payload?.contactId && payload?.updatedStatus) {
          const current = this.contactRequestsSubject.value;
          const idx = current.findIndex((c) => c.id === payload.contactId);
          if (idx !== -1) {
            current[idx] = { ...current[idx], status: payload.updatedStatus };
            this.contactRequestsSubject.next([...current]);
          }
        }
        this.statsSubject.next({
          ...this.statsSubject.value,
          pendingInquiries: this.contactRequestsSubject.value.filter((c) => c.status === "unread").length,
        });
        break;

      case "FEEDBACK_MUTATED":
        if (payload?.enrollmentId && payload?.updated) {
          const current = this.enrollmentsSubject.value;
          const idx = current.findIndex((e) => e.id === payload.enrollmentId);
          if (idx !== -1) {
            current[idx] = payload.updated;
            this.enrollmentsSubject.next([...current]);
          }
        }
        break;

      case "SYSTEM_STATS_MUTATED":
        this.fetchAdminDashboard();
        this.loadStats();
        break;

      case "USER_MUTATED":
        if (payload?.user) {
          const current = this.usersSubject.value;
          const idx = current.findIndex((u) => u.id === payload.user.id);
          if (idx !== -1) {
            current[idx] = payload.user;
            this.usersSubject.next([...current]);
          } else {
            this.usersSubject.next([...current, payload.user]);
          }
        } else if (payload?.deletedId) {
          const current = this.usersSubject.value;
          this.usersSubject.next(current.filter((u) => u.id !== payload.deletedId));
        }
        break;
    }
  }
}
