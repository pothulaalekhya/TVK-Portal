package com.tvk.portal.service;

import com.tvk.portal.model.Course;
import com.tvk.portal.model.Enrollment;
import com.tvk.portal.model.SystemLog;
import com.tvk.portal.model.User;
import com.tvk.portal.repository.CourseRepository;
import com.tvk.portal.repository.EnrollmentRepository;
import com.tvk.portal.repository.SystemLogRepository;
import com.tvk.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * AuthService — handles user login, registration (approval-based access),
 * temporary password generation, password hashing, and mandatory first-time password change.
 */
@Service
@Transactional
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private SystemLogRepository systemLogRepository;
    @Autowired private SseService sseService;

    // --- Security / Hashing Helpers ---

    public static String hashPassword(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }

    public static boolean checkPasswordMatch(String raw, String stored) {
        if (raw == null || stored == null) return false;
        // Direct match (for legacy plain passwords such as seeded 'password123')
        if (stored.equals(raw)) return true;
        // SHA-256 Hash match
        return hashPassword(raw).equalsIgnoreCase(stored);
    }

    public static String generateSecureTempPassword() {
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghijkmnpqrstuvwxyz";
        String digits = "23456789";
        String symbols = "@#$%&*!";
        String all = upper + lower + digits + symbols;

        SecureRandom random = new SecureRandom();
        List<Character> chars = new ArrayList<>();
        chars.add(upper.charAt(random.nextInt(upper.length())));
        chars.add(lower.charAt(random.nextInt(lower.length())));
        chars.add(digits.charAt(random.nextInt(digits.length())));
        chars.add(symbols.charAt(random.nextInt(symbols.length())));

        for (int i = 4; i < 10; i++) {
            chars.add(all.charAt(random.nextInt(all.length())));
        }

        Collections.shuffle(chars, random);
        StringBuilder sb = new StringBuilder();
        for (char c : chars) {
            sb.append(c);
        }
        return sb.toString();
    }

    public static boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) return false;
        String trimmed = email.trim().toLowerCase();
        if (!trimmed.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) return false;
        if (trimmed.contains("..") || trimmed.contains("@@")) return false;

        String[] parts = trimmed.split("@");
        if (parts.length != 2) return false;
        String domain = parts[1];

        String[] domainParts = domain.split("\\.");
        if (domainParts.length < 2) return false;
        String domainName = domainParts[0];
        String tld = domainParts[domainParts.length - 1];

        // 1. Gmail typo detection (gmil, gamil, gmaill, gmal, gmial, gmai, gml, etc.)
        Set<String> gmailTypos = Set.of(
            "gmil", "gamil", "gmaill", "gmal", "gmial", "gmai", "gmeil", "gmaik", "gmaul",
            "g-mail", "gmai1", "gmaii", "gmali", "gmi", "gml", "gmailc", "gmaild", "gmaol", "gmaio"
        );
        if (gmailTypos.contains(domainName) || (domainName.startsWith("gm") && domainName.endsWith("l") && !domainName.equals("gmail"))) {
            return false;
        }
        if (domainName.equals("gmail") && !domain.equals("gmail.com")) {
            return false;
        }

        // 2. Yahoo typo detection
        Set<String> yahooTypos = Set.of("yaho", "yahooo", "yhaoo", "yaahoo", "yhoo", "yaho0", "yahoou");
        if (yahooTypos.contains(domainName) || (domainName.startsWith("yah") && !domainName.equals("yahoo"))) {
            return false;
        }
        if (domainName.equals("yahoo") && !Set.of("yahoo.com", "yahoo.co.in", "yahoo.in", "yahoo.co.uk", "yahoo.ca").contains(domain)) {
            return false;
        }

        // 3. Outlook typo detection
        Set<String> outlookTypos = Set.of("outlok", "outloo", "outlookk", "outllok", "autlook", "otlook", "outlock", "outluk", "outloook");
        if (outlookTypos.contains(domainName) || (domainName.startsWith("outl") && !domainName.equals("outlook"))) {
            return false;
        }
        if (domainName.equals("outlook") && !Set.of("outlook.com", "outlook.in").contains(domain)) {
            return false;
        }

        // 4. Hotmail typo detection
        Set<String> hotmailTypos = Set.of("hotmial", "hotmal", "hotmaill", "hotmeil", "hotmai", "hitmail", "hotmali", "hotmaail");
        if (hotmailTypos.contains(domainName) || (domainName.startsWith("hotm") && !domainName.equals("hotmail"))) {
            return false;
        }
        if (domainName.equals("hotmail") && !Set.of("hotmail.com", "hotmail.co.uk").contains(domain)) {
            return false;
        }

        // 5. iCloud typo detection
        Set<String> icloudTypos = Set.of("icoud", "iclod", "iclaud", "iclouds", "icloude", "icloudk");
        if (icloudTypos.contains(domainName) || (domainName.equals("icloud") && !domain.equals("icloud.com"))) {
            return false;
        }

        // 6. Rediffmail typo detection
        Set<String> rediffTypos = Set.of("redifmail", "rediffmial", "redifmial", "reddifmail");
        if (rediffTypos.contains(domainName) || (domainName.equals("rediffmail") && !domain.equals("rediffmail.com"))) {
            return false;
        }

        if (domainName.length() < 2) return false;

        Set<String> badTlds = Set.of("comm", "coom", "con", "cpm", "cmo", "cmm", "cooom", "gmai", "c", "cm", "om", "coo", "kom", "xom");
        if (badTlds.contains(tld)) return false;

        Set<String> validTlds = Set.of(
            "com", "org", "net", "edu", "gov", "mil", "int",
            "in", "io", "ai", "tech", "dev", "app", "me", "co", "info", "biz",
            "uk", "ca", "au", "de", "fr", "jp", "sg", "ae", "nz", "za", "eu", "us",
            "online", "site", "xyz", "global", "cloud", "digital", "academy", "training", "solutions", "services",
            "agency", "center", "company", "institute", "network", "systems", "team", "world", "space", "live", "store", "pro"
        );
        String secondLevel = domainParts.length >= 3 ? domainParts[domainParts.length - 2] + "." + tld : "";
        return validTlds.contains(tld) || validTlds.contains(secondLevel) || secondLevel.equals("co.in") || secondLevel.equals("ac.in") || secondLevel.equals("co.uk") || secondLevel.equals("org.in") || secondLevel.equals("gov.in");
    }

    /**
     * POST /api/auth/login
     * Validates credentials against password or tempPassword.
     * Enforces PENDING_APPROVAL and REJECTED checks, and temporary password expiration.
     */
    public Map<String, Object> login(Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Email address and password are required.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No registration found with this email (" + email.trim() + "). Please register first."));

        String status = user.getApprovalStatus() != null ? user.getApprovalStatus().trim() : "PENDING_APPROVAL";

        if ("PENDING_APPROVAL".equalsIgnoreCase(status) || "pending".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your application is under review. You will receive your login details after approval.");
        }

        if ("REJECTED".equalsIgnoreCase(status) || "rejected".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your application was not approved. Please contact the admissions desk.");
        }

        boolean matchRegular = checkPasswordMatch(password, user.getPassword());
        boolean matchTemp = checkPasswordMatch(password, user.getTempPassword());

        if (!matchRegular && !matchTemp) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Incorrect password. First time? Use the temporary password sent to you after approval.");
        }

        // If mustChangePassword is true or matchTemp is true, check temp password expiration
        if (Boolean.TRUE.equals(user.getMustChangePassword()) || matchTemp) {
            if (user.getTempPasswordExpiresAt() != null && !user.getTempPasswordExpiresAt().isBlank()) {
                try {
                    Instant expiresAt = Instant.parse(user.getTempPasswordExpiresAt());
                    if (Instant.now().isAfter(expiresAt)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                "Your temporary password has expired. Contact admissions to get a new one.");
                    }
                } catch (ResponseStatusException rse) {
                    throw rse;
                } catch (Exception ex) {
                    // Ignore date parsing error
                }
            }
            user.setMustChangePassword(true);
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        response.put("mustChangePassword", Boolean.TRUE.equals(user.getMustChangePassword()));
        return response;
    }

    /**
     * POST /api/auth/register
     * Student registration without password.
     * Record created with status = "PENDING_APPROVAL", no password, no login access, no temp password.
     */
    public Map<String, Object> register(Map<String, Object> body) {
        String email = (String) body.get("email");
        String role = (String) body.getOrDefault("role", "student");
        String firstName = (String) body.get("firstName");
        String lastName = (String) body.get("lastName");
        String name = (String) body.get("name");

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email address is required.");
        }

        String trimmedEmail = email.toLowerCase().trim();
        if (!isValidEmail(trimmedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please enter a valid email address (e.g. name@example.com).");
        }

        if (name == null || name.isBlank()) {
            if (firstName != null && lastName != null) {
                name = (firstName.trim() + " " + lastName.trim()).trim();
            } else if (firstName != null) {
                name = firstName.trim();
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "First name and last name are required.");
            }
        }

        if (userRepository.findByEmailIgnoreCase(trimmedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with email (" + trimmedEmail + ") is already registered in our system.");
        }

        User newUser = buildUserFromRequest(body, trimmedEmail, name, role);
        userRepository.save(newUser);

        // Auto-create pending course enrollment if selected
        String targetCourseTitle = newUser.getTargetCourse();
        String courseId = (String) body.get("courseId");
        if (courseId != null && !courseId.isBlank()) {
            Course course = courseRepository.findById(courseId).orElse(null);
            if (course != null) {
                targetCourseTitle = course.getTitle();
                Enrollment enrollment = new Enrollment();
                enrollment.setId("e-" + System.currentTimeMillis());
                enrollment.setCourseId(course.getId());
                enrollment.setCourseTitle(course.getTitle());
                enrollment.setStudentId(newUser.getId());
                enrollment.setStudentName(newUser.getName());
                enrollment.setStudentEmail(newUser.getEmail());
                enrollment.setStatus("pending");
                enrollment.setRegisteredAt(Instant.now().toString());
                enrollment.setProgress(0);
                enrollmentRepository.save(enrollment);

                Map<String, Object> ep = new HashMap<>();
                ep.put("enrollment", enrollment);
                sseService.broadcast("ENROLLMENT_MUTATED", ep);
            }
        }

        // Broadcast registration alert to admissions desk and admins
        String trackInfo = newUser.getTrackType() != null ? " for " + newUser.getTrackType().toUpperCase() : "";
        String locInfo = newUser.getPreferredLocation() != null ? " at " + newUser.getPreferredLocation() : "";
        String alertMsg = "🔔 New student application received: '" + name + "'" + trackInfo + locInfo + ". Pending Admissions Approval.";

        Map<String, Object> alertPayload = new HashMap<>();
        alertPayload.put("message", alertMsg);
        sseService.broadcast("REALTIME_ALERT", alertPayload);
        sseService.broadcast("SYSTEM_STATS_MUTATED", Map.of("usersCount", userRepository.count()));

        // Audit Log
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("STUDENT_REGISTERED");
        log.setDetail("Application submitted for " + name + " (" + trimmedEmail + "). Status: PENDING_APPROVAL.");
        systemLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Application received. Your login will be enabled once our admissions team approves your application. You will be notified by email/SMS.");
        response.put("user", newUser);
        return response;
    }

    /**
     * POST /api/auth/temp-password
     * In the new approval model, temp passwords are sent upon approval.
     */
    public Map<String, Object> requestTempPassword(Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email address is required.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No registration found with this email. Please check your spelling or register a new application."));

        String status = user.getApprovalStatus() != null ? user.getApprovalStatus() : "PENDING_APPROVAL";

        if ("PENDING_APPROVAL".equalsIgnoreCase(status) || "pending".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your application is under review. You will receive your login details after approval.");
        }

        if ("REJECTED".equalsIgnoreCase(status) || "rejected".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Your application was not approved. Please contact the admissions desk.");
        }

        // If approved and temporary password is active/expired, inform user
        if (user.getTempPasswordExpiresAt() != null) {
            try {
                Instant expiresAt = Instant.parse(user.getTempPasswordExpiresAt());
                if (Instant.now().isAfter(expiresAt)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Your temporary password has expired. Contact admissions to get a new one.");
                }
            } catch (Exception ignored) {}
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("message", "Your account is approved. Use the temporary password issued by admissions to log in and set your new password.");
        return response;
    }

    /**
     * POST /api/auth/change-password
     * Mandatory first login password change. Updates user permanent password and clears mustChangePassword flag.
     */
    public Map<String, Object> changePassword(Map<String, String> body) {
        String email = body.get("email");
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (email == null || newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and new password are required.");
        }

        if (newPassword.trim().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters long.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        // Verify current password if provided
        if (currentPassword != null && !currentPassword.isBlank()) {
            boolean valid = checkPasswordMatch(currentPassword, user.getPassword()) ||
                            checkPasswordMatch(currentPassword, user.getTempPassword());
            if (!valid) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current/Temporary password does not match.");
            }
        }

        // Check if temporary password has expired
        if (user.getTempPassword() != null && user.getTempPasswordExpiresAt() != null) {
            try {
                Instant expiresAt = Instant.parse(user.getTempPasswordExpiresAt());
                if (Instant.now().isAfter(expiresAt)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "Your temporary password has expired. Contact admissions to get a new one.");
                }
            } catch (Exception ignored) {}
        }

        // Store hash of new permanent password
        user.setPassword(hashPassword(newPassword.trim()));
        user.setTempPassword(null);
        user.setTempPasswordExpiresAt(null);
        user.setMustChangePassword(false);
        user.setApprovalStatus("APPROVED");
        userRepository.save(user);

        // Audit Log
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("PASSWORD_CHANGED");
        log.setDetail("User " + user.getName() + " (" + user.getEmail() + ") successfully set permanent password.");
        systemLogRepository.save(log);

        Map<String, Object> up = new HashMap<>();
        up.put("user", user);
        sseService.broadcast("USER_MUTATED", up);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password set successfully! You can now access your training portal.");
        response.put("user", user);
        return response;
    }

    private User buildUserFromRequest(Map<String, Object> body, String email, String name, String role) {
        User u = new User();
        u.setId("u-" + System.currentTimeMillis());
        u.setName(name);
        u.setFirstName((String) body.get("firstName"));
        u.setLastName((String) body.get("lastName"));
        u.setEmail(email);
        u.setRole(role);

        // Staff accounts (trainer / admin / frontdesk) created directly by Global Admin
        String pass = (String) body.get("password");
        if (pass != null && !pass.isBlank() && !"student".equalsIgnoreCase(role)) {
            u.setPassword(hashPassword(pass));
            u.setApprovalStatus("APPROVED");
            u.setMustChangePassword(false);
        } else {
            // Student Registration: Status PENDING_APPROVAL, no password, no temp password, no login access
            u.setApprovalStatus("PENDING_APPROVAL");
            u.setPassword(null);
            u.setTempPassword(null);
            u.setMustChangePassword(false);
        }

        u.setCreatedAt(Instant.now().toString());

        // Contact info
        u.setPersonalPhone((String) body.get("personalPhone"));
        u.setEmergencyPhone((String) body.get("emergencyPhone"));
        String contactNum = (String) body.get("contactNum");
        if (contactNum == null || contactNum.isBlank()) {
            contactNum = (String) body.get("personalPhone");
        }
        u.setContactNum(contactNum);

        // Address info
        u.setDoorNo((String) body.get("doorNo"));
        u.setStreet((String) body.get("street"));
        u.setCity((String) body.get("city"));
        u.setState((String) body.get("state"));
        u.setPincode((String) body.get("pincode"));

        String address = (String) body.get("address");
        if (address == null || address.isBlank()) {
            StringBuilder sb = new StringBuilder();
            if (u.getDoorNo() != null && !u.getDoorNo().isBlank()) sb.append("D.No: ").append(u.getDoorNo()).append(", ");
            if (u.getStreet() != null && !u.getStreet().isBlank()) sb.append(u.getStreet()).append(", ");
            if (u.getCity() != null && !u.getCity().isBlank()) sb.append(u.getCity()).append(", ");
            if (u.getState() != null && !u.getState().isBlank()) sb.append(u.getState()).append(" - ");
            if (u.getPincode() != null && !u.getPincode().isBlank()) sb.append(u.getPincode());
            address = sb.toString();
        }
        u.setAddress(address);

        // Location & Track
        u.setPreferredLocation((String) body.get("preferredLocation"));
        u.setTrackType((String) body.get("trackType"));
        u.setTargetCourse((String) body.get("targetCourse"));
        u.setInternshipSkills((String) body.get("internshipSkills"));
        u.setAvailabilityToJoin((String) body.get("availabilityToJoin"));
        u.setTechStack((String) body.get("techStack"));

        // Academic details
        u.setCollegeName((String) body.get("collegeName"));
        u.setBranch((String) body.get("branch"));
        u.setCustomBranch((String) body.get("customBranch"));
        u.setAcademicStatus((String) body.get("academicStatus"));
        u.setIdDetails((String) body.get("idDetails"));

        // Resume details
        u.setResumeFileName((String) body.get("resumeFileName"));
        u.setResumeFileSize((String) body.get("resumeFileSize"));
        u.setResumeData((String) body.get("resumeData"));

        // Payment / Member
        u.setPaymentMode((String) body.get("paymentMode"));
        u.setPaymentTxnId((String) body.get("paymentTxnId"));
        u.setPaymentAmount((String) body.get("paymentAmount"));
        u.setPaymentScreenshotName((String) body.get("paymentScreenshotName"));
        Object isInstituteMember = body.get("isInstituteMember");
        if (isInstituteMember != null) {
            u.setIsInstituteMember(Boolean.parseBoolean(isInstituteMember.toString()));
        }

        // Trainer fields
        u.setSpecialization((String) body.get("specialization"));
        u.setStrongTechnologies((String) body.get("strongTechnologies"));

        // Telecaller fields
        u.setFollowUpStatus("Need to Contact");
        u.setCandidateReply((String) body.get("candidateReply"));
        u.setFollowUpDate((String) body.get("followUpDate"));
        u.setFollowUpNotes((String) body.get("followUpNotes"));
        u.setAssignedCounselor((String) body.get("assignedCounselor"));
        u.setWhatsappStatus("Unsent");

        return u;
    }

    // --- Email OTP Verification ---

    public static class OtpEntry {
        public final String otp;
        public final Instant expiresAt;
        public boolean verified;

        public OtpEntry(String otp, Instant expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.verified = false;
        }
    }

    private final Map<String, OtpEntry> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    public Map<String, Object> sendOtp(Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email address is required.");
        }
        String cleanEmail = email.trim().toLowerCase();
        if (!isValidEmail(cleanEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please provide a valid email address format.");
        }

        // Generate 6-digit OTP
        int code = 100000 + new SecureRandom().nextInt(900000);
        String otp = String.valueOf(code);
        Instant expiresAt = Instant.now().plus(10, ChronoUnit.MINUTES);

        otpStore.put(cleanEmail, new OtpEntry(otp, expiresAt));

        System.out.println("[TVK Auth] OTP for " + cleanEmail + " is: " + otp);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("email", cleanEmail);
        res.put("otp", otp); // Included for immediate user verification feedback
        res.put("message", "A 6-digit verification code has been dispatched. (Code: " + otp + ")");
        res.put("expiresInSeconds", 600);
        return res;
    }

    public Map<String, Object> verifyOtp(Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        String otp = body != null ? body.get("otp") : null;

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email address is required.");
        }
        if (otp == null || otp.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please enter the 6-digit verification code.");
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanOtp = otp.trim();

        OtpEntry entry = otpStore.get(cleanEmail);
        if (entry == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No verification code requested for this email. Please click 'Send OTP' first.");
        }

        if (Instant.now().isAfter(entry.expiresAt)) {
            otpStore.remove(cleanEmail);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code has expired. Please request a new one.");
        }

        if (!entry.otp.equals(cleanOtp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code. Please check and try again.");
        }

        entry.verified = true;

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("verified", true);
        res.put("email", cleanEmail);
        res.put("message", "Email address verified successfully!");
        return res;
    }
}

