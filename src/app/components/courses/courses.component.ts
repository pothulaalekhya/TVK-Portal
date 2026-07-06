import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { ToastService } from "../../services/toast.service";
import { Course, User, Enrollment } from "../../models/models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-courses",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./courses.component.html",
  styleUrls: ["./courses.component.css"],
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  currentUser: User | null = null;
  enrollments: Enrollment[] = [];
  selectedCourse: Course | null = null;

  // Bound to the search input via [(ngModel)]
  termFilter = "";

  private subscriptions: Subscription[] = [];

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.courses$.subscribe((courses) => {
        this.courses = courses;
      }),
      this.dataService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      }),
      this.dataService.enrollments$.subscribe((enrollments) => {
        this.enrollments = enrollments;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Enhanced search to match title, description, syllabus stack, or feature highlights
  get filteredCourses(): Course[] {
    if (!this.termFilter.trim()) {
      return this.courses;
    }

    const query = this.termFilter.toLowerCase().trim();
    return this.courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.syllabus?.some((tech) => tech.toLowerCase().includes(query)) ||
        course.features?.some((feat) => feat.toLowerCase().includes(query))
    );
  }

  get userEnrolls(): string[] {
    if (!this.currentUser) return [];
    return this.enrollments
      .filter((e) => e.studentId === this.currentUser!.id)
      .map((e) => e.courseId);
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
  }

  enrollCourse(courseId: string): void {
    if (!this.currentUser) {
      this.dataService.triggerRegisterModal(courseId);
      return;
    }

    if (this.currentUser.role !== "student") {
      this.toastService.showInfo("Redirecting you to register a student profile for course enrollment.");
      this.dataService.triggerRegisterModal(courseId);
      return;
    }

    if (this.userEnrolls.includes(courseId)) {
      this.toastService.showInfo("You are already enrolled in this training program.");
      return;
    }

    this.dataService.enrollInCourse(this.currentUser.id, courseId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess(`Successfully enrolled in ${res.enrollment?.courseTitle || 'course'}!`);
          this.selectedCourse = null;
        }
      },
      error: (err) => {
        console.error("Enrollment failed", err);
        const errMsg = err.error?.error || "Enrollment failed. Please try again.";
        this.toastService.showError(errMsg);
      }
    });
  }
}