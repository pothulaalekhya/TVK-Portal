export type UserRole = "student" | "trainer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;

  // Student detailed registration fields for joining the institute
  contactNum?: string;
  collegeName?: string;
  branch?: string;
  customBranch?: string; // if selected 'Other'
  academicStatus?: string; // e.g. "Pursuing (3rd Year)" etc.
  address?: string;
  idDetails?: string; // Aadhaar or PAN
  resumeFileName?: string;
  resumeFileSize?: string;
  paymentMode?: string;
  paymentTxnId?: string;
  paymentAmount?: string;
  paymentScreenshotName?: string;
  isInstituteMember?: boolean; // mark if student registered specifically to join institute
  specialization?: string; // Trainer / Admin field
  strongTechnologies?: string; // Trainer-only field
  
  // New auth & management fields
  password?: string;
  approvalStatus?: "pending" | "approved";
  paymentStatus?: "paid" | "unpaid" | "yet to pay" | "not interested";
  batchNumber?: string;
  assignedTrainer?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  trainerName: string;
  features: string[];
  syllabus: string[];
  capacity: number;
  enrolledCount: number;
  isLive: boolean;
  price?: string;
  batches?: string[];
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
