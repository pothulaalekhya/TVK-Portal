import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, NavigationEnd } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DataService } from "./services/data.service";
import { ToastService, Toast } from "./services/toast.service";
import { User, Course, Enrollment } from "./models/models";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  activeTab: string = "home";
  currentUser: User | null = null;
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  toasts: Toast[] = [];

  // Modals state
  showLoginModal = false;
  showRegModal = false;
  showLoginPassword = false;
  showRegPassword = false;

  // Login form state
  loginEmail = "";
  loginPassword = "";
  isLoggingIn = false;

  // Register form state
  regName = "";
  regEmail = "";
  regPassword = "";
  regRole: "student" | "trainer" | "admin" = "student";
  regContactNum = "";
  regCollegeName = "";
  regBranch = "Computer Science & Engineering";
  regCustomBranch = "";
  regAcademicStatus = "Pursuing (3rd Year)";
  regAddress = "";
  regIdDetails = "";
  regPaymentMode = "UPI Transfer";
  regTxnId = "";
  regAmount = "$299";
  regIsInstituteMember = true;
  regCourseId = "";
  regSpecialization = "";
  regStrongTechnologies = "";
  isRegistering = false;

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Keep activeTab in sync with current route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        if (url.includes("/home")) this.activeTab = "home";
        else if (url.includes("/courses")) this.activeTab = "courses";
        else if (url.includes("/contact")) this.activeTab = "contact";
        else if (url.includes("/dashboard")) this.activeTab = "dashboard";
      });

    this.dataService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.dataService.courses$.subscribe((courses) => {
      this.courses = courses;
    });

    this.dataService.enrollments$.subscribe((enrollments) => {
      this.enrollments = enrollments;
    });

    this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });

    this.dataService.registerModalTrigger$.subscribe((courseId) => {
      this.openRegModal(courseId);
    });
  }

  logout(): void {
    this.dataService.setCurrentUser(null);
    this.router.navigate(["/home"]);
    this.toastService.showSuccess("Logged out successfully");
  }

  openLoginModal(): void {
    this.showRegModal = false;
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    this.loginEmail = "";
    this.loginPassword = "";
    this.showLoginPassword = false;
  }

  openRegModal(courseId = ""): void {
    this.showLoginModal = false;
    this.regCourseId = courseId;
    this.regIsInstituteMember = !!courseId;
    this.regRole = "student";
    this.showRegModal = true;
  }

  closeRegModal(): void {
    this.showRegModal = false;
    this.regName = "";
    this.regEmail = "";
    this.regPassword = "";
    this.showRegPassword = false;
    this.regContactNum = "";
    this.regCollegeName = "";
    this.regCustomBranch = "";
    this.regAddress = "";
    this.regIdDetails = "";
    this.regTxnId = "";
    this.regSpecialization = "";
    this.regStrongTechnologies = "";
  }

  submitLogin(): void {
    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.toastService.showError("Please enter your registered email address and password.");
      return;
    }

    this.isLoggingIn = true;
    this.dataService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res) => {
        this.isLoggingIn = false;
        if (res.success && res.user) {
          this.toastService.showSuccess(`Welcome back, ${res.user.name}!`);
          this.closeLoginModal();
          this.router.navigate(["/dashboard"]);
        }
      },
      error: (err) => {
        this.isLoggingIn = false;
        console.error("Login error", err);
        const errMsg = err.error?.error || "User login failed. Check email or register.";
        this.toastService.showError(errMsg);
      },
    });
  }

  submitRegister(): void {
    if (!this.regName.trim() || !this.regEmail.trim() || !this.regPassword) {
      this.toastService.showError("Name, Email, and Password are strictly required fields.");
      return;
    }

    const payload: any = {
      name: this.regName.trim(),
      email: this.regEmail.trim(),
      password: this.regPassword,
      role: this.regRole,
    };

    if (this.regRole === "student") {
      payload.contactNum = this.regContactNum;
      payload.collegeName = this.regCollegeName;
      payload.branch = this.regBranch;
      payload.customBranch = this.regCustomBranch;
      payload.academicStatus = this.regAcademicStatus;
      payload.address = this.regAddress;
      payload.idDetails = this.regIdDetails;
      payload.paymentMode = this.regPaymentMode;
      payload.paymentTxnId = this.regTxnId;
      payload.paymentAmount = this.regAmount;
      payload.paymentScreenshotName = "screenshot_" + Date.now() + ".png";
      payload.isInstituteMember = this.regIsInstituteMember;
      payload.courseId = this.regCourseId;
    } else {
      payload.specialization = this.regSpecialization;
      payload.strongTechnologies = this.regStrongTechnologies;
    }

    this.isRegistering = true;
    this.dataService.register(payload).subscribe({
      next: (res) => {
        this.isRegistering = false;
        if (res.success && res.user) {
          this.toastService.showSuccess("Registration completed successfully!");
          this.closeRegModal();
          this.router.navigate(["/dashboard"]);
        }
      },
      error: (err) => {
        this.isRegistering = false;
        console.error("Registration error", err);
        const errMsg = err.error?.error || "Registration failed. Email might already exist.";
        this.toastService.showError(errMsg);
      },
    });
  }
}
