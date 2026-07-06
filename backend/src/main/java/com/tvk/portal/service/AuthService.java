package com.tvk.portal.service;

import com.tvk.portal.model.Course;
import com.tvk.portal.model.Enrollment;
import com.tvk.portal.model.User;
import com.tvk.portal.repository.CourseRepository;
import com.tvk.portal.repository.EnrollmentRepository;
import com.tvk.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * AuthService — handles user login and registration.
 * Mirrors the Express /api/auth/login and /api/auth/register endpoints.
 */
@Service
@Transactional
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private SseService sseService;

    /**
     * POST /api/auth/login
     * Validates credentials and returns user if approved.
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
                        "No user found with this email. Please check your spelling or register a new account."));

        if (user.getPassword() != null && !user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Incorrect password. Please try again.");
        }

        if ("pending".equals(user.getApprovalStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Account pending admin approval. Please wait until your account is approved.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        return response;
    }

    /**
     * POST /api/auth/register
     * Creates a new user account (starts as pending approval).
     * Optionally auto-enrolls student into a course.
     */
    public Map<String, Object> register(Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String role = (String) body.get("role");

        if (name == null || email == null || password == null || role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Name, email, password, and selected role are required fields.");
        }

        String trimmedEmail = email.toLowerCase().trim();

        if (userRepository.findByEmailIgnoreCase(trimmedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email address already exists.");
        }

        User newUser = buildUserFromRequest(body, trimmedEmail, name, password, role);
        userRepository.save(newUser);

        // Auto-enroll student into a course if courseId is provided
        String enrolledCourseTitle = "";
        String courseId = (String) body.get("courseId");
        if ("student".equals(role) && courseId != null && !courseId.isBlank()) {
            Course course = courseRepository.findById(courseId).orElse(null);
            if (course != null) {
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
                enrolledCourseTitle = course.getTitle();

                Map<String, Object> ep = new HashMap<>();
                ep.put("enrollment", enrollment);
                sseService.broadcast("ENROLLMENT_MUTATED", ep);
            }
        }

        // Broadcast registration alert
        Boolean isInst = newUser.getIsInstituteMember();
        String alertMsg = "🔔 A new " + role + " (" + name + ") has registered" + 
                (Boolean.TRUE.equals(isInst) && !enrolledCourseTitle.isEmpty() ? " to join the institute for '" + enrolledCourseTitle + "'" : "") + 
                ". Please review and approve.";

        Map<String, Object> alertPayload = new HashMap<>();
        alertPayload.put("message", alertMsg);
        sseService.broadcast("REALTIME_ALERT", alertPayload);
        sseService.broadcast("SYSTEM_STATS_MUTATED",
                Map.of("usersCount", userRepository.count()));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", newUser);
        return response;
    }

    private User buildUserFromRequest(Map<String, Object> body, String email, String name,
                                       String password, String role) {
        User u = new User();
        u.setId("u-" + System.currentTimeMillis());
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        u.setApprovalStatus("pending");
        u.setCreatedAt(Instant.now().toString());
        u.setContactNum((String) body.get("contactNum"));
        u.setCollegeName((String) body.get("collegeName"));
        u.setBranch((String) body.get("branch"));
        u.setCustomBranch((String) body.get("customBranch"));
        u.setAcademicStatus((String) body.get("academicStatus"));
        u.setAddress((String) body.get("address"));
        u.setIdDetails((String) body.get("idDetails"));
        u.setResumeFileName((String) body.get("resumeFileName"));
        u.setResumeFileSize((String) body.get("resumeFileSize"));
        u.setPaymentMode((String) body.get("paymentMode"));
        u.setPaymentTxnId((String) body.get("paymentTxnId"));
        u.setPaymentAmount((String) body.get("paymentAmount"));
        u.setPaymentScreenshotName((String) body.get("paymentScreenshotName"));
        u.setSpecialization((String) body.get("specialization"));
        u.setStrongTechnologies((String) body.get("strongTechnologies"));
        Object isInstituteMember = body.get("isInstituteMember");
        if (isInstituteMember != null) {
            u.setIsInstituteMember(Boolean.parseBoolean(isInstituteMember.toString()));
        }
        return u;
    }
}
