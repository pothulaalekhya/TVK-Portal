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

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role;

    private String password;
    private String createdAt;
    private String contactNum;
    private String collegeName;
    private String branch;
    private String customBranch;
    private String academicStatus;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String idDetails;
    private String resumeFileName;
    private String resumeFileSize;
    private String paymentMode;
    private String paymentTxnId;
    private String paymentAmount;
    private String paymentScreenshotName;
    private Boolean isInstituteMember;
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String strongTechnologies;

    private String approvalStatus;
    private String paymentStatus;
    private String batchNumber;
    private String assignedTrainer;

    public User() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getContactNum() { return contactNum; }
    public void setContactNum(String contactNum) { this.contactNum = contactNum; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public String getCustomBranch() { return customBranch; }
    public void setCustomBranch(String customBranch) { this.customBranch = customBranch; }

    public String getAcademicStatus() { return academicStatus; }
    public void setAcademicStatus(String academicStatus) { this.academicStatus = academicStatus; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getIdDetails() { return idDetails; }
    public void setIdDetails(String idDetails) { this.idDetails = idDetails; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public String getResumeFileSize() { return resumeFileSize; }
    public void setResumeFileSize(String resumeFileSize) { this.resumeFileSize = resumeFileSize; }

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

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getAssignedTrainer() { return assignedTrainer; }
    public void setAssignedTrainer(String assignedTrainer) { this.assignedTrainer = assignedTrainer; }
}
