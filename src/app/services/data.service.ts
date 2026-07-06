import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { User, Enrollment, ContactRequest, Course } from "../models/models";
import { ToastService } from "./toast.service";

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

  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();



  private statsSubject = new BehaviorSubject({
    students: 0,
    trainers: 0,
    courses: 0,
    pendingInquiries: 0,
    totalEnrollments: 0,
  });
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient, private toastService: ToastService) {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("tvk_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUserSubject.next(user);
          if (user.role === "admin") {
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

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem("tvk_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tvk_user");
    }
    this.currentUserSubject.next(user);
    if (user?.role === "admin") {
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

  loadCourses(): void {
    this.http.get<Course[]>("/api/courses").subscribe({
      next: (courses) => {
        this.coursesSubject.next(courses);
        const currentStats = this.statsSubject.value;
        this.statsSubject.next({
          ...currentStats,
          courses: courses.length,
        });
      },
      error: (err) => console.error("Failed to load courses", err),
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
    if (user?.role === "admin") {
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

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/users/${id}`).pipe(
      tap(() => {
        this.fetchAdminDashboard();
      })
    );
  }

  register(userData: any): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>("/api/auth/register", userData).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.setCurrentUser(res.user);
        }
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
