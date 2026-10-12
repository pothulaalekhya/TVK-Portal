package com.tvk.portal.service;

import com.tvk.portal.model.SystemLog;
import com.tvk.portal.model.User;
import com.tvk.portal.repository.SystemLogRepository;
import com.tvk.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

/**
 * UserService — Admin user management (approval, rejection, temp password regeneration, update, delete).
 */
@Service
@Transactional
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private SystemLogRepository systemLogRepository;
    @Autowired private SseService sseService;

    private void checkAdminOrDeskPermission(String role) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied. Admin or Admissions Desk authorization required.");
        }
        String normalized = role.trim().toLowerCase();
        if (!normalized.equals("admin") && !normalized.equals("frontdesk") && !normalized.equals("admission_desk")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied. Only ADMIN or ADMISSION_DESK roles can approve or reject candidates.");
        }
    }

    /**
     * POST /api/users/approve
     * Approves candidate, generates 10-character temporary password (letters+numbers+symbol),
     * stores ONLY the hash in DB, sets mustChangePassword=true, sets tempPasswordExpiresAt (7 days),
     * records audit log, and returns raw temporary password ONCE to admin.
     */
    public Map<String, Object> approveCandidate(Map<String, Object> body) {
        String id = (String) body.get("id");
        if (id == null || id.isBlank()) {
            id = (String) body.get("userId");
        }

        String operatorRole = (String) body.getOrDefault("operatorRole", "admin");
        String operatorName = (String) body.getOrDefault("approvedBy", "Admissions Desk");

        checkAdminOrDeskPermission(operatorRole);

        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found."));

        // Generate 10-character temporary password with letters + numbers + symbols
        String rawTempPassword = AuthService.generateSecureTempPassword();
        String hashedPassword = AuthService.hashPassword(rawTempPassword);

        user.setApprovalStatus("APPROVED");
        user.setTempPassword(hashedPassword);
        user.setPassword(hashedPassword); // Allow temp password to match
        user.setMustChangePassword(true);
        user.setTempPasswordExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS).toString());
        user.setApprovedBy(operatorName);
        user.setApprovedAt(Instant.now().toString());
        user.setRejectionReason(null);
        user.setRejectedBy(null);
        user.setRejectedAt(null);

        userRepository.save(user);

        // Audit Log
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("CANDIDATE_APPROVED");
        log.setDetail("Candidate " + user.getName() + " (" + user.getEmail() + ") was approved by " + operatorName + ". 7-day temporary access key generated.");
        systemLogRepository.save(log);

        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("tempPassword", rawTempPassword);
        response.put("expiresAt", user.getTempPasswordExpiresAt());
        response.put("message", "Candidate " + user.getName() + " approved! Temporary password generated.");
        return response;
    }

    /**
     * POST /api/users/reject
     * Rejects candidate, stores optional reason, records audit log, and clears any password credentials.
     */
    public Map<String, Object> rejectCandidate(Map<String, Object> body) {
        String id = (String) body.get("id");
        if (id == null || id.isBlank()) {
            id = (String) body.get("userId");
        }

        String reason = (String) body.getOrDefault("reason", "Application does not meet current batch requirements.");
        String operatorRole = (String) body.getOrDefault("operatorRole", "admin");
        String operatorName = (String) body.getOrDefault("rejectedBy", "Admissions Desk");

        checkAdminOrDeskPermission(operatorRole);

        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found."));

        user.setApprovalStatus("REJECTED");
        user.setRejectionReason(reason);
        user.setRejectedBy(operatorName);
        user.setRejectedAt(Instant.now().toString());
        user.setPassword(null);
        user.setTempPassword(null);
        user.setTempPasswordExpiresAt(null);
        user.setMustChangePassword(false);

        userRepository.save(user);

        // Audit Log
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("CANDIDATE_REJECTED");
        log.setDetail("Candidate " + user.getName() + " (" + user.getEmail() + ") was rejected by " + operatorName + ". Reason: " + reason);
        systemLogRepository.save(log);

        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("message", "Candidate application marked as rejected.");
        return response;
    }

    /**
     * POST /api/users/regenerate-temp-password
     * Resends / regenerates a new 10-character temporary password for an approved candidate.
     */
    public Map<String, Object> regenerateTempPassword(Map<String, Object> body) {
        String id = (String) body.get("id");
        if (id == null || id.isBlank()) {
            id = (String) body.get("userId");
        }

        String operatorRole = (String) body.getOrDefault("operatorRole", "admin");
        String operatorName = (String) body.getOrDefault("operatorName", "Admissions Desk");

        checkAdminOrDeskPermission(operatorRole);

        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found."));

        if (!"APPROVED".equalsIgnoreCase(user.getApprovalStatus()) && !"approved".equalsIgnoreCase(user.getApprovalStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Temporary password can only be generated for approved candidates.");
        }

        String rawTempPassword = AuthService.generateSecureTempPassword();
        String hashedPassword = AuthService.hashPassword(rawTempPassword);

        user.setTempPassword(hashedPassword);
        user.setPassword(hashedPassword);
        user.setMustChangePassword(true);
        user.setTempPasswordExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS).toString());

        userRepository.save(user);

        // Audit Log
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("TEMP_PASSWORD_REGENERATED");
        log.setDetail("Temporary access key regenerated for " + user.getName() + " (" + user.getEmail() + ") by " + operatorName + ".");
        systemLogRepository.save(log);

        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("tempPassword", rawTempPassword);
        response.put("expiresAt", user.getTempPasswordExpiresAt());
        response.put("message", "New temporary password generated successfully for " + user.getName() + ".");
        return response;
    }

    /**
     * POST /api/users/update
     * General partial update of candidate fields.
     */
    public Map<String, Object> updateUser(Map<String, Object> body) {
        String id = (String) body.get("id");

        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        // Apply fields selectively
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("firstName")) user.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) user.setLastName((String) body.get("lastName"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("role")) user.setRole((String) body.get("role"));
        if (body.containsKey("personalPhone")) user.setPersonalPhone((String) body.get("personalPhone"));
        if (body.containsKey("emergencyPhone")) user.setEmergencyPhone((String) body.get("emergencyPhone"));
        if (body.containsKey("contactNum")) user.setContactNum((String) body.get("contactNum"));
        if (body.containsKey("doorNo")) user.setDoorNo((String) body.get("doorNo"));
        if (body.containsKey("street")) user.setStreet((String) body.get("street"));
        if (body.containsKey("city")) user.setCity((String) body.get("city"));
        if (body.containsKey("state")) user.setState((String) body.get("state"));
        if (body.containsKey("pincode")) user.setPincode((String) body.get("pincode"));
        if (body.containsKey("address")) user.setAddress((String) body.get("address"));
        if (body.containsKey("preferredLocation")) user.setPreferredLocation((String) body.get("preferredLocation"));
        if (body.containsKey("trackType")) user.setTrackType((String) body.get("trackType"));
        if (body.containsKey("targetCourse")) user.setTargetCourse((String) body.get("targetCourse"));
        if (body.containsKey("internshipSkills")) user.setInternshipSkills((String) body.get("internshipSkills"));
        if (body.containsKey("availabilityToJoin")) user.setAvailabilityToJoin((String) body.get("availabilityToJoin"));
        if (body.containsKey("techStack")) user.setTechStack((String) body.get("techStack"));
        if (body.containsKey("collegeName")) user.setCollegeName((String) body.get("collegeName"));
        if (body.containsKey("branch")) user.setBranch((String) body.get("branch"));
        if (body.containsKey("paymentStatus")) user.setPaymentStatus((String) body.get("paymentStatus"));
        
        if (body.containsKey("approvalStatus")) {
            String newStatus = (String) body.get("approvalStatus");
            user.setApprovalStatus(newStatus);
        }

        if (body.containsKey("batchNumber")) user.setBatchNumber((String) body.get("batchNumber"));
        if (body.containsKey("assignedTrainer")) user.setAssignedTrainer((String) body.get("assignedTrainer"));
        if (body.containsKey("specialization")) user.setSpecialization((String) body.get("specialization"));
        if (body.containsKey("strongTechnologies")) user.setStrongTechnologies((String) body.get("strongTechnologies"));
        if (body.containsKey("followUpStatus")) user.setFollowUpStatus((String) body.get("followUpStatus"));
        if (body.containsKey("candidateReply")) user.setCandidateReply((String) body.get("candidateReply"));
        if (body.containsKey("followUpDate")) user.setFollowUpDate((String) body.get("followUpDate"));
        if (body.containsKey("followUpNotes")) user.setFollowUpNotes((String) body.get("followUpNotes"));
        if (body.containsKey("assignedCounselor")) user.setAssignedCounselor((String) body.get("assignedCounselor"));
        if (body.containsKey("assignedCounselorId")) user.setAssignedCounselorId((String) body.get("assignedCounselorId"));
        if (body.containsKey("allocatedDate")) user.setAllocatedDate((String) body.get("allocatedDate"));
        if (body.containsKey("whatsappStatus")) user.setWhatsappStatus((String) body.get("whatsappStatus"));
        if (body.containsKey("attendanceStatus")) {
            String prevStatus = user.getAttendanceStatus();
            String newStatus = (String) body.get("attendanceStatus");
            user.setAttendanceStatus(newStatus);
            user.setLastAttendanceUpdate(Instant.now().toString());

            // If a frontdesk counselor marks day off / leave, notify admin via realtime alert
            if ("frontdesk".equalsIgnoreCase(user.getRole()) && ("ON_LEAVE".equalsIgnoreCase(newStatus) || "OFF".equalsIgnoreCase(newStatus))) {
                String reason = (String) body.getOrDefault("leaveReason", "Personal day off");
                user.setLeaveReason(reason);
                
                SystemLog log = new SystemLog();
                log.setTime(Instant.now().toString());
                log.setEvent("STAFF_LEAVE_NOTIFIED");
                log.setDetail("Front Desk counselor " + user.getName() + " marked DAY OFF / LEAVE (" + reason + "). Leads may need redistribution.");
                systemLogRepository.save(log);

                Map<String, Object> alertPayload = new HashMap<>();
                alertPayload.put("message", "⚠️ Counselor " + user.getName() + " is marked OFF today (" + reason + "). Please review and redistribute assigned leads.");
                sseService.broadcast("REALTIME_ALERT", alertPayload);
            }
        }
        if (body.containsKey("leaveReason")) user.setLeaveReason((String) body.get("leaveReason"));
        if (body.containsKey("lastAttendanceUpdate")) user.setLastAttendanceUpdate((String) body.get("lastAttendanceUpdate"));
        if (body.containsKey("dailyLeadQuota")) {
            Object dlq = body.get("dailyLeadQuota");
            if (dlq instanceof Number) user.setDailyLeadQuota(((Number) dlq).intValue());
        }
        if (body.containsKey("lastContactedAt")) user.setLastContactedAt((String) body.get("lastContactedAt"));
        if (body.containsKey("rejectionReason")) user.setRejectionReason((String) body.get("rejectionReason"));
        if (body.containsKey("tempPasswordExpiresAt")) user.setTempPasswordExpiresAt((String) body.get("tempPasswordExpiresAt"));
        if (body.containsKey("mustChangePassword")) {
            Object mcp = body.get("mustChangePassword");
            if (mcp instanceof Boolean) user.setMustChangePassword((Boolean) mcp);
            else if (mcp != null) user.setMustChangePassword(Boolean.parseBoolean(mcp.toString()));
        }
        if (body.containsKey("approvedBy")) user.setApprovedBy((String) body.get("approvedBy"));
        if (body.containsKey("approvedAt")) user.setApprovedAt((String) body.get("approvedAt"));
        if (body.containsKey("rejectedBy")) user.setRejectedBy((String) body.get("rejectedBy"));
        if (body.containsKey("rejectedAt")) user.setRejectedAt((String) body.get("rejectedAt"));

        userRepository.save(user);

        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        return response;
    }

    /**
     * DELETE /api/users/:id
     * Permanently deletes a user account.
     */
    public Map<String, Object> deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        String name = user.getName();
        userRepository.deleteById(id);

        Map<String, Object> dp = new HashMap<>();
        dp.put("deletedId", id);
        sseService.broadcast("USER_MUTATED", dp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Deleted user: " + name);
        return response;
    }

    /**
     * POST /api/users/transition-role
     * Seamlessly transitions a user to a new role (e.g., student -> trainer, student -> frontdesk, trainer -> admin, etc.)
     * while preserving all previous academic/training background, course records, and creating an immutable career progression timeline.
     */
    public Map<String, Object> transitionUserRole(Map<String, Object> body) {
        String id = (String) body.get("id");
        if (id == null || id.isBlank()) id = (String) body.get("userId");
        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required.");
        }

        String newRole = (String) body.get("newRole");
        if (newRole == null || newRole.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New role is required.");
        }
        newRole = newRole.trim().toLowerCase();

        String operatorRole = (String) body.getOrDefault("operatorRole", "admin");
        String operatorName = (String) body.getOrDefault("operatorName", "Global Administrator");
        checkAdminOrDeskPermission(operatorRole);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        String oldRole = user.getRole() != null ? user.getRole() : "student";
        String designation = (String) body.getOrDefault("designation", "");
        String department = (String) body.getOrDefault("department", "");
        String employeeId = (String) body.getOrDefault("employeeId", "");
        String specialization = (String) body.getOrDefault("specialization", "");
        String strongTechnologies = (String) body.getOrDefault("strongTechnologies", "");
        String notes = (String) body.getOrDefault("notes", "");

        // Build Career Progression History Record
        Map<String, Object> historyEntry = new HashMap<>();
        historyEntry.put("id", "rh-" + System.currentTimeMillis());
        historyEntry.put("fromRole", oldRole);
        historyEntry.put("toRole", newRole);
        historyEntry.put("transitionDate", Instant.now().toString());
        historyEntry.put("transitionedBy", operatorName);
        historyEntry.put("designation", designation);
        historyEntry.put("department", department);
        historyEntry.put("employeeId", employeeId);
        historyEntry.put("notes", notes);

        // Capture previous student/user profile snapshot so it's always accessible in the history timeline
        Map<String, Object> previousSnapshot = new HashMap<>();
        previousSnapshot.put("targetCourse", user.getTargetCourse());
        previousSnapshot.put("collegeName", user.getCollegeName());
        previousSnapshot.put("branch", user.getBranch());
        previousSnapshot.put("academicStatus", user.getAcademicStatus());
        previousSnapshot.put("internshipSkills", user.getInternshipSkills());
        previousSnapshot.put("techStack", user.getTechStack());
        previousSnapshot.put("preferredLocation", user.getPreferredLocation());
        previousSnapshot.put("resumeFileName", user.getResumeFileName());
        previousSnapshot.put("paymentStatus", user.getPaymentStatus());
        previousSnapshot.put("batchNumber", user.getBatchNumber());
        previousSnapshot.put("assignedTrainer", user.getAssignedTrainer());
        historyEntry.put("previousSnapshot", previousSnapshot);

        // Append to roleHistory JSON list
        List<Map<String, Object>> historyList = new ArrayList<>();
        if (user.getRoleHistory() != null && !user.getRoleHistory().isBlank()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                historyList = mapper.readValue(user.getRoleHistory(), new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                // If parse fails, start fresh list
            }
        }
        historyList.add(historyEntry);

        try {
            ObjectMapper mapper = new ObjectMapper();
            user.setRoleHistory(mapper.writeValueAsString(historyList));
        } catch (Exception e) {
            // fallback
        }

        // Update active profile fields
        user.setPreviousRole(oldRole);
        user.setRole(newRole);
        if (designation != null && !designation.isBlank()) user.setDesignation(designation);
        if (department != null && !department.isBlank()) user.setDepartment(department);
        if (employeeId != null && !employeeId.isBlank()) user.setEmployeeId(employeeId);
        if (specialization != null && !specialization.isBlank()) user.setSpecialization(specialization);
        if (strongTechnologies != null && !strongTechnologies.isBlank()) user.setStrongTechnologies(strongTechnologies);
        user.setDateOfJoiningOrg(Instant.now().toString());

        // Ensure approval status is active for promoted staff
        if ("trainer".equalsIgnoreCase(newRole) || "admin".equalsIgnoreCase(newRole) || "frontdesk".equalsIgnoreCase(newRole)) {
            user.setApprovalStatus("APPROVED");
        }

        userRepository.save(user);

        // Record Audit Log
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("USER_ROLE_TRANSITION");
        log.setDetail("User " + user.getName() + " (" + user.getEmail() + ") transitioned from " + oldRole.toUpperCase() + " to " + newRole.toUpperCase() + (designation != null && !designation.isBlank() ? " as " + designation : "") + " by " + operatorName + ".");
        systemLogRepository.save(log);

        // Broadcast real-time update
        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("message", "User " + user.getName() + " has been successfully transitioned to " + newRole.toUpperCase() + "!");
        return response;
    }
}
