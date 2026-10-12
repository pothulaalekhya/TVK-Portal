package com.tvk.portal.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonInclude;

@Entity
@Table(name = "users")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String firstName;
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role;

    private String password;
    private String tempPassword;
    private Boolean mustChangePassword;
    private String createdAt;

    // Contact numbers
    private String personalPhone;
    private String emergencyPhone;
    private String contactNum;

    // Structured Address
    private String doorNo;
    private String street;
    private String city;
    private String state;
    private String pincode;

    @Column(columnDefinition = "TEXT")
    private String address;

    // Preferred location (Bangalore / Chennai)
    private String preferredLocation;

    // Track / Program Selection
    private String trackType; // "internship" | "job"
    private String targetCourse;
    
    @Column(columnDefinition = "TEXT")
    private String internshipSkills;
    
    private String availabilityToJoin;
    
    @Column(columnDefinition = "TEXT")
    private String techStack;

    private String collegeName;
    private String branch;
    private String customBranch;
    private String academicStatus;
    private String idDetails;

    private String resumeFileName;
    private String resumeFileSize;
    
    @Column(columnDefinition = "TEXT")
    private String resumeData;

    private String paymentMode;
    private String paymentTxnId;
    private String paymentAmount;
    private String paymentScreenshotName;
    private Boolean isInstituteMember;

    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String strongTechnologies;

    // Front Desk Follow-up Fields
    private String followUpStatus; // "Need to Contact" | "Contacted" | "Follow-up Needed" | "Replied" | "Ready to Join" | "Not Interested"
    
    @Column(columnDefinition = "TEXT")
    private String candidateReply; // Student's stored reply / response remarks

    private String followUpDate; // Next follow-up date
    
    @Column(columnDefinition = "TEXT")
    private String followUpNotes; // Internal notes

    private String assignedCounselor;
    private String assignedCounselorId;
    private String allocatedDate;
    private String lastContactedAt;
    private String whatsappStatus;

    // Front Desk Staff Attendance & Quota Fields
    private String attendanceStatus; // "ON_DUTY" | "ON_LEAVE" | "OFF"
    private String leaveReason;
    private String lastAttendanceUpdate;
    private Integer dailyLeadQuota;

    private String approvalStatus; // "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "ACTIVE"
    private String paymentStatus;
    private String batchNumber;
    private String assignedTrainer;

    // Approval & Security Flow
    private String tempPasswordExpiresAt;
    private String approvedBy;
    private String approvedAt;
    private String rejectionReason;
    private String rejectedBy;
    private String rejectedAt;

    // Career Progression & Role Transition History
    private String previousRole;
    private String employeeId;
    private String designation;
    private String department;
    private String dateOfJoiningOrg;

    @Column(columnDefinition = "TEXT")
    private String roleHistory; // JSON array of RoleHistoryEntry records

    public User() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTempPassword() { return tempPassword; }
    public void setTempPassword(String tempPassword) { this.tempPassword = tempPassword; }

    public Boolean getMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(Boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getPersonalPhone() { return personalPhone; }
    public void setPersonalPhone(String personalPhone) { this.personalPhone = personalPhone; }

    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }

    public String getContactNum() { return contactNum; }
    public void setContactNum(String contactNum) { this.contactNum = contactNum; }

    public String getDoorNo() { return doorNo; }
    public void setDoorNo(String doorNo) { this.doorNo = doorNo; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public String getTrackType() { return trackType; }
    public void setTrackType(String trackType) { this.trackType = trackType; }

    public String getTargetCourse() { return targetCourse; }
    public void setTargetCourse(String targetCourse) { this.targetCourse = targetCourse; }

    public String getInternshipSkills() { return internshipSkills; }
    public void setInternshipSkills(String internshipSkills) { this.internshipSkills = internshipSkills; }

    public String getAvailabilityToJoin() { return availabilityToJoin; }
    public void setAvailabilityToJoin(String availabilityToJoin) { this.availabilityToJoin = availabilityToJoin; }

    public String getTechStack() { return techStack; }
    public void setTechStack(String techStack) { this.techStack = techStack; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getCustomBranch() { return customBranch; }
    public void setCustomBranch(String customBranch) { this.customBranch = customBranch; }

    public String getAcademicStatus() { return academicStatus; }
    public void setAcademicStatus(String academicStatus) { this.academicStatus = academicStatus; }

    public String getIdDetails() { return idDetails; }
    public void setIdDetails(String idDetails) { this.idDetails = idDetails; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public String getResumeFileSize() { return resumeFileSize; }
    public void setResumeFileSize(String resumeFileSize) { this.resumeFileSize = resumeFileSize; }

    public String getResumeData() { return resumeData; }
    public void setResumeData(String resumeData) { this.resumeData = resumeData; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getPaymentTxnId() { return paymentTxnId; }
    public void setPaymentTxnId(String paymentTxnId) { this.paymentTxnId = paymentTxnId; }

    public String getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(String paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getPaymentScreenshotName() { return paymentScreenshotName; }
    public void setPaymentScreenshotName(String paymentScreenshotName) { this.paymentScreenshotName = paymentScreenshotName; }

    public Boolean getIsInstituteMember() { return isInstituteMember; }
    public void setIsInstituteMember(Boolean isInstituteMember) { this.isInstituteMember = isInstituteMember; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getStrongTechnologies() { return strongTechnologies; }
    public void setStrongTechnologies(String strongTechnologies) { this.strongTechnologies = strongTechnologies; }

    public String getFollowUpStatus() { return followUpStatus; }
    public void setFollowUpStatus(String followUpStatus) { this.followUpStatus = followUpStatus; }

    public String getCandidateReply() { return candidateReply; }
    public void setCandidateReply(String candidateReply) { this.candidateReply = candidateReply; }

    public String getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(String followUpDate) { this.followUpDate = followUpDate; }

    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }

    public String getAssignedCounselor() { return assignedCounselor; }
    public void setAssignedCounselor(String assignedCounselor) { this.assignedCounselor = assignedCounselor; }

    public String getLastContactedAt() { return lastContactedAt; }
    public void setLastContactedAt(String lastContactedAt) { this.lastContactedAt = lastContactedAt; }

    public String getWhatsappStatus() { return whatsappStatus; }
    public void setWhatsappStatus(String whatsappStatus) { this.whatsappStatus = whatsappStatus; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getAssignedTrainer() { return assignedTrainer; }
    public void setAssignedTrainer(String assignedTrainer) { this.assignedTrainer = assignedTrainer; }

    public String getTempPasswordExpiresAt() { return tempPasswordExpiresAt; }
    public void setTempPasswordExpiresAt(String tempPasswordExpiresAt) { this.tempPasswordExpiresAt = tempPasswordExpiresAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }

    public String getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(String rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getAssignedCounselorId() { return assignedCounselorId; }
    public void setAssignedCounselorId(String assignedCounselorId) { this.assignedCounselorId = assignedCounselorId; }

    public String getAllocatedDate() { return allocatedDate; }
    public void setAllocatedDate(String allocatedDate) { this.allocatedDate = allocatedDate; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public String getLeaveReason() { return leaveReason; }
    public void setLeaveReason(String leaveReason) { this.leaveReason = leaveReason; }

    public String getLastAttendanceUpdate() { return lastAttendanceUpdate; }
    public void setLastAttendanceUpdate(String lastAttendanceUpdate) { this.lastAttendanceUpdate = lastAttendanceUpdate; }

    public Integer getDailyLeadQuota() { return dailyLeadQuota; }
    public void setDailyLeadQuota(Integer dailyLeadQuota) { this.dailyLeadQuota = dailyLeadQuota; }

    public String getPreviousRole() { return previousRole; }
    public void setPreviousRole(String previousRole) { this.previousRole = previousRole; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDateOfJoiningOrg() { return dateOfJoiningOrg; }
    public void setDateOfJoiningOrg(String dateOfJoiningOrg) { this.dateOfJoiningOrg = dateOfJoiningOrg; }

    public String getRoleHistory() { return roleHistory; }
    public void setRoleHistory(String roleHistory) { this.roleHistory = roleHistory; }
}
