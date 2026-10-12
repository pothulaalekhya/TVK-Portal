import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import { ToastService } from "../../services/toast.service";
import { TemplateService } from "../../services/template.service";
import { User, Enrollment, Course, ContactRequest, MessageTemplate, RoleHistoryEntry } from "../../models/models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  // App Shell & Layout State
  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  showCommandPalette = false;
  showNotificationsDropdown = false;
  showUserDropdown = false;
  searchQueryGlobal = "";

  // Custom Confirmation Dialog State (No native browser alerts/confirms)
  showConfirmDialog = false;
  confirmDialogData = {
    title: "",
    message: "",
    confirmText: "Confirm",
    isDanger: true,
    action: () => {},
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

  // Admin & Frontdesk specific
  adminTab: "frontdesk" | "stats" | "courses" | "users" | "inquiries" | "logs" | "trainers" | "certificates" = "frontdesk";
  users: User[] = [];
  inquiries: ContactRequest[] = [];

  // Frontdesk Telecaller & Admissions Desk State
  frontdeskTabFilter: "all" | "my_leads" | "today_allocated" | "need_contact" | "interested" | "not_interested" | "followup_needed" | "contacted" | "replied" | "ready_to_join" | "not_on_wa" | "unassigned" = "all";
  frontdeskSearchQuery: string = "";
  frontdeskLocationFilter: string = "all";
  frontdeskTrackFilter: string = "all";
  frontdeskCounselorFilter: string = "all";
  frontdeskDateFilter: string = "all"; // "all" | "today" | "past_3_days" | "this_week"
  frontdeskSortBy: "newest" | "oldest" | "name" | "followupdate" = "newest";
  frontdeskViewMode: "comfortable" | "compact" = "comfortable";
  editingReplyUserId: string | null = null;
  tempReplyText: string = "";
  selectedLeadIds: Set<string> = new Set();
  isUpdatingFollowUp = false;
  selectedCounselorFilter: string = "all";
  allocationDateFilter: string = "all";
  admissionsPage: number = 1;
  admissionsPerPage: number = 10;
  activeDrawerUser: User | null = null;
  activeDrawerTab: "profile" | "notes" | "timeline" = "profile";

  // Counselor Allocation & Attendance State
  showAllocationModal = false;
  allocationForm = {
    counselorId: "",
    count: 10,
    locationFilter: "all",
    trackFilter: "all",
  };
  isAllocatingLeads = false;

  // Attendance & Day-off Management
  showAttendanceModal = false;
  attendanceTargetStaff: User | null = null;
  attendanceFormStatus: "ON_DUTY" | "ON_LEAVE" = "ON_DUTY";
  attendanceFormReason: string = "";
  isUpdatingAttendance = false;

  // Day-off Redistribution Modal
  showRedistributionModal = false;
  redistributeFromStaff: User | null = null;
  redistributionStrategy: "even" | "single" = "even";
  redistributeTargetCounselorId: string = "";
  redistributeUncontactedOnly: boolean = true;
  isRedistributing = false;

  // Message Template Management & Dynamic Sender State
  templates: MessageTemplate[] = [];
  showTemplateManagerModal = false;
  templateManagerChannel: "all" | "whatsapp" | "email" = "all";
  editingTemplate: Partial<MessageTemplate> | null = null;
  isSavingTemplate = false;

  // Shared WhatsApp Template & Bulk Action State
  activeWhatsAppTemplateId: string = "tpl-reg-welcome";
  showTemplateEditModal: boolean = false;
  editingSharedTemplate: Partial<MessageTemplate> = {};
  bulkTargetCounselorId: string = "";

  availableTemplateVariables = [
    { code: "{name}", label: "Candidate Full Name" },
    { code: "{firstName}", label: "First Name Only" },
    { code: "{course}", label: "Target Course / Track" },
    { code: "{location}", label: "Preferred Campus Hub" },
    { code: "{phone}", label: "Phone Number" },
    { code: "{email}", label: "Email Address" },
    { code: "{counselorName}", label: "Assigned Counselor Name" },
    { code: "{fee}", label: "Course Tuition Fee" },
    { code: "{date}", label: "Today's Date" },
  ];

  // Quick Send WhatsApp / Email Modal
  showSendModal = false;
  activeSendUser: User | null = null;
  activeSendChannel: "whatsapp" | "email" = "whatsapp";
  selectedTemplateId: string = "";
  customSendBody: string = "";
  customSendSubject: string = "";
  activeActionMenuId: string | null = null;
  newDrawerNote = "";
  timelineNotesMap: { [userId: string]: Array<{ date: string; author: string; text: string }> } = {};

  // Admin User Management State
  userRoleFilter: string = "all";
  userSearchQuery: string = "";
  userPaymentFilter: string = "all";
  userApprovalFilter: string = "all";
  userBatchFilter: string = "";
  userTrackFilter: string = "all";
  userLocationFilter: string = "all";
  userSortOrder: "newest" | "oldest" | "name" = "newest";
  editingUserId: string | null = null;
  editUserForm: Partial<User> = {};
  isSavingUser = false;

  // Selected candidate profile modal
  selectedCandidateDetail: User | null = null;

  // Role Transition & Career Progression Modal State
  showRoleTransitionModal = false;
  transitionTargetUser: User | null = null;
  transitionForm = {
    newRole: "trainer" as "student" | "trainer" | "admin" | "frontdesk" | "staff" | "alumni",
    designation: "",
    department: "Training & Placement",
    employeeId: "",
    specialization: "",
    strongTechnologies: "",
    notes: "",
  };
  isTransitioningRole = false;

  // Global Admin Staff (Trainer / Admin / Frontdesk) Provisioning
  showAddStaffModal = false;
  newStaffForm = {
    name: "",
    email: "",
    role: "trainer" as "trainer" | "admin" | "frontdesk",
    password: "password123",
    specialization: "",
    strongTechnologies: "",
  };
  isSavingStaff = false;

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
    price: "₹34,999",
    fee: 34999,
    featuresText: "100% Job Confirmation, Real-Time Projects",
    syllabusText: "Core Java OOPs, Spring Boot Web, CI/CD Cloud",
  };
  isSavingCourse = false;

  private subscriptions: Subscription[] = [];

  constructor(
    public dataService: DataService,
    public templateService: TemplateService,
    private toastService: ToastService,
    private router: Router
  ) { }

  goToPublicHome(): void {
    this.router.navigate(["/home"]);
  }

  logout(): void {
    this.dataService.setCurrentUser(null);
    this.router.navigate(["/home"]);
    this.toastService.showSuccess("Logged out successfully.");
  }

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
      }),
      this.templateService.templates$.subscribe((tpls) => {
        this.templates = tpls;
      })
    );

    // Initial check
    if (this.currentUser?.role === "admin" || this.currentUser?.role === "frontdesk") {
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

    // Frontdesk specific: Default to showing "My Allocated Leads" if logged in as frontdesk counselor
    if (this.currentUser.role === "frontdesk" && this.frontdeskTabFilter === "all") {
      this.frontdeskTabFilter = "my_leads";
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

  // ==================== FRONTDESK & COUNSELOR COMPUTED GETTERS ====================

  getTodayString(): string {
    return new Date().toISOString().split("T")[0];
  }

  get frontdeskStaff(): User[] {
    return this.users.filter(u => u.role === "frontdesk");
  }

  get activeFrontdeskStaff(): User[] {
    return this.frontdeskStaff.filter(u => u.attendanceStatus !== "ON_LEAVE");
  }

  get offDutyFrontdeskStaff(): User[] {
    return this.frontdeskStaff.filter(u => u.attendanceStatus === "ON_LEAVE");
  }

  getCounselorName(counselorId?: string): string {
    if (!counselorId) return "Unassigned";
    const found = this.users.find(u => u.id === counselorId);
    return found ? found.name : counselorId;
  }

  getCounselorStats(counselorId: string): {
    total: number;
    totalAssigned: number;
    todayAssigned: number;
    contacted: number;
    pending: number;
    interested: number;
    notInterested: number;
  } {
    const today = this.getTodayString();
    const staff = this.frontdeskStaff.find(s => s.id === counselorId || s.name === counselorId);
    const staffName = staff ? staff.name : counselorId;
    const leads = this.users.filter(u => u.role === "student" && (u.assignedCounselorId === counselorId || u.assignedCounselor === staffName));
    const total = leads.length;
    const todayAssigned = leads.filter(u => u.allocatedDate === today).length;
    const contacted = leads.filter(u => u.followUpStatus && u.followUpStatus !== "Need to Contact").length;
    const pending = leads.filter(u => !u.followUpStatus || u.followUpStatus === "Need to Contact").length;
    const interested = leads.filter(u => u.followUpStatus === "Interested" || u.followUpStatus === "Ready to Join").length;
    const notInterested = leads.filter(u => u.followUpStatus === "Not Interested").length;

    return {
      total,
      totalAssigned: total,
      todayAssigned,
      contacted,
      pending,
      interested,
      notInterested,
    };
  }

  getLeadsForStaff(counselorId: string): User[] {
    const staff = this.frontdeskStaff.find(s => s.id === counselorId || s.name === counselorId);
    const staffName = staff ? staff.name : counselorId;
    return this.users.filter(u => u.role === "student" && (u.assignedCounselorId === counselorId || u.assignedCounselor === staffName));
  }

  // Assigned Leads Drawer / Modal
  showCounselorLeadsModal = false;
  viewingCounselorLeadsStaff: User | null = null;

  openCounselorLeadsModal(staff: User): void {
    this.viewingCounselorLeadsStaff = staff;
    this.showCounselorLeadsModal = true;
  }

  closeCounselorLeadsModal(): void {
    this.showCounselorLeadsModal = false;
    this.viewingCounselorLeadsStaff = null;
  }

  filterAndScrollToTable(staff: User): void {
    this.frontdeskCounselorFilter = staff.id;
    this.selectedCounselorFilter = staff.id;
    this.frontdeskTabFilter = 'all';
    this.closeCounselorLeadsModal();
    if (typeof document !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById("admissions-table-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
    this.toastService.showInfo(`Filtered leads assigned to ${staff.name}`);
  }

  clearCounselorFilter(): void {
    this.frontdeskCounselorFilter = "all";
    this.selectedCounselorFilter = "all";
  }

  getActiveFilteredCounselorName(): string {
    if (this.frontdeskCounselorFilter === "all") return "";
    if (this.frontdeskCounselorFilter === "unassigned") return "Unassigned Leads";
    if (this.frontdeskCounselorFilter === "my_leads") return "My Allocated Leads";
    const staff = this.frontdeskStaff.find(s => s.id === this.frontdeskCounselorFilter || s.name === this.frontdeskCounselorFilter);
    return staff ? staff.name : this.frontdeskCounselorFilter;
  }

  get staffWithPendingLeadsOnLeave(): Array<{
    staff: User;
    name: string;
    id: string;
    leaveReason?: string;
    pendingCount: number;
    pendingLeads: User[];
  }> {
    const result: Array<{
      staff: User;
      name: string;
      id: string;
      leaveReason?: string;
      pendingCount: number;
      pendingLeads: User[];
    }> = [];

    for (const staff of this.offDutyFrontdeskStaff) {
      const pendingLeads = this.users.filter(
        u => u.role === "student" && u.assignedCounselorId === staff.id && (!u.followUpStatus || u.followUpStatus === "Need to Contact")
      );
      if (pendingLeads.length > 0) {
        result.push({
          staff,
          name: staff.name,
          id: staff.id,
          leaveReason: staff.leaveReason,
          pendingCount: pendingLeads.length,
          pendingLeads,
        });
      }
    }
    return result;
  }

  getOtherActiveStaff(excludeId?: string): User[] {
    return this.activeFrontdeskStaff.filter(s => s.id !== excludeId);
  }

  get redistributeTotalCount(): number {
    if (!this.redistributeFromStaff) return 0;
    const id = this.redistributeFromStaff.id;
    return this.users.filter(u => u.role === "student" && u.assignedCounselorId === id).length;
  }

  get templateList(): MessageTemplate[] {
    if (this.templateManagerChannel === "all") {
      return this.templates;
    }
    return this.templates.filter(t => t.channel === this.templateManagerChannel || t.channel === "both");
  }

  getTemplatesForChannel(channel?: string): MessageTemplate[] {
    const ch = channel || this.activeSendChannel;
    return this.templates.filter(t => t.channel === ch || t.channel === "both");
  }

  // Follow-up & admissions KPI metrics
  get leadStats() {
    const students = this.users.filter(u => u.role === "student");
    const total = students.length;
    const today = this.getTodayString();

    const needToContact = students.filter(s => !s.followUpStatus || s.followUpStatus === "Need to Contact").length;
    const contacted = students.filter(s => s.followUpStatus === "Contacted").length;
    const followUpNeeded = students.filter(s => s.followUpStatus === "Follow-up Needed").length;
    const replied = students.filter(s => s.followUpStatus === "Replied").length;
    const readyToJoin = students.filter(s => s.followUpStatus === "Ready to Join").length;
    const interested = students.filter(s => s.followUpStatus === "Interested").length;
    const notInterested = students.filter(s => s.followUpStatus === "Not Interested").length;
    const notOnWa = students.filter(s => s.whatsappStatus === "No WA").length;
    const unassigned = students.filter(s => !s.assignedCounselorId).length;
    const todayAllocated = students.filter(s => s.allocatedDate === today).length;

    const touched = total - needToContact;
    const contactedPercentage = total > 0 ? Math.round((touched / total) * 100) : 0;
    const respondedCount = replied + readyToJoin + interested;
    const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0;

    return {
      total,
      unassigned,
      unassignedCount: unassigned,
      needToContact,
      contacted,
      followUpNeeded,
      replied,
      readyToJoin,
      interested,
      notInterested,
      notOnWa,
      todayAllocated,
      todayAllocatedCount: todayAllocated,
      contactedPercentage,
      responseRate,
      activeCounselorCount: this.activeFrontdeskStaff.length,
      offDutyCounselorCount: this.offDutyFrontdeskStaff.length,
    };
  }

  // Filtered student candidate roster for Frontdesk
  get frontdeskFilteredStudents(): User[] {
    let list = this.users.filter(u => u.role === "student");
    const today = this.getTodayString();

    // Persona-based lead isolation (if current user is counselor)
    if (this.currentUser?.role === "frontdesk" && this.frontdeskTabFilter === "my_leads") {
      list = list.filter(s => s.assignedCounselorId === this.currentUser!.id);
    }

    // Specific Counselor filter
    if (this.frontdeskCounselorFilter !== "all") {
      if (this.frontdeskCounselorFilter === "unassigned") {
        list = list.filter(s => !s.assignedCounselorId);
      } else if (this.frontdeskCounselorFilter === "my_leads") {
        list = list.filter(s => s.assignedCounselorId === this.currentUser?.id || s.assignedCounselor === this.currentUser?.name);
      } else {
        const staff = this.frontdeskStaff.find(st => st.id === this.frontdeskCounselorFilter || st.name === this.frontdeskCounselorFilter);
        const staffName = staff ? staff.name : this.frontdeskCounselorFilter;
        list = list.filter(s => s.assignedCounselorId === this.frontdeskCounselorFilter || s.assignedCounselor === staffName);
      }
    }

    // Allocation Date Filter
    if (this.frontdeskDateFilter === "today") {
      list = list.filter(s => s.allocatedDate === today);
    } else if (this.frontdeskDateFilter === "past_3_days") {
      const now = new Date();
      list = list.filter(s => {
        if (!s.allocatedDate) return false;
        const diffDays = (now.getTime() - new Date(s.allocatedDate).getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 3;
      });
    } else if (this.frontdeskDateFilter === "this_week") {
      const now = new Date();
      list = list.filter(s => {
        if (!s.allocatedDate) return false;
        const diffDays = (now.getTime() - new Date(s.allocatedDate).getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      });
    }

    // Tab Pill Filter
    switch (this.frontdeskTabFilter) {
      case "my_leads":
        if (this.currentUser?.id) {
          list = list.filter(s => s.assignedCounselorId === this.currentUser!.id);
        }
        break;
      case "today_allocated":
        list = list.filter(s => s.allocatedDate === today);
        break;
      case "unassigned":
        list = list.filter(s => !s.assignedCounselorId);
        break;
      case "need_contact":
        list = list.filter(s => !s.followUpStatus || s.followUpStatus === "Need to Contact");
        break;
      case "interested":
        list = list.filter(s => s.followUpStatus === "Interested");
        break;
      case "contacted":
        list = list.filter(s => s.followUpStatus === "Contacted");
        break;
      case "followup_needed":
        list = list.filter(s => s.followUpStatus === "Follow-up Needed");
        break;
      case "replied":
        list = list.filter(s => s.followUpStatus === "Replied");
        break;
      case "ready_to_join":
        list = list.filter(s => s.followUpStatus === "Ready to Join");
        break;
      case "not_interested":
        list = list.filter(s => s.followUpStatus === "Not Interested");
        break;
      case "not_on_wa":
        list = list.filter(s => s.whatsappStatus === "No WA");
        break;
      case "all":
      default:
        break;
    }

    // Campus Hub Filter
    if (this.frontdeskLocationFilter !== "all") {
      const hub = this.frontdeskLocationFilter.toLowerCase();
      list = list.filter(s => {
        const loc = (s.preferredLocation || s.city || "").toLowerCase();
        if (hub.includes("bangalore")) {
          return loc.includes("bangalore") || loc.includes("bengaluru") || loc.includes("btm") || !loc;
        }
        if (hub.includes("chennai")) {
          return loc.includes("chennai") || loc.includes("omr");
        }
        return loc.includes(hub);
      });
    }

    // Program Track Filter
    if (this.frontdeskTrackFilter !== "all") {
      list = list.filter(s => s.trackType === this.frontdeskTrackFilter || s.targetCourse === this.frontdeskTrackFilter);
    }

    // Search Query
    if (this.frontdeskSearchQuery.trim()) {
      const q = this.frontdeskSearchQuery.trim().toLowerCase();
      list = list.filter(s =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.personalPhone || "").toLowerCase().includes(q) ||
        (s.contactNum || "").toLowerCase().includes(q) ||
        (s.preferredLocation || "").toLowerCase().includes(q) ||
        (s.targetCourse || "").toLowerCase().includes(q) ||
        (s.trackType || "").toLowerCase().includes(q) ||
        (s.candidateReply || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    return list.sort((a, b) => {
      if (this.frontdeskSortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (this.frontdeskSortBy === "followupdate") {
        const dateA = a.followUpDate || "9999-99-99";
        const dateB = b.followUpDate || "9999-99-99";
        return dateA.localeCompare(dateB);
      }
      if (this.frontdeskSortBy === "oldest") {
        return (a.createdAt || "").localeCompare(b.createdAt || "");
      }
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  }

  // ==================== ATTENDANCE MANAGEMENT METHODS ====================

  openAttendanceModal(staff: User): void {
    this.attendanceTargetStaff = staff;
    this.attendanceFormStatus = staff.attendanceStatus === "ON_LEAVE" ? "ON_LEAVE" : "ON_DUTY";
    this.attendanceFormReason = staff.leaveReason || "";
    this.showAttendanceModal = true;
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.attendanceTargetStaff = null;
  }

  submitAttendanceStatus(): void {
    if (!this.attendanceTargetStaff) return;
    const staff = this.attendanceTargetStaff;
    this.isUpdatingAttendance = true;

    this.dataService.setStaffAttendance(staff.id, this.attendanceFormStatus, this.attendanceFormReason).subscribe({
      next: (res) => {
        this.isUpdatingAttendance = false;
        if (res.success) {
          staff.attendanceStatus = this.attendanceFormStatus;
          staff.leaveReason = this.attendanceFormStatus === "ON_LEAVE" ? this.attendanceFormReason : "";
          staff.lastAttendanceUpdate = this.getTodayString();
          this.toastService.showSuccess(
            `Attendance for ${staff.name} marked as ${this.attendanceFormStatus === "ON_LEAVE" ? "OFF / ON LEAVE" : "ON DUTY"}`
          );
          this.closeAttendanceModal();
        }
      },
      error: (err) => {
        this.isUpdatingAttendance = false;
        console.error("Attendance update error", err);
        this.toastService.showError("Failed to update staff attendance.");
      }
    });
  }

  quickToggleAttendance(staff?: User | null): void {
    const target = staff || this.currentUser;
    if (!target) return;
    const newStatus = target.attendanceStatus === "ON_LEAVE" ? "ON_DUTY" : "ON_LEAVE";
    this.attendanceTargetStaff = target;
    this.attendanceFormStatus = newStatus;
    this.attendanceFormReason = newStatus === "ON_LEAVE" ? "Personal Day Off / Casual Leave" : "";
    if (newStatus === "ON_LEAVE") {
      this.openAttendanceModal(target);
    } else {
      this.submitAttendanceStatus();
    }
  }

  // ==================== BATCH LEAD ALLOCATION METHODS ====================

  openAllocationModal(): void {
    const defaultCounselor = this.activeFrontdeskStaff[0]?.id || "";
    this.allocationForm = {
      counselorId: defaultCounselor,
      count: 10,
      locationFilter: "all",
      trackFilter: "all",
    };
    this.showAllocationModal = true;
  }

  closeAllocationModal(): void {
    this.showAllocationModal = false;
  }

  submitBatchAllocation(): void {
    if (!this.allocationForm.counselorId) {
      this.toastService.showError("Please select a target counselor.");
      return;
    }

    const unassigned = this.users.filter(u => {
      if (u.role !== "student" || u.assignedCounselorId) return false;
      if (this.allocationForm.locationFilter !== "all") {
        const loc = (u.preferredLocation || u.city || "").toLowerCase();
        if (!loc.includes(this.allocationForm.locationFilter.toLowerCase())) return false;
      }
      if (this.allocationForm.trackFilter !== "all") {
        if (u.targetCourse !== this.allocationForm.trackFilter && u.trackType !== this.allocationForm.trackFilter) return false;
      }
      return true;
    });

    if (unassigned.length === 0) {
      this.toastService.showInfo("No unassigned student leads matching the criteria.");
      return;
    }

    const countToAssign = Math.min(this.allocationForm.count || 10, unassigned.length);
    const selectedIds = unassigned.slice(0, countToAssign).map(u => u.id);
    const counselor = this.users.find(u => u.id === this.allocationForm.counselorId);

    this.isAllocatingLeads = true;
    this.dataService.bulkAllocateLeads(selectedIds, this.allocationForm.counselorId).subscribe({
      next: (res) => {
        this.isAllocatingLeads = false;
        if (res.success) {
          const today = this.getTodayString();
          selectedIds.forEach(id => {
            const student = this.users.find(u => u.id === id);
            if (student) {
              student.assignedCounselorId = this.allocationForm.counselorId;
              student.assignedCounselor = counselor?.name;
              student.allocatedDate = today;
            }
          });
          this.toastService.showSuccess(`Allocated ${selectedIds.length} candidate leads to ${counselor?.name || 'counselor'}. Opening allocated students...`);
          this.closeAllocationModal();
          if (counselor) {
            this.openCounselorLeadsModal(counselor);
          }
        }
      },
      error: (err) => {
        this.isAllocatingLeads = false;
        console.error("Allocation error", err);
        this.toastService.showError("Failed to allocate leads.");
      }
    });
  }

  autoDistributeAllLeads(): void {
    const activeStaff = this.activeFrontdeskStaff;
    if (activeStaff.length === 0) {
      this.toastService.showError("No on-duty frontdesk counselors available for auto-distribution.");
      return;
    }

    const unassigned = this.users.filter(u => u.role === "student" && !u.assignedCounselorId);
    if (unassigned.length === 0) {
      this.toastService.showInfo("All student leads are already allocated to counselors.");
      return;
    }

    this.isAllocatingLeads = true;
    const today = this.getTodayString();
    let staffIndex = 0;
    let completed = 0;

    unassigned.forEach((student) => {
      const staff = activeStaff[staffIndex % activeStaff.length];
      staffIndex++;

      this.dataService.updateUser({
        id: student.id,
        assignedCounselorId: staff.id,
        assignedCounselor: staff.name,
        allocatedDate: today,
      }).subscribe({
        next: () => {
          student.assignedCounselorId = staff.id;
          student.assignedCounselor = staff.name;
          student.allocatedDate = today;
          completed++;
          if (completed === unassigned.length) {
            this.isAllocatingLeads = false;
            this.frontdeskTabFilter = "today_allocated";
            this.toastService.showSuccess(`Distributed ${unassigned.length} leads across ${activeStaff.length} on-duty counselors.`);
          }
        },
        error: () => {
          completed++;
          if (completed === unassigned.length) {
            this.isAllocatingLeads = false;
          }
        }
      });
    });
  }

  // ==================== DAY-OFF LEAD REDISTRIBUTION ====================

  openRedistributeModal(staffOrItem: any): void {
    const staff = staffOrItem?.staff || staffOrItem;
    this.redistributeFromStaff = staff;
    this.redistributionStrategy = "even";
    this.redistributeTargetCounselorId = this.getOtherActiveStaff(staff?.id)[0]?.id || "";
    this.redistributeUncontactedOnly = true;
    this.showRedistributionModal = true;
  }

  closeRedistributeModal(): void {
    this.showRedistributionModal = false;
    this.redistributeFromStaff = null;
  }

  submitRedistribution(): void {
    if (!this.redistributeFromStaff) return;
    const staffId = this.redistributeFromStaff.id;
    const activeStaff = this.getOtherActiveStaff(staffId);

    if (activeStaff.length === 0) {
      this.toastService.showError("No other on-duty counselors available to accept leads.");
      return;
    }

    let targetLeads = this.users.filter(u => u.role === "student" && u.assignedCounselorId === staffId);
    if (this.redistributeUncontactedOnly) {
      targetLeads = targetLeads.filter(u => !u.followUpStatus || u.followUpStatus === "Need to Contact");
    }

    if (targetLeads.length === 0) {
      this.toastService.showInfo("No matching leads to redistribute for this staff member.");
      this.closeRedistributeModal();
      return;
    }

    this.isAllocatingLeads = true;
    const today = this.getTodayString();

    if (this.redistributionStrategy === "single") {
      const targetCounselor = this.users.find(u => u.id === this.redistributeTargetCounselorId);
      if (!targetCounselor) {
        this.toastService.showError("Please select a target counselor.");
        this.isAllocatingLeads = false;
        return;
      }

      const leadIds = targetLeads.map(l => l.id);
      this.dataService.bulkAllocateLeads(leadIds, targetCounselor.id).subscribe({
        next: (res) => {
          this.isAllocatingLeads = false;
          if (res.success) {
            targetLeads.forEach(l => {
              l.assignedCounselorId = targetCounselor.id;
              l.assignedCounselor = targetCounselor.name;
              l.allocatedDate = today;
            });
            this.toastService.showSuccess(`Reallocated ${targetLeads.length} leads to ${targetCounselor.name}. Opening allocated students...`);
            this.closeRedistributeModal();
            this.openCounselorLeadsModal(targetCounselor);
          }
        },
        error: (err) => {
          this.isAllocatingLeads = false;
          console.error("Redistribution error", err);
          this.toastService.showError("Failed to redistribute leads.");
        }
      });
    } else {
      // Even distribution
      let staffIdx = 0;
      let completed = 0;

      targetLeads.forEach((lead) => {
        const counselor = activeStaff[staffIdx % activeStaff.length];
        staffIdx++;

        this.dataService.updateUser({
          id: lead.id,
          assignedCounselorId: counselor.id,
          assignedCounselor: counselor.name,
          allocatedDate: today,
        }).subscribe({
          next: () => {
            lead.assignedCounselorId = counselor.id;
            lead.assignedCounselor = counselor.name;
            lead.allocatedDate = today;
            completed++;
            if (completed === targetLeads.length) {
              this.isAllocatingLeads = false;
              this.toastService.showSuccess(`Evenly redistributed ${targetLeads.length} leads across ${activeStaff.length} counselors.`);
              this.closeRedistributeModal();
            }
          },
          error: () => {
            completed++;
            if (completed === targetLeads.length) {
              this.isAllocatingLeads = false;
            }
          }
        });
      });
    }
  }

  // ==================== MANUAL & BULK COUNSELOR ASSIGNMENT ====================

  assignLeadToCounselor(student: User, counselorId: string): void {
    const counselor = counselorId ? this.frontdeskStaff.find(s => s.id === counselorId) : null;
    const previousCounselorId = student.assignedCounselorId;
    const previousCounselor = student.assignedCounselor;
    const previousDate = student.allocatedDate;

    // Optimistic UI update
    student.assignedCounselorId = counselorId ? counselorId : undefined;
    student.assignedCounselor = counselor ? counselor.name : undefined;
    student.allocatedDate = counselorId ? this.getTodayString() : undefined;

    this.dataService.updateUser({
      id: student.id,
      assignedCounselorId: counselorId || undefined,
      assignedCounselor: counselor ? counselor.name : undefined,
      allocatedDate: student.allocatedDate || undefined,
    }).subscribe({
      next: () => {
        if (counselor) {
          this.toastService.showSuccess(`Lead for ${student.name} assigned to ${counselor.name}. Opening allocated leads...`);
          this.openCounselorLeadsModal(counselor);
        } else {
          this.toastService.showInfo(`Lead for ${student.name} marked as Unassigned`);
        }
      },
      error: (err) => {
        student.assignedCounselorId = previousCounselorId;
        student.assignedCounselor = previousCounselor;
        student.allocatedDate = previousDate;
        console.error("Failed to assign counselor", err);
        this.toastService.showError("Failed to update counselor assignment.");
      }
    });
  }

  bulkAssignSelectedLeads(counselorId: string): void {
    if (this.selectedLeadIds.size === 0) {
      this.toastService.showToast("Please select at least one candidate lead.", "warning");
      return;
    }

    const counselor = counselorId ? this.frontdeskStaff.find(s => s.id === counselorId) : null;
    const leadIds = Array.from(this.selectedLeadIds);
    const today = this.getTodayString();
    let completed = 0;

    leadIds.forEach(id => {
      const student = this.users.find(u => u.id === id);
      if (student) {
        student.assignedCounselorId = counselorId ? counselorId : undefined;
        student.assignedCounselor = counselor ? counselor.name : undefined;
        student.allocatedDate = counselorId ? today : undefined;

        this.dataService.updateUser({
          id: student.id,
          assignedCounselorId: counselorId || undefined,
          assignedCounselor: counselor ? counselor.name : undefined,
          allocatedDate: student.allocatedDate || undefined,
        }).subscribe({
          next: () => {
            completed++;
            if (completed === leadIds.length) {
              this.selectedLeadIds.clear();
              this.bulkTargetCounselorId = "";
              if (counselor) {
                this.toastService.showSuccess(`Successfully assigned ${leadIds.length} leads to ${counselor.name}! Opening allocated leads...`);
                this.openCounselorLeadsModal(counselor);
              } else {
                this.toastService.showInfo(`Marked ${leadIds.length} leads as Unassigned.`);
              }
            }
          },
          error: () => {
            completed++;
            if (completed === leadIds.length) {
              this.selectedLeadIds.clear();
            }
          }
        });
      }
    });
  }

  clearLeadSelection(): void {
    this.selectedLeadIds.clear();
  }

  // ==================== SHARED WHATSAPP & EMAIL MESSAGE DISPATCH ====================

  get whatsAppTemplates(): MessageTemplate[] {
    return this.templates.filter(t => t.channel === "whatsapp" || t.channel === "both" || !t.channel);
  }

  get activeWhatsAppTemplate(): MessageTemplate {
    const found = this.templates.find(t => t.id === this.activeWhatsAppTemplateId);
    return found || this.templateService.getDefaultTemplate("whatsapp");
  }

  onSelectSharedWhatsAppTemplate(id: string): void {
    this.activeWhatsAppTemplateId = id;
    const tpl = this.activeWhatsAppTemplate;
    this.toastService.showInfo(`Active WhatsApp template set to: "${tpl.title}"`);
  }

  openEditSharedTemplateModal(): void {
    const current = this.activeWhatsAppTemplate;
    this.editingSharedTemplate = { ...current };
    this.showTemplateEditModal = true;
  }

  closeEditSharedTemplateModal(): void {
    this.showTemplateEditModal = false;
    this.editingSharedTemplate = {};
  }

  get previewSharedTemplateBody(): string {
    if (!this.editingSharedTemplate?.body) return "";
    const sampleUser: Partial<User> = {
      name: "Rahul Sharma",
      targetCourse: "Java Full Stack Development",
      trackType: "job",
      preferredLocation: "Bengaluru",
      personalPhone: "+91 98765 43210",
      email: "rahul.sharma@example.com",
    };
    return this.templateService.interpolate(this.editingSharedTemplate.body, sampleUser as User, "Ms. Sneha Reddy");
  }

  saveSharedTemplate(): void {
    if (!this.editingSharedTemplate.title?.trim() || !this.editingSharedTemplate.body?.trim()) {
      this.toastService.showError("Template title and body cannot be empty.");
      return;
    }

    const saved = this.templateService.saveTemplate(this.editingSharedTemplate);
    this.activeWhatsAppTemplateId = saved.id;
    this.closeEditSharedTemplateModal();
    this.toastService.showSuccess(`WhatsApp template "${saved.title}" updated for all rows!`);
  }

  insertVariableIntoSharedTemplate(variableCode: string): void {
    const current = this.editingSharedTemplate.body || "";
    this.editingSharedTemplate.body = current + " " + variableCode;
  }

  openWhatsApp(user: User): void {
    const counselor = this.users.find(u => u.id === user.assignedCounselorId) || this.currentUser;
    const tpl = this.activeWhatsAppTemplate;
    const customBody = this.templateService.interpolate(tpl?.body || "", user, counselor?.name);
    const url = this.templateService.getWhatsAppUrl(user, counselor?.name, customBody);
    if (url && typeof window !== "undefined") {
      window.open(url, "_blank");
      this.markWhatsAppStatus(user, "Visited (Opened)");
    } else {
      this.toastService.showError("No valid phone number available for this candidate.");
    }
  }

  openEmail(user: User): void {
    this.openEmailDirect(user);
  }

  openEmailDirect(user: User, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (!user.email) {
      this.toastService.showError("No email found for candidate.");
      return;
    }

    const defaultTpl = this.templateService.getDefaultTemplate("email");
    const counselor = (user.assignedCounselorId ? this.users.find(u => u.id === user.assignedCounselorId) : null) || this.currentUser;
    const subject = defaultTpl?.subject 
      ? this.templateService.interpolate(defaultTpl.subject, user, counselor?.name)
      : `TVK Technologies - Training Program Details for ${user.name}`;
    const body = defaultTpl 
      ? this.templateService.interpolate(defaultTpl.body, user, counselor?.name)
      : `Dear ${user.name},\n\nThank you for reaching out to TVK Technologies. We are pleased to provide details on our career-ready training programs.`;

    const mailtoUrl = `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (typeof window !== "undefined") {
      window.open(mailtoUrl, "_blank");
    }
    this.toastService.showSuccess("Email composer opened with default template!");
  }

  openSendMessageModal(user: User, channel: "whatsapp" | "email" = "whatsapp"): void {
    this.activeSendUser = user;
    this.activeSendChannel = channel;
    const available = this.getTemplatesForChannel(channel);
    this.selectedTemplateId = available[0]?.id || "";
    this.refreshCustomSendFields();
    this.showSendModal = true;
  }

  closeSendMessageModal(): void {
    this.showSendModal = false;
    this.activeSendUser = null;
  }

  setSendChannel(channel: "whatsapp" | "email"): void {
    this.activeSendChannel = channel;
    const available = this.getTemplatesForChannel(channel);
    this.selectedTemplateId = available[0]?.id || "";
    this.refreshCustomSendFields();
  }

  onTemplateSelectChange(tplId: string): void {
    this.selectedTemplateId = tplId;
    this.refreshCustomSendFields();
  }

  private refreshCustomSendFields(): void {
    if (!this.activeSendUser) return;
    const sendUser = this.activeSendUser;
    const counselor = (sendUser.assignedCounselorId ? this.users.find(u => u.id === sendUser.assignedCounselorId) : null) || this.currentUser;
    const tpl = this.templates.find(t => t.id === this.selectedTemplateId);

    if (tpl) {
      this.customSendBody = this.templateService.interpolate(tpl.body, sendUser, counselor?.name);
      this.customSendSubject = tpl.subject ? this.templateService.interpolate(tpl.subject, sendUser, counselor?.name) : "TVK Technologies - Course Training Information";
    } else {
      this.customSendBody = `Hello ${sendUser.name || 'Candidate'}, greetings from TVK Technologies! We are reaching out regarding your interest in our professional IT training program.`;
      this.customSendSubject = "TVK Technologies - Course Training Information";
    }
  }

  dispatchCustomMessage(): void {
    if (!this.activeSendUser) return;
    const user = this.activeSendUser;

    if (this.activeSendChannel === "whatsapp") {
      const phone = user.personalPhone || user.contactNum;
      if (!phone) {
        this.toastService.showError("No phone number found for candidate.");
        return;
      }
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(this.customSendBody)}`;
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
        this.markWhatsAppStatus(user, "Visited (Opened)");
      }
      this.closeSendMessageModal();
      this.toastService.showSuccess("WhatsApp opened with customized message.");
    } else {
      const email = user.email;
      if (!email) {
        this.toastService.showError("No email address found for candidate.");
        return;
      }
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(this.customSendSubject)}&body=${encodeURIComponent(this.customSendBody)}`;
      if (typeof window !== "undefined") {
        window.open(mailtoUrl, "_blank");
      }
      this.closeSendMessageModal();
      this.toastService.showSuccess("Email client opened with message draft.");
    }
  }

  // ==================== TEMPLATE MANAGER MODAL ====================

  openTemplateManager(): void {
    this.editingTemplate = null;
    this.templateManagerChannel = "all";
    this.showTemplateManagerModal = true;
  }

  closeTemplateManager(): void {
    this.showTemplateManagerModal = false;
    this.editingTemplate = null;
  }

  startCreateNewTemplate(): void {
    this.editingTemplate = {
      title: "",
      channel: this.templateManagerChannel === "all" ? "whatsapp" : this.templateManagerChannel,
      category: "custom",
      subject: "TVK Training Update",
      body: "Hello {name}, greetings from TVK Technologies!",
      isDefault: false,
    };
  }

  startEditTemplate(tpl: MessageTemplate): void {
    this.editingTemplate = { ...tpl };
  }

  cancelEditTemplate(): void {
    this.editingTemplate = null;
  }

  insertVariableToEditingTemplate(varCode: string): void {
    if (!this.editingTemplate) return;
    this.editingTemplate.body = (this.editingTemplate.body || "") + " " + varCode;
  }

  saveEditingTemplate(): void {
    if (!this.editingTemplate?.title?.trim() || !this.editingTemplate?.body?.trim()) {
      this.toastService.showError("Template title and body are required.");
      return;
    }

    if (this.editingTemplate.id) {
      this.templateService.updateTemplate(this.editingTemplate.id, this.editingTemplate);
      this.toastService.showSuccess(`Template "${this.editingTemplate.title}" updated.`);
    } else {
      this.templateService.createTemplate(this.editingTemplate);
      this.toastService.showSuccess(`Template "${this.editingTemplate.title}" created.`);
    }
    this.editingTemplate = null;
  }

  deleteTemplate(id: string): void {
    if (confirm("Are you sure you want to delete this message template?")) {
      this.templateService.deleteTemplate(id);
      this.toastService.showSuccess("Template deleted.");
    }
  }

  resetTemplatesToDefault(): void {
    if (confirm("Reset all message templates to system defaults? Any custom modifications will be replaced.")) {
      this.templateService.resetToDefaults();
      this.toastService.showSuccess("Templates reset to defaults.");
    }
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
      price: "₹34,999",
      fee: 34999,
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
      price: course.price || "₹24,999",
      fee: course.fee || 24999,
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

    // Track filter (Internship vs Job Placement)
    if (this.userTrackFilter !== "all") {
      result = result.filter(u => u.trackType === this.userTrackFilter);
    }

    // Location filter (Bangalore vs Chennai)
    if (this.userLocationFilter !== "all") {
      const target = this.userLocationFilter.toLowerCase();
      result = result.filter(u => {
        const loc = (u.preferredLocation || u.city || u.address || "").toLowerCase();
        if (target === "bangalore" || target === "bengaluru") {
          return loc.includes("bangalore") || loc.includes("bengaluru") || loc.includes("btm") || !loc;
        }
        if (target === "chennai") {
          return loc.includes("chennai") || loc.includes("omr");
        }
        return loc.includes(target);
      });
    }

    // Payment status filter
    if (this.userPaymentFilter !== "all") {
      if (this.userPaymentFilter === "none") {
        result = result.filter(u => !u.paymentStatus);
      } else {
        result = result.filter(u => u.paymentStatus === this.userPaymentFilter);
      }
    }

    // Approval status filter (pending, approved, rejected, active)
    if (this.userApprovalFilter !== "all") {
      const f = this.userApprovalFilter.toLowerCase();
      if (f === "pending" || f === "pending_approval") {
        result = result.filter(u => !u.approvalStatus || u.approvalStatus.toUpperCase() === "PENDING_APPROVAL" || u.approvalStatus.toLowerCase() === "pending");
      } else if (f === "approved") {
        result = result.filter(u => u.approvalStatus?.toUpperCase() === "APPROVED" || u.approvalStatus?.toLowerCase() === "approved");
      } else if (f === "rejected") {
        result = result.filter(u => u.approvalStatus?.toUpperCase() === "REJECTED" || u.approvalStatus?.toLowerCase() === "rejected");
      } else if (f === "active") {
        result = result.filter(u => u.approvalStatus?.toUpperCase() === "ACTIVE" || (u.approvalStatus?.toUpperCase() === "APPROVED" && u.password && !u.mustChangePassword));
      } else {
        result = result.filter(u => u.approvalStatus?.toLowerCase() === f);
      }
    }

    // Batch filter
    if (this.userBatchFilter.trim()) {
      const batch = this.userBatchFilter.trim().toLowerCase();
      result = result.filter(u => u.batchNumber?.toLowerCase().includes(batch));
    }

    // Text search (name, email, contact, assigned trainer, location, skills)
    if (this.userSearchQuery.trim()) {
      const q = this.userSearchQuery.trim().toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.contactNum || "").toLowerCase().includes(q) ||
        (u.personalPhone || "").toLowerCase().includes(q) ||
        (u.emergencyPhone || "").toLowerCase().includes(q) ||
        (u.preferredLocation || "").toLowerCase().includes(q) ||
        (u.city || "").toLowerCase().includes(q) ||
        (u.targetCourse || "").toLowerCase().includes(q) ||
        (u.techStack || "").toLowerCase().includes(q) ||
        (u.internshipSkills || "").toLowerCase().includes(q) ||
        (u.assignedTrainer || "").toLowerCase().includes(q) ||
        (u.batchNumber || "").toLowerCase().includes(q)
      );
    }

    // Sorting (Newest, Oldest, Name)
    return result.sort((a, b) => {
      if (this.userSortOrder === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (this.userSortOrder === "oldest") {
        return (a.createdAt || "").localeCompare(b.createdAt || "");
      }
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  }

  clearUserFilters(): void {
    this.userRoleFilter = "all";
    this.userTrackFilter = "all";
    this.userLocationFilter = "all";
    this.userSearchQuery = "";
    this.userPaymentFilter = "all";
    this.userApprovalFilter = "all";
    this.userBatchFilter = "";
    this.userSortOrder = "newest";
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

  openCandidateDetail(user: User): void {
    this.selectedCandidateDetail = user;
  }

  closeCandidateDetail(): void {
    this.selectedCandidateDetail = null;
  }

  openAddStaffModal(role: "trainer" | "admin" = "trainer"): void {
    this.newStaffForm = {
      name: "",
      email: "",
      role,
      password: "password123",
      specialization: role === "trainer" ? "Full Stack Enterprise Architect" : "Institute Registrar & Admissions Lead",
      strongTechnologies: role === "trainer" ? "Core Java, Spring Boot, Microservices, Angular" : "Portal Administration & Student Placement",
    };
    this.showAddStaffModal = true;
  }

  closeAddStaffModal(): void {
    this.showAddStaffModal = false;
  }

  submitAddStaff(): void {
    if (!this.newStaffForm.name.trim() || !this.newStaffForm.email.trim() || !this.newStaffForm.password) {
      this.toastService.showError("Name, email, and password are required.");
      return;
    }

    this.isSavingStaff = true;
    this.dataService.createUserByAdmin({
      name: this.newStaffForm.name.trim(),
      email: this.newStaffForm.email.trim(),
      role: this.newStaffForm.role,
      password: this.newStaffForm.password,
      specialization: this.newStaffForm.specialization,
      strongTechnologies: this.newStaffForm.strongTechnologies,
      approvalStatus: "approved",
    }).subscribe({
      next: (res) => {
        this.isSavingStaff = false;
        if (res.success) {
          this.toastService.showSuccess(`New ${this.newStaffForm.role.toUpperCase()} account created successfully!`);
          this.closeAddStaffModal();
        }
      },
      error: (err) => {
        this.isSavingStaff = false;
        console.error("Failed to create staff", err);
        const errMsg = err.error?.error || "Failed to create account. Email might already exist.";
        this.toastService.showError(errMsg);
      }
    });
  }

  // Inline Temporary Password state for candidate rows
  revealedPasswordUserIds: Set<string> = new Set<string>();
  inlineTempPasswords: Record<string, string> = {};

  isPasswordRevealed(userId: string): boolean {
    return this.revealedPasswordUserIds.has(userId);
  }

  togglePasswordReveal(userId: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.revealedPasswordUserIds.has(userId)) {
      this.revealedPasswordUserIds.delete(userId);
    } else {
      this.revealedPasswordUserIds.add(userId);
    }
  }

  getDisplayTempPassword(user: User): string {
    return this.inlineTempPasswords[user.id] || user.tempPassword || user.password || "";
  }

  hasActiveTempPassword(user: User): boolean {
    if (user.role !== "student") return false;
    const status = (user.approvalStatus || "").toUpperCase();
    if (status === "ACTIVE" || (!user.mustChangePassword && user.password && (status === "APPROVED" || status === "ACTIVE"))) {
      return false;
    }
    return status === "APPROVED" || status === "approved";
  }

  copyInlineTempPassword(user: User, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const pw = this.getDisplayTempPassword(user);
    if (!pw) {
      this.toastService.showError("No temporary password available for this candidate.");
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(pw).then(() => {
        this.toastService.showSuccess(`Temporary password for ${user.name} copied to clipboard!`);
      }).catch(() => {
        this.toastService.showSuccess(`Temporary password: ${pw}`);
      });
    } else {
      this.toastService.showSuccess(`Temporary password: ${pw}`);
    }
  }

  // Rejection Dialog state
  showRejectModal = false;
  rejectCandidateUser: User | null = null;
  rejectionReasonInput = "";
  isSubmittingRejection = false;

  get pendingCandidatesCount(): number {
    return this.users.filter(u =>
      u.role === 'student' &&
      (!u.approvalStatus || u.approvalStatus.toUpperCase() === 'PENDING_APPROVAL' || u.approvalStatus.toLowerCase() === 'pending')
    ).length;
  }

  getStatusBadge(user: User): { label: string; class: string; icon: string } {
    const status = user.approvalStatus ? user.approvalStatus.toUpperCase() : "PENDING_APPROVAL";
    if (status === "REJECTED") {
      return { label: "Rejected", class: "bg-rose-100 text-rose-800 border border-rose-200", icon: "🔴" };
    }
    if (status === "PENDING_APPROVAL" || status === "PENDING") {
      return { label: "Pending Approval", class: "bg-amber-100 text-amber-800 border border-amber-200", icon: "🟡" };
    }
    if (status === "ACTIVE" || (status === "APPROVED" && user.password && !user.mustChangePassword)) {
      return { label: "Password Changed / Active", class: "bg-emerald-100 text-emerald-800 border border-emerald-200", icon: "✅" };
    }
    return { label: "Approved", class: "bg-teal-100 text-teal-800 border border-teal-200", icon: "🟢" };
  }

  approveUser(user: User): void {
    this.dataService.approveCandidate(user.id, this.currentUser?.name || "Admissions Desk").subscribe({
      next: (res) => {
        if (res.success && res.tempPassword) {
          user.approvalStatus = "APPROVED";
          user.mustChangePassword = true;
          user.tempPassword = res.tempPassword;
          user.tempPasswordExpiresAt = res.expiresAt;
          this.inlineTempPasswords[user.id] = res.tempPassword;

          if (this.selectedCandidateDetail && this.selectedCandidateDetail.id === user.id) {
            this.selectedCandidateDetail.approvalStatus = "APPROVED";
            this.selectedCandidateDetail.mustChangePassword = true;
            this.selectedCandidateDetail.tempPassword = res.tempPassword;
            this.selectedCandidateDetail.tempPasswordExpiresAt = res.expiresAt;
          }

          this.toastService.showSuccess("Approved — temporary password generated");
        }
      },
      error: (err) => {
        console.error("Approval error", err);
        const errMsg = err.error?.message || err.error?.error || "Failed to approve candidate. Permission required.";
        this.toastService.showError(errMsg);
      }
    });
  }

  openRejectModal(user: User): void {
    this.rejectCandidateUser = user;
    this.rejectionReasonInput = "Application does not meet current batch requirements.";
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectCandidateUser = null;
    this.rejectionReasonInput = "";
  }

  submitRejectCandidate(): void {
    if (!this.rejectCandidateUser) return;
    this.isSubmittingRejection = true;
    this.dataService.rejectCandidate(
      this.rejectCandidateUser.id,
      this.rejectionReasonInput.trim(),
      this.currentUser?.name || "Admissions Desk"
    ).subscribe({
      next: (res) => {
        this.isSubmittingRejection = false;
        if (res.success) {
          this.toastService.showSuccess(`Candidate '${this.rejectCandidateUser?.name}' marked as Rejected.`);
          if (this.selectedCandidateDetail && this.selectedCandidateDetail.id === this.rejectCandidateUser?.id) {
            this.selectedCandidateDetail.approvalStatus = "REJECTED";
            this.selectedCandidateDetail.rejectionReason = this.rejectionReasonInput.trim();
          }
          this.closeRejectModal();
        }
      },
      error: (err) => {
        this.isSubmittingRejection = false;
        console.error("Rejection error", err);
        const errMsg = err.error?.message || err.error?.error || "Failed to reject candidate.";
        this.toastService.showError(errMsg);
      }
    });
  }

  regenerateTempPassword(user: User): void {
    this.dataService.regenerateTempPassword(user.id).subscribe({
      next: (res) => {
        if (res.success && res.tempPassword) {
          user.tempPassword = res.tempPassword;
          user.tempPasswordExpiresAt = res.expiresAt;
          user.mustChangePassword = true;
          this.inlineTempPasswords[user.id] = res.tempPassword;

          if (this.selectedCandidateDetail && this.selectedCandidateDetail.id === user.id) {
            this.selectedCandidateDetail.tempPassword = res.tempPassword;
            this.selectedCandidateDetail.tempPasswordExpiresAt = res.expiresAt;
            this.selectedCandidateDetail.mustChangePassword = true;
          }

          this.toastService.showSuccess("Temporary password regenerated!");
        }
      },
      error: (err) => {
        console.error("Regenerate temp password error", err);
        const errMsg = err.error?.message || err.error?.error || "Failed to regenerate temporary password.";
        this.toastService.showError(errMsg);
      }
    });
  }

  // --- Role Transition & Career Progression Methods ---
  openRoleTransitionModal(user: User): void {
    this.transitionTargetUser = user;
    const defaultNewRole = user.role === "student" ? "trainer" : (user.role === "trainer" ? "staff" : "trainer");
    this.transitionForm = {
      newRole: defaultNewRole as any,
      designation: user.role === "student" ? "Associate Technical Trainer" : (user.designation || "Staff Member"),
      department: user.role === "student" ? "Academic & Training Division" : (user.department || "Training & Placement"),
      employeeId: user.employeeId || `TVK-${user.role === 'student' ? 'TR' : 'ST'}-${Math.floor(100 + Math.random() * 900)}`,
      specialization: user.specialization || user.targetCourse || "Java Full Stack & Angular",
      strongTechnologies: user.strongTechnologies || user.internshipSkills || user.techStack || "Java, Spring Boot, Angular, TypeScript, SQL",
      notes: `Promoted from ${user.role?.toUpperCase() || 'STUDENT'} to ${defaultNewRole.toUpperCase()} based on stellar course performance and technical evaluation.`,
    };
    this.showRoleTransitionModal = true;
  }

  closeRoleTransitionModal(): void {
    this.showRoleTransitionModal = false;
    this.transitionTargetUser = null;
    this.isTransitioningRole = false;
  }

  submitRoleTransition(): void {
    if (!this.transitionTargetUser) return;
    if (!this.transitionForm.newRole) {
      this.toastService.showError("Please select a target role.");
      return;
    }

    this.isTransitioningRole = true;
    this.dataService.transitionUserRole({
      userId: this.transitionTargetUser.id,
      newRole: this.transitionForm.newRole,
      designation: this.transitionForm.designation.trim(),
      department: this.transitionForm.department.trim(),
      employeeId: this.transitionForm.employeeId.trim(),
      specialization: this.transitionForm.specialization.trim(),
      strongTechnologies: this.transitionForm.strongTechnologies.trim(),
      notes: this.transitionForm.notes.trim(),
    }).subscribe({
      next: (res) => {
        this.isTransitioningRole = false;
        if (res.success) {
          this.toastService.showSuccess(`Success! ${this.transitionTargetUser?.name} has been promoted to ${this.transitionForm.newRole.toUpperCase()}.`);
          if (this.selectedCandidateDetail && this.selectedCandidateDetail.id === res.user.id) {
            this.selectedCandidateDetail = res.user;
          }
          this.closeRoleTransitionModal();
        }
      },
      error: (err) => {
        this.isTransitioningRole = false;
        console.error("Role transition error", err);
        const errMsg = err.error?.message || err.error?.error || "Failed to transition user role.";
        this.toastService.showError(errMsg);
      }
    });
  }

  getParsedRoleHistory(user: User | null): RoleHistoryEntry[] {
    if (!user || !user.roleHistory) return [];
    if (Array.isArray(user.roleHistory)) return user.roleHistory;
    if (typeof user.roleHistory === "string") {
      try {
        return JSON.parse(user.roleHistory);
      } catch (e) {
        return [];
      }
    }
    return [];
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


  // --- NOTE TAKING & DISCUSSION REMARKS ---
  startEditReply(user: User): void {
    this.editingReplyUserId = user.id;
    this.tempReplyText = user.candidateReply || "";
  }

  cancelEditReply(): void {
    this.editingReplyUserId = null;
    this.tempReplyText = "";
  }

  saveCandidateReply(user: User): void {
    this.isUpdatingFollowUp = true;
    this.dataService.updateUser({
      id: user.id,
      candidateReply: this.tempReplyText.trim(),
      lastContactedAt: new Date().toISOString(),
    }).subscribe({
      next: (res) => {
        this.isUpdatingFollowUp = false;
        if (res.success) {
          user.candidateReply = this.tempReplyText.trim();
          user.lastContactedAt = new Date().toISOString();
          this.toastService.showSuccess(`Saved discussion reply for ${user.name}`);
          this.editingReplyUserId = null;
        }
      },
      error: (err) => {
        this.isUpdatingFollowUp = false;
        console.error("Save reply error", err);
        this.toastService.showError("Failed to save candidate reply.");
      }
    });
  }

  updateFollowUpStatus(user: User, newStatus: string): void {
    this.dataService.updateUser({
      id: user.id,
      followUpStatus: newStatus,
      lastContactedAt: new Date().toISOString(),
    }).subscribe({
      next: (res) => {
        if (res.success) {
          user.followUpStatus = newStatus;
          user.lastContactedAt = new Date().toISOString();
          this.toastService.showSuccess(`Status updated to "${newStatus}" for ${user.name}`);
        }
      },
      error: (err) => {
        console.error("Update status error", err);
        this.toastService.showError("Failed to update status.");
      }
    });
  }

  updateFollowUpDate(user: User, newDate: string): void {
    this.dataService.updateUser({
      id: user.id,
      followUpDate: newDate,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          user.followUpDate = newDate;
          this.toastService.showSuccess(`Next follow-up date set to ${newDate} for ${user.name}`);
        }
      },
      error: (err) => {
        console.error("Update date error", err);
        this.toastService.showError("Failed to update follow-up date.");
      }
    });
  }

  markWhatsAppStatus(user: User, status: "Visited (Opened)" | "Unsent" | "No WA"): void {
    this.dataService.updateUser({
      id: user.id,
      whatsappStatus: status,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          user.whatsappStatus = status;
          this.toastService.showSuccess(`WhatsApp status marked as ${status}`);
        }
      },
      error: (err) => console.error(err)
    });
  }

  openPhoneCall(phone?: string): void {
    if (!phone) return;
    if (typeof window !== "undefined") {
      window.open(`tel:${phone.replace(/\s+/g, "")}`, "_self");
    }
  }

  clearFrontdeskFilters(): void {
    this.frontdeskTabFilter = "all";
    this.frontdeskSearchQuery = "";
    this.frontdeskLocationFilter = "all";
    this.frontdeskTrackFilter = "all";
    this.frontdeskSortBy = "newest";
    this.selectedCounselorFilter = "all";
    this.allocationDateFilter = "all";
    this.selectedLeadIds.clear();
  }

  toggleSelectAllLeads(): void {
    const filtered = this.frontdeskFilteredStudents;
    if (this.selectedLeadIds.size === filtered.length && filtered.length > 0) {
      this.selectedLeadIds.clear();
    } else {
      this.selectedLeadIds.clear();
      filtered.forEach(s => this.selectedLeadIds.add(s.id));
    }
  }

  toggleLeadSelection(id: string): void {
    if (this.selectedLeadIds.has(id)) {
      this.selectedLeadIds.delete(id);
    } else {
      this.selectedLeadIds.add(id);
    }
  }

  isLeadSelected(id: string): boolean {
    return this.selectedLeadIds.has(id);
  }

  getFollowUpBadgeColor(status?: string): string {
    switch (status) {
      case "Interested":
      case "Ready to Join":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "Replied":
        return "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800";
      case "Follow-up Needed":
        return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "Contacted":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Not Interested":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "Need to Contact":
      default:
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    }
  }

  // Admissions Desk Pagination
  get admissionsTotalPages(): number {
    return Math.max(1, Math.ceil(this.frontdeskFilteredStudents.length / this.admissionsPerPage));
  }

  get paginatedAdmissions(): User[] {
    const start = (this.admissionsPage - 1) * this.admissionsPerPage;
    return this.frontdeskFilteredStudents.slice(start, start + this.admissionsPerPage);
  }

  setAdmissionsPage(page: number): void {
    if (page >= 1 && page <= this.admissionsTotalPages) {
      this.admissionsPage = page;
    }
  }

  // Detail Drawer
  openCandidateDrawer(user: User): void {
    this.activeDrawerUser = user;
    this.activeDrawerTab = "profile";
    this.newDrawerNote = "";
  }

  closeCandidateDrawer(): void {
    this.activeDrawerUser = null;
  }

  addDrawerNote(user: User): void {
    if (!this.newDrawerNote.trim()) return;
    const notes = this.timelineNotesMap[user.id] || [];
    notes.unshift({
      date: new Date().toLocaleString(),
      author: this.currentUser?.name || "Admissions Desk",
      text: this.newDrawerNote.trim()
    });
    this.timelineNotesMap[user.id] = notes;
    this.toastService.showSuccess("Note added to candidate timeline.");
    this.newDrawerNote = "";
  }

  getDrawerNotes(userId?: string): Array<{ date: string; author: string; text: string }> {
    if (!userId) return [];
    return this.timelineNotesMap[userId] || [];
  }

  // Row 3-Dot Action Menu
  toggleActionMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeActionMenuId = this.activeActionMenuId === id ? null : id;
  }

  closeActionMenu(): void {
    this.activeActionMenuId = null;
  }

  // Bulk status update
  bulkUpdateStatus(status: string): void {
    if (this.selectedLeadIds.size === 0) return;
    const ids = Array.from(this.selectedLeadIds);
    let count = 0;
    ids.forEach(id => {
      this.dataService.updateUser({
        id,
        followUpStatus: status,
        lastContactedAt: new Date().toISOString()
      }).subscribe({
        next: () => {
          count++;
          if (count === ids.length) {
            this.toastService.showSuccess(`Updated ${ids.length} candidates to "${status}"`);
            this.selectedLeadIds.clear();
          }
        }
      });
    });
  }

  // Export CSV
  exportAdmissionsCsv(): void {
    const list = this.frontdeskFilteredStudents;
    if (list.length === 0) {
      this.toastService.showInfo("No candidates to export.");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Campus", "Program Track", "Counselor", "Status", "Remarks", "Next Follow-up", "Allocated Date"];
    const rows = list.map(u => [
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.personalPhone || u.contactNum || ''}"`,
      `"${u.preferredLocation || ''}"`,
      `"${u.targetCourse || u.trackType || ''}"`,
      `"${u.assignedCounselor || 'Unassigned'}"`,
      `"${u.followUpStatus || 'Need to Contact'}"`,
      `"${(u.candidateReply || '').replace(/"/g, '""')}"`,
      `"${u.followUpDate || ''}"`,
      `"${u.allocatedDate || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TVK_Admissions_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.showSuccess(`Exported ${list.length} leads to CSV.`);
  }

  // Custom Confirmation Dialog
  confirmAction(title: string, message: string, confirmText: string, isDanger: boolean, action: () => void): void {
    this.confirmDialogData = { title, message, confirmText, isDanger, action };
    this.showConfirmDialog = true;
  }

  executeConfirmAction(): void {
    if (this.confirmDialogData.action) {
      this.confirmDialogData.action();
    }
    this.showConfirmDialog = false;
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
  }

  confirmDeleteCourse(course: Course): void {
    this.confirmAction(
      "Delete Course",
      `Are you sure you want to delete "${course.title}"? All associated training tracks and student records will be unlinked.`,
      "Delete Course",
      true,
      () => {
        this.dataService.deleteCourse(course.id).subscribe({
          next: (res) => {
            if (res.success) this.toastService.showSuccess("Course removed successfully.");
          },
          error: () => this.toastService.showError("Failed to delete course.")
        });
      }
    );
  }

  confirmDeleteUser(user: User): void {
    this.confirmAction(
      "Delete Account",
      `Are you sure you want to delete user account "${user.name}" (${user.email})? This action cannot be undone.`,
      "Delete User",
      true,
      () => {
        this.dataService.deleteUser(user.id).subscribe({
          next: (res) => {
            if (res.success) this.toastService.showSuccess("User account deleted.");
          },
          error: () => this.toastService.showError("Failed to delete user.")
        });
      }
    );
  }
}

