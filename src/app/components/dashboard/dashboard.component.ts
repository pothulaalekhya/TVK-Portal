import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { ToastService } from "../../services/toast.service";
import { User, Enrollment, Course, ContactRequest } from "../../models/models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  enrollments: Enrollment[] = [];
  courses: Course[] = [];
  stats = {
    students: 0,
    trainers: 0,
    courses: 0,
    pendingInquiries: 0,
    totalEnrollments: 0,
  };

  // Student specific
  userEnrollments: Enrollment[] = [];

  // Trainer specific
  trainerCourses: Course[] = [];
  trainerEnrollments: Enrollment[] = [];
  filterTrainerOnly = true;

  // Trainer editing enrollment state
  editingEnrollment: Enrollment | null = null;
  editProgress = 0;
  editGrade = "";
  editFeedback = "";
  isSavingEnrollment = false;

  // Admin specific
  adminTab: "stats" | "courses" | "users" | "inquiries" | "logs" | "trainers" | "certificates" = "stats";
  users: User[] = [];
  inquiries: ContactRequest[] = [];


  // Admin User Management State
  userRoleFilter: string = "all";
  userSearchQuery: string = "";
  userPaymentFilter: string = "all";
  userApprovalFilter: string = "all";
  userBatchFilter: string = "";
  editingUserId: string | null = null;
  editUserForm: Partial<User> = {};
  isSavingUser = false;

  // Admin Inquiries Filter State
  inquirySearchQuery: string = "";
  inquiryStatusFilter: string = "all";

  // Trainer Filter State
  trainerSearchQuery: string = "";
  trainerStatusFilter: string = "all";

  // Student Filter State
  studentStatusFilter: string = "all";

  // Course CRUD state
  showCourseModal = false;
  courseModalTitle = "Add New Course";
  courseFormId = "";
  courseForm = {
    title: "",
    description: "",
    duration: "8 Weeks",
    trainerName: "Mr. Satish Raghavan",
    capacity: 30,
    price: "$299",
    featuresText: "100% Job Confirmation, Real-Time Projects",
    syllabusText: "Core Java OOPs, Spring Boot Web, CI/CD Cloud",
  };
  isSavingCourse = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private dataService: DataService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        this.updateViews();
      }),
      this.dataService.enrollments$.subscribe((enrollments) => {
        this.enrollments = enrollments;
        this.updateViews();
      }),
      this.dataService.courses$.subscribe((courses) => {
        this.courses = courses;
        this.updateViews();
      }),
      this.dataService.stats$.subscribe((stats) => {
        this.stats = stats;
      }),
      this.dataService.users$.subscribe((users) => {
        this.users = users;
      }),
      this.dataService.contactRequests$.subscribe((inquiries) => {
        this.inquiries = inquiries;
      })
    );

    // Initial check
    if (this.currentUser?.role === "admin") {
      this.dataService.fetchAdminDashboard();
      this.dataService.loadContacts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  updateViews(): void {
    if (!this.currentUser) return;

    // Student specific: Filter enrollments matching their id
    if (this.currentUser.role === "student") {
      this.userEnrollments = this.enrollments.filter(
        (e) => e.studentId === this.currentUser!.id
      );
    }

    // Trainer specific: Find courses where trainerName matches or contains trainer's name
    if (this.currentUser.role === "trainer") {
      const name = this.currentUser.name;
      this.trainerCourses = this.courses.filter(
        (c) =>
          c.trainerName.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(c.trainerName.toLowerCase())
      );

      const courseIds = this.trainerCourses.map((c) => c.id);
      this.trainerEnrollments = this.enrollments.filter((e) =>
        this.filterTrainerOnly ? courseIds.includes(e.courseId) : true
      );
    }
  }

  toggleTrainerFilter(): void {
    this.filterTrainerOnly = !this.filterTrainerOnly;
    this.updateViews();
  }

  // Trainer Enrollment Updates
  selectEnrollment(enrollment: Enrollment): void {
    this.editingEnrollment = enrollment;
    this.editProgress = enrollment.progress;
    this.editGrade = enrollment.grade || "A";
    this.editFeedback = enrollment.feedback || "";
  }

  closeEditModal(): void {
    this.editingEnrollment = null;
  }

  submitEnrollmentUpdate(): void {
    if (!this.editingEnrollment) return;

    this.isSavingEnrollment = true;
    this.dataService
      .updateEnrollment(
        this.editingEnrollment.id,
        this.editProgress,
        this.editGrade,
        this.editFeedback
      )
      .subscribe({
        next: (res) => {
          this.isSavingEnrollment = false;
          if (res.success) {
            this.toastService.showSuccess("Student progress updated successfully!");
            this.closeEditModal();
          }
        },
        error: (err) => {
          this.isSavingEnrollment = false;
          console.error("Failed to update enrollment", err);
          this.toastService.showError("Failed to update progress.");
        },
      });
  }

  // Admin Inquiry responses
  markInquiryStatus(id: string, status: "read" | "replied"): void {
    this.dataService.respondToContact(id, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(`Inquiry marked as ${status}.`);
        }
      },
      error: (err) => console.error(err),
    });
  }

  // Admin Course CRUD methods
  openNewCourseModal(): void {
    this.courseModalTitle = "Add New Course";
    this.courseFormId = "";
    this.courseForm = {
      title: "",
      description: "",
      duration: "8 Weeks",
      trainerName: "Mr. Satish Raghavan",
      capacity: 30,
      price: "$299",
      featuresText: "100% Job Confirmation, Real-Time Projects",
      syllabusText: "Core Java OOPs, Spring Boot Web, CI/CD Cloud",
    };
    this.showCourseModal = true;
  }

  openEditCourseModal(course: Course): void {
    this.courseModalTitle = "Edit Course Details";
    this.courseFormId = course.id;
    this.courseForm = {
      title: course.title,
      description: course.description,
      duration: course.duration,
      trainerName: course.trainerName,
      capacity: course.capacity,
      price: course.price || "$199",
      featuresText: course.features.join(", "),
      syllabusText: course.syllabus.join(", "),
    };
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.showCourseModal = false;
  }

  submitCourseForm(): void {
    if (!this.courseForm.title || !this.courseForm.description) {
      this.toastService.showError("Title and description are required.");
      return;
    }

    const payload: any = {
      title: this.courseForm.title,
      description: this.courseForm.description,
      duration: this.courseForm.duration,
      trainerName: this.courseForm.trainerName,
      capacity: Number(this.courseForm.capacity) || 30,
      price: this.courseForm.price,
      features: this.courseForm.featuresText
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f),
      syllabus: this.courseForm.syllabusText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    if (this.courseFormId) {
      payload.id = this.courseFormId;
    }

    this.isSavingCourse = true;
    this.dataService.createOrEditCourse(payload).subscribe({
      next: (res) => {
        this.isSavingCourse = false;
        if (res.success) {
          this.toastService.showSuccess("Course list updated successfully!");
          this.closeCourseModal();
        }
      },
      error: (err) => {
        this.isSavingCourse = false;
        console.error(err);
        this.toastService.showError("Failed to update course.");
      },
    });
  }

  deleteCourse(id: string): void {
    if (confirm("Are you absolutely sure you want to delete this course? All data relating to it will be unlinked.")) {
      this.dataService.deleteCourse(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.showSuccess("Course deleted successfully.");
          }
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError("Failed to delete course.");
        },
      });
    }
  }

  // Admin User Management
  get filteredUsers(): User[] {
    let result = this.users;

    // Role filter
    if (this.userRoleFilter !== "all") {
      result = result.filter(u => u.role === this.userRoleFilter);
    }

    // Payment status filter
    if (this.userPaymentFilter !== "all") {
      if (this.userPaymentFilter === "none") {
        result = result.filter(u => !u.paymentStatus);
      } else {
        result = result.filter(u => u.paymentStatus === this.userPaymentFilter);
      }
    }

    // Approval status filter
    if (this.userApprovalFilter !== "all") {
      if (this.userApprovalFilter === "pending") {
        result = result.filter(u => !u.approvalStatus || u.approvalStatus === "pending");
      } else {
        result = result.filter(u => u.approvalStatus === this.userApprovalFilter);
      }
    }

    // Batch filter
    if (this.userBatchFilter.trim()) {
      const batch = this.userBatchFilter.trim().toLowerCase();
      result = result.filter(u => u.batchNumber?.toLowerCase().includes(batch));
    }

    // Text search (name, email, contact, assigned trainer)
    if (this.userSearchQuery.trim()) {
      const q = this.userSearchQuery.trim().toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.contactNum || "").toLowerCase().includes(q) ||
        (u.assignedTrainer || "").toLowerCase().includes(q) ||
        (u.batchNumber || "").toLowerCase().includes(q)
      );
    }

    return result;
  }

  clearUserFilters(): void {
    this.userRoleFilter = "all";
    this.userSearchQuery = "";
    this.userPaymentFilter = "all";
    this.userApprovalFilter = "all";
    this.userBatchFilter = "";
  }

  get uniqueBatches(): string[] {
    const batches = this.users
      .map(u => u.batchNumber)
      .filter((b): b is string => !!b && b.trim() !== "");
    return [...new Set(batches)].sort();
  }

  // Admin Inquiries Filter
  get filteredInquiries(): ContactRequest[] {
    let result = this.inquiries;

    if (this.inquiryStatusFilter !== "all") {
      result = result.filter(i => i.status === this.inquiryStatusFilter);
    }

    if (this.inquirySearchQuery.trim()) {
      const q = this.inquirySearchQuery.trim().toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // Trainer Enrollments Filter
  get filteredTrainerEnrollments(): Enrollment[] {
    let result = this.trainerEnrollments;

    if (this.trainerStatusFilter !== "all") {
      result = result.filter(e => e.status === this.trainerStatusFilter);
    }

    if (this.trainerSearchQuery.trim()) {
      const q = this.trainerSearchQuery.trim().toLowerCase();
      result = result.filter(e =>
        e.studentName.toLowerCase().includes(q) ||
        e.studentEmail.toLowerCase().includes(q) ||
        e.courseTitle.toLowerCase().includes(q)
      );
    }

    return result;
  }

  // Student Enrollments Filter
  get filteredUserEnrollments(): Enrollment[] {
    if (this.studentStatusFilter === "all") {
      return this.userEnrollments;
    }
    return this.userEnrollments.filter(e => e.status === this.studentStatusFilter);
  }

  approveUser(user: User): void {
    this.dataService.updateUser({ id: user.id, approvalStatus: "approved" }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(`${user.name} has been approved.`);
        }
      },
      error: (err) => {
        console.error("Approval error", err);
        this.toastService.showError("Failed to approve user.");
      }
    });
  }

  editUser(user: User): void {
    this.editingUserId = user.id;
    this.editUserForm = { ...user };
  }

  cancelEditUser(): void {
    this.editingUserId = null;
    this.editUserForm = {};
  }

  saveUser(): void {
    if (!this.editUserForm.id) return;
    this.isSavingUser = true;
    this.dataService.updateUser(this.editUserForm).subscribe({
      next: (res) => {
        this.isSavingUser = false;
        if (res.success) {
          this.toastService.showSuccess("User profile updated successfully.");
          this.cancelEditUser();
        }
      },
      error: (err) => {
        this.isSavingUser = false;
        console.error("User save error", err);
        this.toastService.showError("Failed to update user profile.");
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm("Are you sure you want to completely remove this user account?")) {
      this.dataService.deleteUser(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.showSuccess("User deleted successfully.");
          }
        },
        error: (err) => {
          console.error("Delete error", err);
          this.toastService.showError("Failed to delete user.");
        }
      });
    }
  }

  // Visual Styling Helpers
  getProgressColor(progress: number): string {
    if (progress < 33) return "bg-rose-500";
    if (progress < 66) return "bg-amber-500";
    return "bg-emerald-500";
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "completed":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-100";
    }
  }

  getActiveCount(): number {
    return this.userEnrollments.filter((e) => e.status === "active").length;
  }

  getCompletedCount(): number {
    return this.userEnrollments.filter((e) => e.status === "completed").length;
  }

  getAverageProgress(): number {
    if (this.userEnrollments.length === 0) return 0;
    const total = this.userEnrollments.reduce((sum, e) => sum + e.progress, 0);
    return Math.round(total / this.userEnrollments.length);
  }
}
