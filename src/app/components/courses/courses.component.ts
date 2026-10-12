import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { DataService } from "../../services/data.service";
import { ToastService } from "../../services/toast.service";
import { Course, User, Enrollment } from "../../models/models";
import { Subscription } from "rxjs";
import { ScrollLockService } from "../../services/scroll-lock.service";

import { RevealDirective, FlipGridDirective } from "../../motion";

@Component({
  selector: "app-courses",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RevealDirective, FlipGridDirective],
  templateUrl: "./courses.component.html",
  styleUrls: ["./courses.component.css"],
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  currentUser: User | null = null;
  enrollments: Enrollment[] = [];
  
  // UI & Search/Filter State
  termFilter = "";
  selectedCategory = "all";
  selectedMode = "all";
  selectedLevel = "all";
  selectedTiming = "all";
  maxPriceFilter = 50000;
  sortBy: "popular" | "rating" | "price_asc" | "price_desc" = "popular";
  viewMode: "grid" | "list" = "grid";

  // Course Details Drawer State
  detailCourse: Course | null = null;
  activeDetailTab: "syllabus" | "projects" | "schedule" | "trainer" = "syllabus";

  // 4-Step Enrollment Stepper Modal
  showEnrollModal = false;
  enrollCourseTarget: Course | null = null;
  enrollStep: 1 | 2 | 3 | 4 = 1;
  
  // Step 1: Candidate Details
  enrollName = "";
  enrollEmail = "";
  enrollPhone = "";
  enrollCampus: "Bangalore" | "Chennai" = "Bangalore";

  // Step 2: Batch Timing Selection
  enrollBatchTiming = "Weekday Evening (7:00 PM - 9:00 PM)";
  enrollBatchStartDate = "Next Monday";

  // Step 3: Payment Plan
  enrollPaymentPlan: "full" | "emi" = "full";
  enrollEmiTenure = 6;
  isEnrolling = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private scrollLockService: ScrollLockService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.courses$.subscribe((courses) => {
        this.courses = courses;
      }),
      this.dataService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.enrollName = user.name || "";
          this.enrollEmail = user.email || "";
          this.enrollPhone = user.personalPhone || user.contactNum || "";
          if (user.preferredLocation === "Chennai") {
            this.enrollCampus = "Chennai";
          }
        }
      }),
      this.dataService.enrollments$.subscribe((enrollments) => {
        this.enrollments = enrollments;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getCountByCategory(cat: string): number {
    if (cat === "all") return this.courses.length;
    const catLower = cat.toLowerCase();
    return this.courses.filter((c) => {
      const cCat = (c.category || "").toLowerCase();
      const cTitle = (c.title || "").toLowerCase();
      if (catLower === "full stack") {
        return cCat === "full stack" || cTitle.includes("full stack");
      }
      if (catLower === "backend") {
        return cCat === "backend" || cTitle.includes("spring") || cTitle.includes("cloud") || cTitle.includes("devops") || cTitle.includes("backend");
      }
      if (catLower === "frontend") {
        return cCat === "frontend" || cTitle.includes("angular") || cTitle.includes("react") || cTitle.includes("frontend");
      }
      return cCat === catLower;
    }).length;
  }

  get filteredCourses(): Course[] {
    let result = [...this.courses];

    // Search query filter
    if (this.termFilter && this.termFilter.trim()) {
      const q = this.termFilter.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.trainer?.toLowerCase().includes(q) ||
          c.trainerName?.toLowerCase().includes(q) ||
          c.syllabus?.some((t) => t.toLowerCase().includes(q)) ||
          c.features?.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (this.selectedCategory && this.selectedCategory !== "all") {
      const catLower = this.selectedCategory.toLowerCase();
      result = result.filter((c) => {
        const cCat = (c.category || "").toLowerCase();
        const cTitle = (c.title || "").toLowerCase();
        if (catLower === "full stack") {
          return cCat === "full stack" || cTitle.includes("full stack");
        }
        if (catLower === "backend") {
          return cCat === "backend" || cTitle.includes("spring") || cTitle.includes("cloud") || cTitle.includes("devops") || cTitle.includes("backend");
        }
        if (catLower === "frontend") {
          return cCat === "frontend" || cTitle.includes("angular") || cTitle.includes("react") || cTitle.includes("frontend");
        }
        return cCat === catLower;
      });
    }

    // Mode filter
    if (this.selectedMode && this.selectedMode !== "all") {
      const modeLower = this.selectedMode.toLowerCase();
      result = result.filter((c) => {
        const cMode = (c.mode || "").toLowerCase();
        const cDuration = (c.duration || "").toLowerCase();
        const cBatches = (c.batches || []).join(" ").toLowerCase();
        return cMode.includes(modeLower) || cDuration.includes(modeLower) || cBatches.includes(modeLower);
      });
    }

    // Max Price filter
    result = result.filter((c) => {
      const fee = c.fee || (c.price ? parseInt(c.price.replace(/[^0-9]/g, ""), 10) : 34999) || 34999;
      return fee <= this.maxPriceFilter;
    });

    // Sorting
    if (this.sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else if (this.sortBy === "price_asc") {
      result.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    } else if (this.sortBy === "price_desc") {
      result.sort((a, b) => (b.fee || 0) - (a.fee || 0));
    } else {
      // Popularity default
      result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    }

    return result;
  }

  get userEnrolls(): string[] {
    if (!this.currentUser) return [];
    return this.enrollments
      .filter((e) => e.studentId === this.currentUser!.id)
      .map((e) => e.courseId);
  }

  openCourseDetail(course: Course): void {
    this.detailCourse = course;
    this.activeDetailTab = "syllabus";
    this.scrollLockService.lock();
  }

  closeCourseDetail(): void {
    if (this.detailCourse) {
      this.detailCourse = null;
      this.scrollLockService.unlock();
    }
  }

  startEnrollment(course: Course): void {
    this.dataService.triggerRegisterModal(course.id || course.title);
  }

  closeEnrollModal(): void {
    if (this.showEnrollModal) {
      this.showEnrollModal = false;
      this.scrollLockService.unlock();
    }
    this.enrollCourseTarget = null;
    this.enrollStep = 1;
  }

  goToEnrollStep(step: 1 | 2 | 3 | 4): void {
    if (step === 2) {
      if (!this.enrollName.trim() || !this.enrollEmail.trim() || !this.enrollPhone.trim()) {
        this.toastService.showError("Please complete your name, email, and phone number.");
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.enrollEmail.trim())) {
        this.toastService.showError("Please enter a valid email address (e.g. name@domain.com).");
        return;
      }
    }
    this.enrollStep = step;
  }

  submitEnrollment(): void {
    if (!this.enrollCourseTarget) return;

    this.isEnrolling = true;
    const studentId = this.currentUser ? this.currentUser.id : `guest-${Date.now()}`;
    
    this.dataService.enrollInCourse(studentId, this.enrollCourseTarget.id).subscribe({
      next: (res) => {
        this.isEnrolling = false;
        this.enrollStep = 4;
        this.toastService.showSuccess(`Congratulations! Enrolled in ${this.enrollCourseTarget?.title}!`);
      },
      error: (err) => {
        this.isEnrolling = false;
        this.enrollStep = 4;
        this.toastService.showSuccess(`Admission application for ${this.enrollCourseTarget?.title} submitted!`);
      }
    });
  }

  resetFilters(): void {
    this.termFilter = "";
    this.selectedCategory = "all";
    this.selectedMode = "all";
    this.selectedLevel = "all";
    this.maxPriceFilter = 50000;
    this.sortBy = "popular";
  }
}