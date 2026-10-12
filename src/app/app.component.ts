import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, NavigationEnd } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DataService } from "./services/data.service";
import { ToastService, Toast } from "./services/toast.service";
import { User, Course, Enrollment } from "./models/models";
import { filter } from "rxjs/operators";

import { RevealDirective } from "./motion";
import { ScrollLockService } from "./services/scroll-lock.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealDirective],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, OnDestroy {
  activeTab: string = "home";
  currentUser: User | null = null;
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  toasts: Toast[] = [];

  // Top Announcement Carousel State
  announcements = [
    {
      badge: "New Batches",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30",
      dotColor: "bg-emerald-400",
      text: "Weekday & Weekend Classroom Batches starting this Monday at Bangalore & Chennai Campuses.",
      actionText: "View Batches",
      actionLink: "/courses"
    },
    {
      badge: "100% Placements",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
      dotColor: "bg-emerald-400",
      text: "Placement Assurance Program: 160+ Active Tier-1 & Tier-2 Hiring Partners recruiting now.",
      actionText: "Explore Placements",
      actionLink: "/courses"
    },
    {
      badge: "Free Demo Labs",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
      dotColor: "bg-amber-400",
      text: "Free Live Architecture Masterclasses: Java 21, Spring Boot 3 & Microservices this Saturday.",
      actionText: "Reserve Seat",
      actionLink: "/contact"
    },
    {
      badge: "Merit Scholarship",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30",
      dotColor: "bg-cyan-400",
      text: "Up to 25% Early-Bird Fee Concession for Top Aptitude & Coding Test Performers.",
      actionText: "Apply Now",
      actionLink: "/contact"
    }
  ];
  isDarkMode = false;
  isAdminRoute = false;
  isScrolled = false;
  showDevTools = false;
  mobileMenuOpen = false;

  // Modals state
  showLoginModal = false;
  showRegModal = false;
  showLoginPassword = false;
  showSuccessApplicationModal = false;
  showChangePasswordModal = false;

  // Login form state
  loginMode: "login" | "temp_password" = "login";
  loginEmail = "";
  loginPassword = "";
  loginRememberMe = true;
  loginErrorMessage = "";
  isLoggingIn = false;

  // Registration step & error message
  regStep: 1 | 2 | 3 = 1;
  regErrorMessage = "";

  // Newsletter Email
  newsletterEmail = "";
  isSubscribingNewsletter = false;

  // Temp password request state
  tempPasswordReqEmail = "";
  tempPasswordResult: { tempPassword?: string; message?: string; name?: string } | null = null;
  isRequestingTemp = false;

  // Change Password state
  changePassEmail = "";
  changePassCurrent = "";
  changePassNew = "";
  changePassConfirm = "";
  changePassErrorMessage = "";
  isChangingPassword = false;

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.dataService.toggleDarkMode();
  }

  getPasswordStrength(pass: string): { score: number; label: string; color: string; width: string } {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: '25%' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (score === 3 || score === 4) return { score: 3, label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  }

  subscribeNewsletter(): void {
    if (!this.newsletterEmail.trim() || !this.newsletterEmail.includes('@')) {
      this.toastService.showError('Please enter a valid email address.');
      return;
    }
    this.isSubscribingNewsletter = true;
    setTimeout(() => {
      this.isSubscribingNewsletter = false;
      this.toastService.showSuccess('Thank you for subscribing! You will receive weekly tech career insights.');
      this.newsletterEmail = '';
    }, 600);
  }

  // Naukri-style Quick Lead Slide-in Drawer (Automatic for first-time visitors)
  showQuickLeadSidebar = false;
  quickLeadStep: 1 | 2 | 3 = 1;
  quickLeadFirstName = "";
  quickLeadLastName = "";
  quickLeadPhone = "";
  quickLeadAltPhone = "";
  quickLeadEmail = "";
  quickLeadLocation: "Bangalore" | "Chennai" = "Bangalore";
  quickLeadCourse = "Full Stack Java Developer with Angular";
  quickLeadTrack: "internship" | "job" = "internship";
  isSubmittingQuickLead = false;
  quickLeadSubmitted = false;

  // Student Registration form state
  regName = "";
  regFirstName = "";
  regLastName = "";
  regEmail = "";
  regPhone = "";
  regPersonalPhone = "";
  regEmergencyPhone = "";
  regCampus: "Bangalore" | "Chennai" = "Bangalore";
  regCourse = "Java Full Stack with Angular";
  regPassword = "";
  showRegPassword = false;
  regAgreeTerms = true;

  // Country Code for Phone Numbers
  countryCodes = [
    { code: "+91", country: "IN", label: "India (+91)", flag: "🇮🇳" },
    { code: "+1", country: "US", label: "USA (+1)", flag: "🇺🇸" },
    { code: "+44", country: "GB", label: "UK (+44)", flag: "🇬🇧" },
    { code: "+61", country: "AU", label: "Australia (+61)", flag: "🇦🇺" },
    { code: "+1", country: "CA", label: "Canada (+1)", flag: "🇨🇦" },
    { code: "+971", country: "AE", label: "UAE (+971)", flag: "🇦🇪" },
    { code: "+65", country: "SG", label: "Singapore (+65)", flag: "🇸🇬" },
    { code: "+49", country: "DE", label: "Germany (+49)", flag: "🇩🇪" },
    { code: "+33", country: "FR", label: "France (+33)", flag: "🇫🇷" },
    { code: "+81", country: "JP", label: "Japan (+81)", flag: "🇯🇵" },
    { code: "+86", country: "CN", label: "China (+86)", flag: "🇨🇳" },
    { code: "+82", country: "KR", label: "South Korea (+82)", flag: "🇰🇷" },
    { code: "+60", country: "MY", label: "Malaysia (+60)", flag: "🇲🇾" },
    { code: "+966", country: "SA", label: "Saudi Arabia (+966)", flag: "🇸🇦" },
    { code: "+974", country: "QA", label: "Qatar (+974)", flag: "🇶🇦" },
    { code: "+968", country: "OM", label: "Oman (+968)", flag: "🇴🇲" },
    { code: "+64", country: "NZ", label: "New Zealand (+64)", flag: "🇳🇿" },
    { code: "+27", country: "ZA", label: "South Africa (+27)", flag: "🇿🇦" },
    { code: "+234", country: "NG", label: "Nigeria (+234)", flag: "🇳🇬" },
    { code: "+254", country: "KE", label: "Kenya (+254)", flag: "🇰🇪" },
    { code: "+977", country: "NP", label: "Nepal (+977)", flag: "🇳🇵" },
    { code: "+94", country: "LK", label: "Sri Lanka (+94)", flag: "🇱🇰" },
    { code: "+880", country: "BD", label: "Bangladesh (+880)", flag: "🇧🇩" },
    { code: "+92", country: "PK", label: "Pakistan (+92)", flag: "🇵🇰" },
    { code: "+62", country: "ID", label: "Indonesia (+62)", flag: "🇮🇩" },
    { code: "+66", country: "TH", label: "Thailand (+66)", flag: "🇹🇭" },
    { code: "+63", country: "PH", label: "Philippines (+63)", flag: "🇵🇭" },
    { code: "+55", country: "BR", label: "Brazil (+55)", flag: "🇧🇷" },
    { code: "+52", country: "MX", label: "Mexico (+52)", flag: "🇲🇽" },
    { code: "+353", country: "IE", label: "Ireland (+353)", flag: "🇮🇪" },
  ];
  selectedCountryCode = "+91";
  emergencyCountryCode = "+91";
  quickLeadCountryCode = "+91";
  showCountryDropdown = false;
  showEmergencyCountryDropdown = false;
  showQuickLeadCountryDropdown = false;
  countrySearchTerm = "";

  get filteredCountryCodes() {
    if (!this.countrySearchTerm.trim()) return this.countryCodes;
    const term = this.countrySearchTerm.trim().toLowerCase();
    return this.countryCodes.filter(
      c => c.label.toLowerCase().includes(term) || c.code.includes(term) || c.country.toLowerCase().includes(term)
    );
  }

  selectCountryCode(code: string, field: 'personal' | 'emergency' | 'quickLead'): void {
    if (field === 'personal') {
      this.selectedCountryCode = code;
      this.showCountryDropdown = false;
    } else if (field === 'emergency') {
      this.emergencyCountryCode = code;
      this.showEmergencyCountryDropdown = false;
    } else {
      this.quickLeadCountryCode = code;
      this.showQuickLeadCountryDropdown = false;
    }
    this.countrySearchTerm = "";
  }

  getCountryFlag(code: string): string {
    const found = this.countryCodes.find(c => c.code === code);
    return found ? found.flag : "🌍";
  }

  toggleCountryDropdown(field: 'personal' | 'emergency' | 'quickLead'): void {
    if (field === 'personal') {
      this.showCountryDropdown = !this.showCountryDropdown;
      this.showEmergencyCountryDropdown = false;
      this.showQuickLeadCountryDropdown = false;
    } else if (field === 'emergency') {
      this.showEmergencyCountryDropdown = !this.showEmergencyCountryDropdown;
      this.showCountryDropdown = false;
      this.showQuickLeadCountryDropdown = false;
    } else {
      this.showQuickLeadCountryDropdown = !this.showQuickLeadCountryDropdown;
      this.showCountryDropdown = false;
      this.showEmergencyCountryDropdown = false;
    }
    this.countrySearchTerm = "";
  }

  // OTP Email Verification State
  otpSent = false;
  otpVerified = false;
  otpCode = "";
  otpInput = "";
  otpError = "";
  otpCountdown = 0;
  otpTimer: any = null;
  isSendingOtp = false;
  isVerifyingOtp = false;
  otpResendCount = 0;

  sendOtp(): void {
    const email = this.regEmail.trim();
    if (!email) {
      this.toastService.showError("Please enter your email address first.");
      return;
    }
    const emailCheck = this.validateEmailDetails(email);
    if (!emailCheck.isValid) {
      this.toastService.showError(emailCheck.error);
      return;
    }

    this.isSendingOtp = true;
    this.otpError = "";

    this.dataService.sendOtp(email).subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
        this.otpSent = true;
        this.otpVerified = false;
        this.otpInput = "";
        this.otpResendCount++;
        this.startOtpCountdown();
        this.toastService.showSuccess(`OTP sent to ${email}. Check your inbox/console.`);
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        const errMsg = err.error?.message || err.error?.error || "Failed to send OTP. Please try again.";
        this.otpError = errMsg;
        this.toastService.showError(errMsg);
      }
    });
  }

  verifyOtp(): void {
    const otp = this.otpInput.trim();
    if (!otp || otp.length !== 6) {
      this.otpError = "Please enter the 6-digit OTP code.";
      return;
    }

    this.isVerifyingOtp = true;
    this.otpError = "";

    this.dataService.verifyOtp(this.regEmail.trim(), otp).subscribe({
      next: (res: any) => {
        this.isVerifyingOtp = false;
        if (res.verified) {
          this.otpVerified = true;
          this.otpError = "";
          this.stopOtpCountdown();
          this.toastService.showSuccess("Email verified successfully! ✅");
        } else {
          this.otpError = res.message || "Invalid OTP. Please try again.";
          this.toastService.showError(this.otpError);
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        const errMsg = err.error?.message || err.error?.error || "OTP verification failed. Please try again.";
        this.otpError = errMsg;
        this.toastService.showError(errMsg);
      }
    });
  }

  startOtpCountdown(): void {
    this.stopOtpCountdown();
    this.otpCountdown = 60;
    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) {
        this.stopOtpCountdown();
      }
    }, 1000);
  }

  stopOtpCountdown(): void {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
      this.otpTimer = null;
    }
    this.otpCountdown = 0;
  }

  onEmailChange(): void {
    // Reset OTP state when email changes
    this.otpSent = false;
    this.otpVerified = false;
    this.otpInput = "";
    this.otpError = "";
    this.otpResendCount = 0;
    this.stopOtpCountdown();
  }

  // Structured Address
  regDoorNo = "";
  regStreet = "";
  regCity = "";
  regState = "";
  regPincode = "";

  // Location preference (Bangalore / Chennai)
  regPreferredLocation: "Bangalore" | "Chennai" = "Bangalore";

  // Program / Track Selection
  regTrackType: "internship" | "job" = "internship";

  // Internship Fields
  regTargetCourse = "Java Full Stack with Angular";

  // Skills Autocomplete and Tag System
  availableSkillsList: string[] = [
    "Java",
    "Java Developer",
    "Core Java",
    "Advanced Java",
    "Spring Boot",
    "Spring MVC",
    "Spring Security",
    "Hibernate / JPA",
    "Microservices",
    "RESTful APIs",
    "Angular",
    "Angular Developer",
    "Angular 18",
    "React",
    "React.js",
    "React Developer",
    "Redux / Toolkit",
    "Next.js",
    "Java Full Stack with React",
    "Java Full Stack with Angular",
    "TypeScript",
    "JavaScript (ES6+)",
    "HTML5",
    "CSS3",
    "Tailwind CSS",
    "Bootstrap",
    "Node.js",
    "Express.js",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "Oracle SQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Git & GitHub",
    "CI/CD Pipelines",
    "Maven",
    "JUnit & Mockito",
    "Data Structures & Algorithms",
    "Object-Oriented Programming (OOP)",
    "C / C++",
    "Linux / Unix"
  ];
  skillInput = "";
  selectedSkills: string[] = ["Core Java", "Spring Boot", "Angular 18"];
  showSkillSuggestions = false;

  // Availability Date Picker (Present to Future only)
  minAvailabilityDate = "";
  regAvailabilityDate = "";

  // Job Placement Fields
  regTechStack = "";
  regResumeFileName = "";
  regResumeFileSize = "";

  // Academic / Background (Optional)
  regCollegeName = "";
  regBranch = "Computer Science & Engineering";
  regCustomBranch = "";
  regAcademicStatus = "Pursuing (4th Year)";

  isRegistering = false;
  submittedStudentInfo: { name: string; email: string; course: string; campus: string } | null = null;

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private router: Router,
    private scrollLockService: ScrollLockService
  ) {}

  ngOnInit(): void {
    // Set minimum availability date to today (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    this.minAvailabilityDate = `${yyyy}-${mm}-${dd}`;
    this.regAvailabilityDate = this.minAvailabilityDate;

    if (typeof window !== 'undefined') {
      this.isScrolled = window.scrollY > 8;
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 8;
      }, { passive: true });

      window.addEventListener('open-reg-modal', () => {
        this.openRegModal();
      });
      window.addEventListener('open-login-modal', () => {
        this.openLoginModal();
      });

      // ESC key closes topmost modal
      window.addEventListener('tvk-modal-esc', () => {
        if (this.showRegModal) this.closeRegModal();
        else if (this.showLoginModal) this.closeLoginModal();
        else if (this.showQuickLeadSidebar) this.closeQuickLeadSidebar();
        else if (this.showSuccessApplicationModal) this.goToPortalFromSuccess();
        else if (this.showChangePasswordModal) this.showChangePasswordModal = false;
      });
    }

    this.dataService.isDarkMode$.subscribe((dark) => {
      this.isDarkMode = dark;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.isAdminRoute = url.includes("/dashboard") || url.includes("/admin");
        if (url.includes("/home")) this.activeTab = "home";
        else if (url.includes("/courses")) this.activeTab = "courses";
        else if (url.includes("/contact")) this.activeTab = "contact";
        else if (url.includes("/dashboard") || url.includes("/admin")) this.activeTab = "dashboard";
        this.mobileMenuOpen = false;

        // Smooth scroll position reset to top on route change
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

  openQuickLeadSidebar(): void {
    this.quickLeadStep = this.quickLeadFirstName.trim() ? 2 : 1;
    this.showQuickLeadSidebar = true;
    this.scrollLockService.lock();
  }

  closeQuickLeadSidebar(): void {
    this.showQuickLeadSidebar = false;
    this.scrollLockService.unlock();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("tvk_quick_lead_dismissed", "true");
    }
  }

  onQuickLeadNameContinue(): void {
    if (!this.quickLeadFirstName.trim()) {
      this.toastService.showError("Please enter your First Name to continue.");
      return;
    }
    this.quickLeadStep = 2;
  }

  submitQuickLead(): void {
    if (!this.quickLeadFirstName.trim()) {
      this.quickLeadStep = 1;
      return;
    }
    if (!this.quickLeadPhone.trim()) {
      this.toastService.showError("Please enter your contact phone number.");
      return;
    }
    if (!this.isValidPhone(this.quickLeadPhone)) {
      this.toastService.showError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!this.quickLeadEmail.trim()) {
      this.toastService.showError("Please enter your email address.");
      return;
    }
    if (!this.isValidEmail(this.quickLeadEmail)) {
      this.toastService.showError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    this.isSubmittingQuickLead = true;
    const fullName = `${this.quickLeadFirstName.trim()} ${this.quickLeadLastName.trim()}`.trim();
    
    const leadPayload = {
      name: fullName,
      firstName: this.quickLeadFirstName.trim(),
      lastName: this.quickLeadLastName.trim(),
      email: this.quickLeadEmail.trim(),
      personalPhone: this.quickLeadPhone.trim(),
      emergencyPhone: this.quickLeadAltPhone.trim() || undefined,
      contactNum: this.quickLeadPhone.trim(),
      preferredLocation: this.quickLeadLocation,
      trackType: this.quickLeadTrack,
      targetCourse: this.quickLeadCourse,
      role: "student",
      approvalStatus: "pending",
      followUpStatus: "Need to Contact",
      whatsappStatus: "Unsent",
      candidateReply: "Quick Inquiry lead via portal slide-in sidebar",
      followUpDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    };

    this.dataService.register(leadPayload).subscribe({
      next: (res) => {
        this.isSubmittingQuickLead = false;
        this.quickLeadSubmitted = true;
        this.quickLeadStep = 3;
        if (typeof window !== "undefined") {
          localStorage.setItem("tvk_lead_submitted", "true");
        }
        this.toastService.showSuccess(`Welcome ${this.quickLeadFirstName}! Our admissions desk has received your request.`);
      },
      error: (err) => {
        this.isSubmittingQuickLead = false;
        console.error("Quick lead submission error", err);
        this.quickLeadSubmitted = true;
        this.quickLeadStep = 3;
        this.toastService.showSuccess(`Welcome ${this.quickLeadFirstName}! Our admissions desk will call you shortly.`);
      }
    });
  }

  logout(): void {
    this.dataService.setCurrentUser(null);
    this.router.navigate(["/home"]);
    this.toastService.showSuccess("Logged out successfully.");
  }

  openLoginModal(): void {
    this.showRegModal = false;
    this.showSuccessApplicationModal = false;
    this.loginMode = "login";
    this.tempPasswordResult = null;
    this.loginErrorMessage = "";
    this.showLoginModal = true;
    this.scrollLockService.lock();
  }

  closeLoginModal(): void {
    if (this.showLoginModal) {
      this.showLoginModal = false;
      this.scrollLockService.unlock();
    }
    this.loginEmail = "";
    this.loginPassword = "";
    this.loginErrorMessage = "";
    this.showLoginPassword = false;
    this.tempPasswordReqEmail = "";
    this.tempPasswordResult = null;
  }

  openRegModal(courseId = ""): void {
    this.showLoginModal = false;
    this.showSuccessApplicationModal = false;
    this.regErrorMessage = "";
    this.regFormSubmitted = false;
    this.touchedFields = {};

    if (courseId) {
      const matched = this.courses.find(
        (c) => c.id === courseId || c.title.toLowerCase().includes(courseId.toLowerCase())
      );
      this.regCourse = matched ? matched.title : courseId;
      this.regTargetCourse = this.regCourse;
    } else if (!this.regCourse) {
      this.regCourse = "Java Full Stack with Angular";
      this.regTargetCourse = this.regCourse;
    }

    this.showRegModal = true;
    this.scrollLockService.lock();
  }

  closeRegModal(): void {
    if (this.showRegModal) {
      this.showRegModal = false;
      this.scrollLockService.unlock();
    }
    this.regErrorMessage = "";
    this.regFormSubmitted = false;
    this.touchedFields = {};
  }

  // Skills Tag & Autocomplete Methods
  regFormSubmitted = false;
  touchedFields: { [key: string]: boolean } = {};

  markTouched(field: string): void {
    this.touchedFields[field] = true;
  }

  validateEmailDetails(email: string): { isValid: boolean; error: string } {
    if (!email || !email.trim()) {
      return { isValid: false, error: "Email address is required." };
    }
    const trimmed = email.trim().toLowerCase();

    // Check basic email syntax pattern
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicRegex.test(trimmed)) {
      return { isValid: false, error: "Please enter a valid email address (e.g. rahul@example.com)." };
    }

    if (trimmed.includes("..") || trimmed.includes("@@")) {
      return { isValid: false, error: "Email cannot contain consecutive dots or special symbols." };
    }

    const parts = trimmed.split("@");
    if (parts.length !== 2) {
      return { isValid: false, error: "Email must contain exactly one '@' character." };
    }

    const [local, domain] = parts;
    if (!local || !domain) {
      return { isValid: false, error: "Incomplete email address." };
    }

    // Extract domain host and TLD (e.g. 'gmil' and 'com' from 'gmil.com')
    const domainParts = domain.split(".");
    if (domainParts.length < 2) {
      return { isValid: false, error: "Email domain must include an extension like .com or .in." };
    }

    const domainName = domainParts[0];
    const tld = domainParts[domainParts.length - 1];
    const secondLevelTld = domainParts.length >= 3 ? `${domainParts[domainParts.length - 2]}.${tld}` : "";

    // 1. Gmail strict typo detection (e.g. gmil, gamil, gmal, gmial, gmai, gml, gmeil, etc.)
    const gmailTypos = [
      "gmil", "gamil", "gmaill", "gmal", "gmial", "gmai", "gmeil", "gmaik", "gmaul",
      "g-mail", "gmai1", "gmaii", "gmali", "gmi", "gml", "gmailc", "gmaild", "gmaol", "gmaio"
    ];
    if (gmailTypos.includes(domainName) || (domainName.startsWith("gm") && domainName.endsWith("l") && domainName !== "gmail")) {
      return { isValid: false, error: `Invalid domain '@${domain}'. Did you mean '@gmail.com'?` };
    }
    if (domainName === "gmail" && domain !== "gmail.com") {
      return { isValid: false, error: `Invalid Gmail domain '@${domain}'. Did you mean '@gmail.com'?` };
    }

    // 2. Yahoo strict typo detection (e.g. yaho, yahooo, yhaoo, yhoo)
    const yahooTypos = ["yaho", "yahooo", "yhaoo", "yaahoo", "yhoo", "yaho0", "yahoou", "yaho"];
    if (yahooTypos.includes(domainName) || (domainName.startsWith("yah") && domainName !== "yahoo")) {
      return { isValid: false, error: `Invalid Yahoo domain '@${domain}'. Did you mean '@yahoo.com'?` };
    }
    if (domainName === "yahoo" && !["yahoo.com", "yahoo.co.in", "yahoo.in", "yahoo.co.uk", "yahoo.ca"].includes(domain)) {
      return { isValid: false, error: `Invalid Yahoo domain '@${domain}'. Did you mean '@yahoo.com'?` };
    }

    // 3. Outlook strict typo detection (e.g. outlok, outloo, autlook, otlook)
    const outlookTypos = ["outlok", "outloo", "outlookk", "outllok", "autlook", "otlook", "outlock", "outluk", "outloook"];
    if (outlookTypos.includes(domainName) || (domainName.startsWith("outl") && domainName !== "outlook")) {
      return { isValid: false, error: `Invalid Outlook domain '@${domain}'. Did you mean '@outlook.com'?` };
    }
    if (domainName === "outlook" && !["outlook.com", "outlook.in"].includes(domain)) {
      return { isValid: false, error: `Invalid Outlook domain '@${domain}'. Did you mean '@outlook.com'?` };
    }

    // 4. Hotmail strict typo detection (e.g. hotmial, hotmal, hotmaill, hotmai)
    const hotmailTypos = ["hotmial", "hotmal", "hotmaill", "hotmeil", "hotmai", "hitmail", "hotmali", "hotmaail"];
    if (hotmailTypos.includes(domainName) || (domainName.startsWith("hotm") && domainName !== "hotmail")) {
      return { isValid: false, error: `Invalid Hotmail domain '@${domain}'. Did you mean '@hotmail.com'?` };
    }
    if (domainName === "hotmail" && !["hotmail.com", "hotmail.co.uk"].includes(domain)) {
      return { isValid: false, error: `Invalid Hotmail domain '@${domain}'. Did you mean '@hotmail.com'?` };
    }

    // 5. iCloud strict typo detection (e.g. icoud, iclod, iclaud)
    const icloudTypos = ["icoud", "iclod", "iclaud", "iclouds", "icloude", "icloudk"];
    if (icloudTypos.includes(domainName)) {
      return { isValid: false, error: `Invalid iCloud domain '@${domain}'. Did you mean '@icloud.com'?` };
    }
    if (domainName === "icloud" && domain !== "icloud.com") {
      return { isValid: false, error: `Invalid iCloud domain '@${domain}'. Did you mean '@icloud.com'?` };
    }

    // 6. Rediffmail strict typo detection
    const rediffTypos = ["redifmail", "rediffmial", "redifmial", "reddifmail"];
    if (rediffTypos.includes(domainName)) {
      return { isValid: false, error: `Invalid Rediffmail domain '@${domain}'. Did you mean '@rediffmail.com'?` };
    }
    if (domainName === "rediffmail" && domain !== "rediffmail.com") {
      return { isValid: false, error: `Invalid Rediffmail domain '@${domain}'. Did you mean '@rediffmail.com'?` };
    }

    // Check minimum domain name length
    if (domainName.length < 2) {
      return { isValid: false, error: "Please enter a complete and valid domain name." };
    }

    // Reject known bad TLD typos (like .comm, .coom, .con, .cpm, .cm)
    const badTlds = ["comm", "coom", "con", "cpm", "cmo", "cmm", "cooom", "gmai", "c", "cm", "om", "coo", "kom", "xom"];
    if (badTlds.includes(tld)) {
      return { isValid: false, error: `Invalid domain extension '.${tld}'. Did you mean '.com'?` };
    }

    const validTlds = new Set([
      "com", "org", "net", "edu", "gov", "mil", "int",
      "in", "co.in", "ac.in", "gov.in", "net.in", "org.in", "res.in", "gen.in",
      "io", "ai", "tech", "dev", "app", "me", "co", "info", "biz",
      "uk", "co.uk", "org.uk", "ac.uk", "ca", "au", "com.au", "de", "fr", "jp", "sg", "ae", "nz", "za", "eu", "us",
      "online", "site", "xyz", "global", "cloud", "digital", "academy", "training", "solutions", "services",
      "agency", "center", "company", "institute", "network", "systems", "team", "world", "space", "live", "store", "pro"
    ]);

    if (!validTlds.has(tld) && !(secondLevelTld && validTlds.has(secondLevelTld))) {
      return { isValid: false, error: `Invalid domain extension '.${tld}'. Please use a standard extension like .com or .in.` };
    }

    return { isValid: true, error: "" };
  }

  isValidEmail(email: string): boolean {
    return this.validateEmailDetails(email).isValid;
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()+]/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
  }

  isValidPincode(pin: string): boolean {
    if (!pin) return false;
    return /^\d{6}$/.test(pin.trim());
  }

  getFirstNameError(): string {
    if (!this.regFirstName.trim() && (this.touchedFields['firstName'] || this.regFormSubmitted)) {
      return "First name is required.";
    }
    return "";
  }

  getLastNameError(): string {
    if (!this.regLastName.trim() && (this.touchedFields['lastName'] || this.regFormSubmitted)) {
      return "Last name is required.";
    }
    return "";
  }

  getEmailError(): string {
    const email = this.regEmail ? this.regEmail.trim() : "";
    if (email.length > 0) {
      const res = this.validateEmailDetails(email);
      if (!res.isValid) {
        // Show immediately if user has typed a domain or touched field
        if (email.includes("@") || this.touchedFields['email'] || this.regFormSubmitted) {
          return res.error;
        }
      }
    } else if (this.touchedFields['email'] || this.regFormSubmitted) {
      return "Email address is required.";
    }
    return "";
  }

  isEmailValid(): boolean {
    return this.regEmail ? this.isValidEmail(this.regEmail) : false;
  }

  getPhoneError(): string {
    if (!this.touchedFields['personalPhone'] && !this.regFormSubmitted) return "";
    const phone = this.regPersonalPhone.trim();
    if (!phone) return "Personal contact number is required.";
    if (!this.isValidPhone(phone)) return "Please enter a valid phone number (digits only, without country code).";
    return "";
  }

  getDoorNoError(): string {
    if (!this.regDoorNo.trim() && (this.touchedFields['doorNo'] || this.regFormSubmitted)) {
      return "Door/Flat number is required.";
    }
    return "";
  }

  getStreetError(): string {
    if (!this.regStreet.trim() && (this.touchedFields['street'] || this.regFormSubmitted)) {
      return "Street name is required.";
    }
    return "";
  }

  getCityError(): string {
    if (!this.regCity.trim() && (this.touchedFields['city'] || this.regFormSubmitted)) {
      return "City is required.";
    }
    return "";
  }

  getStateError(): string {
    if (!this.regState.trim() && (this.touchedFields['state'] || this.regFormSubmitted)) {
      return "State is required.";
    }
    return "";
  }

  getPincodeError(): string {
    if (!this.touchedFields['pincode'] && !this.regFormSubmitted) return "";
    const pin = this.regPincode.trim();
    if (!pin) return "Pincode is required.";
    if (!this.isValidPincode(pin)) return "Pincode must be 6 digits (e.g. 560076).";
    return "";
  }

  getSkillsError(): string {
    if (this.selectedSkills.length === 0 && (this.touchedFields['skills'] || this.regFormSubmitted)) {
      return "Please select or type at least one skill.";
    }
    return "";
  }

  get filteredSkillSuggestions(): string[] {
    const input = this.skillInput.trim().toLowerCase();
    if (!input) return [];
    return this.availableSkillsList
      .filter(
        (s) =>
          s.toLowerCase().includes(input) &&
          !this.selectedSkills.some((sel) => sel.toLowerCase() === s.toLowerCase())
      )
      .slice(0, 8);
  }

  addSkill(skillName: string): void {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!this.selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      this.selectedSkills.push(trimmed);
    }
    this.skillInput = "";
    this.showSkillSuggestions = false;
  }

  removeSkill(skill: string): void {
    this.selectedSkills = this.selectedSkills.filter((s) => s !== skill);
  }

  onSkillInputKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const suggestions = this.filteredSkillSuggestions;
      if (suggestions.length > 0) {
        this.addSkill(suggestions[0]);
      } else if (this.skillInput.trim()) {
        this.addSkill(this.skillInput.trim());
      }
    }
  }

  onSkillInputFocus(): void {
    this.showSkillSuggestions = true;
  }

  onSkillInputBlur(): void {
    setTimeout(() => {
      this.showSkillSuggestions = false;
    }, 300);
  }

  onSkillInputChange(): void {
    this.showSkillSuggestions = true;
  }

  // Resume File Selector Simulation
  onResumeFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.regResumeFileName = file.name;
      const sizeKb = Math.round(file.size / 1024);
      this.regResumeFileSize = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + " MB" : sizeKb + " KB";
      this.toastService.showSuccess(`Resume attached: ${file.name}`);
    }
  }

  submitRegister(): void {
    this.regErrorMessage = "";
    this.regFormSubmitted = true;

    const firstName = this.regFirstName.trim();
    const lastName = this.regLastName.trim();
    const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (this.regName.trim() || firstName || lastName);

    if (!firstName) {
      this.regErrorMessage = "Please enter your first name.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!lastName) {
      this.regErrorMessage = "Please enter your last name.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    const email = this.regEmail.trim();
    if (!email) {
      this.regErrorMessage = "Please enter your email address.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    const emailCheck = this.validateEmailDetails(email);
    if (!emailCheck.isValid) {
      this.regErrorMessage = emailCheck.error;
      this.toastService.showError(emailCheck.error);
      return;
    }

    const phoneRaw = this.regPersonalPhone.trim() || this.regPhone.trim();
    if (!phoneRaw) {
      this.regErrorMessage = "Please enter your personal contact number.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!this.isValidPhone(phoneRaw)) {
      this.regErrorMessage = "Please enter a valid personal contact number.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    const phone = this.selectedCountryCode + " " + phoneRaw;

    if (!this.regDoorNo.trim()) {
      this.regErrorMessage = "Please enter your D.No / Flat / House No.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!this.regStreet.trim()) {
      this.regErrorMessage = "Please enter your street name / layout.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!this.regCity.trim()) {
      this.regErrorMessage = "Please enter your city.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!this.regState.trim()) {
      this.regErrorMessage = "Please enter your state.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!this.regPincode.trim() || !this.isValidPincode(this.regPincode)) {
      this.regErrorMessage = "Please enter a valid 6-digit postal pincode.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (this.selectedSkills.length === 0) {
      this.regErrorMessage = "Please select or type at least one technical skill.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (this.regTrackType === 'internship' && !this.regCourse) {
      this.regErrorMessage = "Please select the course you want for your internship.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    if (!this.regAgreeTerms) {
      this.regErrorMessage = "Please accept the Terms of Service & Placement Policy.";
      this.toastService.showError(this.regErrorMessage);
      return;
    }

    const selectedCourseTitle = this.regCourse || this.regTargetCourse || "Java Full Stack with Angular";
    const matchedCourse = this.courses.find(
      (c) => c.title.toLowerCase() === selectedCourseTitle.toLowerCase() || c.id === selectedCourseTitle
    );

    const skillsString = this.selectedSkills.length > 0 ? this.selectedSkills.join(", ") : (this.regTechStack.trim() || "Java, Spring Boot, Angular");

    const payload: any = {
      name: fullName,
      email: this.regEmail.trim().toLowerCase(),
      role: "student",
      personalPhone: phone,
      emergencyPhone: this.regEmergencyPhone.trim() ? (this.emergencyCountryCode + " " + this.regEmergencyPhone.trim()) : undefined,
      contactNum: phone,
      doorNo: this.regDoorNo.trim() || undefined,
      street: this.regStreet.trim() || undefined,
      city: this.regCity.trim() || this.regPreferredLocation,
      state: this.regState.trim() || (this.regPreferredLocation === 'Chennai' ? 'Tamil Nadu' : 'Karnataka'),
      pincode: this.regPincode.trim() || undefined,
      preferredLocation: this.regPreferredLocation || this.regCampus || "Bangalore",
      trackType: this.regTrackType,
      targetCourse: matchedCourse ? matchedCourse.title : selectedCourseTitle,
      courseId: matchedCourse ? matchedCourse.id : undefined,
      internshipSkills: this.regTrackType === 'internship' ? skillsString : undefined,
      availabilityToJoin: this.regTrackType === 'internship' ? (this.regAvailabilityDate || this.minAvailabilityDate) : undefined,
      techStack: this.regTrackType === 'job' ? skillsString : undefined,
      resumeFileName: this.regTrackType === 'job' ? (this.regResumeFileName || undefined) : undefined,
      resumeFileSize: this.regTrackType === 'job' ? (this.regResumeFileSize || undefined) : undefined,
      collegeName: this.regCollegeName.trim() || undefined,
      branch: this.regBranch || undefined,
      academicStatus: this.regAcademicStatus || undefined
    };

    this.isRegistering = true;
    this.dataService.register(payload).subscribe({
      next: (res) => {
        this.isRegistering = false;
        if (res.success) {
          this.submittedStudentInfo = {
            name: fullName,
            email: payload.email,
            course: payload.targetCourse,
            campus: payload.preferredLocation,
          };

          // In approval-based access: DO NOT auto-sign in, student is pending approval
          this.closeRegModal();
          this.showSuccessApplicationModal = true;
          this.toastService.showSuccess(`Application received! Your login will be enabled once admissions approves your application.`);
        }
      },
      error: (err) => {
        this.isRegistering = false;
        console.error("Registration error", err);
        const errMsg = err.error?.message || err.error?.error || "Registration failed. This email address might already be registered.";
        this.regErrorMessage = errMsg;
        this.toastService.showError(errMsg);
      },
    });
  }

  goToPortalFromSuccess(): void {
    if (this.showSuccessApplicationModal) {
      this.showSuccessApplicationModal = false;
      this.scrollLockService.unlock();
    }
    this.router.navigate(["/home"]);
  }

  submitLogin(): void {
    this.loginErrorMessage = "";
    if (!this.loginEmail.trim()) {
      this.loginErrorMessage = "Please enter your registered email address.";
      this.toastService.showError(this.loginErrorMessage);
      return;
    }

    if (!this.loginPassword) {
      this.loginErrorMessage = "Please enter your password or temporary password.";
      this.toastService.showError(this.loginErrorMessage);
      return;
    }

    this.isLoggingIn = true;
    this.dataService.login(this.loginEmail.trim(), this.loginPassword).subscribe({
      next: (res: any) => {
        this.isLoggingIn = false;
        this.loginErrorMessage = "";
        if (res.success && res.user) {
          this.closeLoginModal();
          if (res.mustChangePassword) {
            // Mandatory Set New Password screen - block portal until changed
            this.changePassEmail = res.user.email;
            this.changePassCurrent = this.loginPassword;
            this.changePassNew = "";
            this.changePassConfirm = "";
            this.changePassErrorMessage = "";
            this.showChangePasswordModal = true;
            this.toastService.showInfo("First-time sign in: Please set your permanent password to continue.");
          } else {
            this.toastService.showSuccess(`Welcome back, ${res.user.name}!`);
            this.router.navigate(["/dashboard"]);
          }
        }
      },
      error: (err) => {
        this.isLoggingIn = false;
        console.error("Login error", err);
        const errMsg = err.error?.message || err.error?.error || "Invalid username or password. Please check your credentials.";
        this.loginErrorMessage = errMsg;
        this.toastService.showError(errMsg);
      },
    });
  }

  fillQuickLogin(role: 'admin' | 'frontdesk' | 'trainer' | 'student'): void {
    this.loginErrorMessage = "";
    if (role === 'admin') {
      this.loginEmail = 'admin@tvktechs.com';
      this.loginPassword = 'password123';
    } else if (role === 'frontdesk') {
      this.loginEmail = 'frontdesk@tvktechs.com';
      this.loginPassword = 'password123';
    } else if (role === 'trainer') {
      this.loginEmail = 'trainer.java@tvktechs.com';
      this.loginPassword = 'password123';
    } else if (role === 'student') {
      this.loginEmail = 'rahul.b@gmail.com';
      this.loginPassword = 'password123';
    }
  }

  submitFirstTimeLogin(): void {
    this.forgotPassword();
  }

  forgotPassword(): void {
    this.loginErrorMessage = "";
    if (!this.loginEmail.trim()) {
      this.loginErrorMessage = "Please enter your registered email address above first.";
      this.toastService.showError(this.loginErrorMessage);
      return;
    }

    this.isLoggingIn = true;
    this.dataService.requestTempPassword(this.loginEmail.trim()).subscribe({
      next: (res: any) => {
        this.isLoggingIn = false;
        this.toastService.showInfo(res.message || "Your application is approved. Use the temporary password sent to you upon approval.");
      },
      error: (err: any) => {
        this.isLoggingIn = false;
        console.error("Forgot password error", err);
        const errMsg = err.error?.message || err.error?.error || "Could not retrieve access. Please contact admissions.";
        this.loginErrorMessage = errMsg;
        this.toastService.showError(errMsg);
      },
    });
  }

  requestTemporaryPassword(): void {
    this.forgotPassword();
  }

  fillTempPasswordAndLogin(): void {
    this.forgotPassword();
  }

  submitChangePassword(): void {
    this.changePassErrorMessage = "";
    if (!this.changePassNew.trim() || this.changePassNew.length < 6) {
      this.changePassErrorMessage = "New password must be at least 6 characters long.";
      this.toastService.showError(this.changePassErrorMessage);
      return;
    }

    if (this.changePassNew !== this.changePassConfirm) {
      this.changePassErrorMessage = "New password and confirm password do not match.";
      this.toastService.showError(this.changePassErrorMessage);
      return;
    }

    this.isChangingPassword = true;
    this.dataService
      .changePassword(this.changePassEmail, this.changePassCurrent, this.changePassNew)
      .subscribe({
        next: (res) => {
          this.isChangingPassword = false;
          if (res.success) {
            this.showChangePasswordModal = false;
            this.toastService.showSuccess("Password set successfully! Access granted to your student portal.");
            this.router.navigate(["/dashboard"]);
          }
        },
        error: (err) => {
          this.isChangingPassword = false;
          console.error("Change password error", err);
          const errMsg = err.error?.message || err.error?.error || "Failed to change password. Please try again.";
          this.changePassErrorMessage = errMsg;
          this.toastService.showError(errMsg);
        },
      });
  }

  ngOnDestroy(): void {
    this.stopOtpCountdown();
  }
}

