export type UserRole = "student" | "trainer" | "admin" | "frontdesk" | "staff" | "alumni";

export interface RoleHistoryEntry {
  id: string;
  fromRole: string;
  toRole: string;
  transitionDate: string;
  transitionedBy: string;
  designation?: string;
  department?: string;
  employeeId?: string;
  notes?: string;
  previousSnapshot?: {
    targetCourse?: string;
    collegeName?: string;
    branch?: string;
    academicStatus?: string;
    internshipSkills?: string;
    techStack?: string;
    preferredLocation?: string;
    resumeFileName?: string;
    paymentStatus?: string;
    batchNumber?: string;
    assignedTrainer?: string;
  };
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  createdAt: string;

  // Career Progression & Role Transition History
  previousRole?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  dateOfJoiningOrg?: string;
  roleHistory?: string | RoleHistoryEntry[];

  // Contact numbers
  personalPhone?: string;
  emergencyPhone?: string;
  contactNum?: string; // Combined/fallback

  // Structured Address
  doorNo?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string; // Combined address

  // Preferred location (Bangalore / Chennai)
  preferredLocation?: "Bangalore" | "Chennai" | string;

  // Program / Track Selection
  trackType?: "internship" | "job";
  
  // Internship-specific fields
  targetCourse?: string;
  internshipSkills?: string;
  availabilityToJoin?: string;

  // Job-specific fields
  techStack?: string;
  resumeFileName?: string;
  resumeFileSize?: string;
  resumeData?: string;

  // Academic / Institute info
  collegeName?: string;
  branch?: string;
  customBranch?: string;
  academicStatus?: string;
  idDetails?: string;

  // Payment / Institute Member
  paymentMode?: string;
  paymentTxnId?: string;
  paymentAmount?: string;
  paymentScreenshotName?: string;
  isInstituteMember?: boolean;

  // Trainer / Admin / Front Desk specific fields
  specialization?: string;
  strongTechnologies?: string;
  
  // Front Desk Follow-up & Allocation Fields
  followUpStatus?: "Need to Contact" | "Interested" | "Not Interested" | "Follow-up Needed" | "Contacted" | "Replied" | "Ready to Join" | string;
  candidateReply?: string; // Store their reply / remarks
  followUpDate?: string;  // Next follow-up date
  followUpNotes?: string; // Additional counselor notes
  assignedCounselor?: string;
  assignedCounselorId?: string;
  allocatedDate?: string; // YYYY-MM-DD daily allocation tracking
  lastContactedAt?: string;
  whatsappStatus?: "Visited (Opened)" | "Unsent" | "No WA" | string;

  // Front Desk Staff Attendance & Quota Fields
  attendanceStatus?: "ON_DUTY" | "ON_LEAVE" | "OFF" | string;
  leaveReason?: string;
  lastAttendanceUpdate?: string;
  dailyLeadQuota?: number;

  // Auth & Admin Approval
  password?: string;
  tempPassword?: string;
  tempPasswordExpiresAt?: string;
  mustChangePassword?: boolean;
  approvalStatus?: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ACTIVE" | "pending" | "approved" | "rejected" | string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  paymentStatus?: "paid" | "unpaid" | "yet to pay" | "not interested";
  batchNumber?: string;
  assignedTrainer?: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: "registration" | "followup" | "interested" | "batch_info" | "not_interested" | "custom";
  channel: "whatsapp" | "email" | "both";
  subject?: string; // For Email
  body: string;     // With tags like {name}, {course}, {location}, {phone}, {counselorName}, {fee}, {date}
  isDefault?: boolean;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  trainerName: string;
  trainer?: string; // alias
  features: string[];
  syllabus: string[];
  capacity: number;
  enrolledCount: number;
  isLive: boolean;
  price?: string;
  fee?: number; // Numeric INR fee (e.g. 34999)
  batches?: string[];
  rating?: number;
  ratingCount?: number;
  level?: "Beginner to Advanced" | "Intermediate" | "Advanced" | string;
  mode?: "Classroom (BLR/CHN) & Online" | "Live Interactive Online" | string;
  emiPrice?: string;
  category?: "Full Stack" | "Backend" | "Frontend" | "Cloud & DevOps" | "AI & Data" | "Testing" | string;
  badge?: "Bestseller" | "Job Guaranteed" | "Trending" | "High Demand" | string;
  projects?: string[];
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: "pending" | "active" | "completed";
  registeredAt: string;
  progress: number; // percentage from 0 to 100
  grade?: string; // e.g. 'A+', 'B', 'Pending'
  feedback?: string; // trainer feedback note
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

export type SyncEventType =
  | "ENROLLMENT_MUTATED"
  | "COURSE_MUTATED"
  | "CONTACT_MUTATED"
  | "FEEDBACK_MUTATED"
  | "REALTIME_ALERT"
  | "SYSTEM_STATS_MUTATED"
  | "USER_MUTATED";

export interface SyncMessage {
  type: SyncEventType;
  payload: any;
  timestamp: string;
}
