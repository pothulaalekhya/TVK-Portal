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
import java.util.List;
import java.util.Map;

/**
 * EnrollmentService — handles course enrollment and grade/feedback updates.
 * Mirrors Express /api/enroll, /api/enrollments, /api/enrollment/update
 */
@Service
@Transactional
public class EnrollmentService {

    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SseService sseService;

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    /**
     * POST /api/enroll
     * Enrolls a student into a course.
     */
    public Map<String, Object> enroll(Map<String, String> body) {
        String studentId = body.get("studentId");
        String courseId = body.get("courseId");

        if (studentId == null || courseId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Both active StudentID and CourseID must be provided.");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Invalid student profile."));

        if (!"student".equals(student.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid student profile.");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "The selected course is unavailable."));

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You are already actively enrolled in this specific training program.");
        }

        int capacity = course.getCapacity() != null ? course.getCapacity() : 30;
        int enrolled = course.getEnrolledCount() != null ? course.getEnrolledCount() : 0;
        if (enrolled >= capacity) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "Sorry, all limited seats have been booked out for this batch.");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setId("e-" + System.currentTimeMillis());
        enrollment.setCourseId(course.getId());
        enrollment.setCourseTitle(course.getTitle());
        enrollment.setStudentId(student.getId());
        enrollment.setStudentName(student.getName());
        enrollment.setStudentEmail(student.getEmail());
        enrollment.setStatus("active");
        enrollment.setRegisteredAt(Instant.now().toString());
        enrollment.setProgress(0);
        enrollmentRepository.save(enrollment);

        // Increment enrolled count
        course.setEnrolledCount(enrolled + 1);
        courseRepository.save(course);

        // SSE broadcasts
        Map<String, Object> ep = new HashMap<>();
        ep.put("enrollment", enrollment);
        sseService.broadcast("ENROLLMENT_MUTATED", ep);

        Map<String, Object> alertPayload = new HashMap<>();
        alertPayload.put("message", "🎉 Student '" + student.getName() + "' just registered in the '" + course.getTitle() + "' course!");
        sseService.broadcast("REALTIME_ALERT", alertPayload);

        sseService.broadcast("SYSTEM_STATS_MUTATED",
                Map.of("enrollmentsCount", enrollmentRepository.count()));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("enrollment", enrollment);
        return response;
    }

    /**
     * POST /api/enrollment/update
     * Updates progress, grade, and feedback for an enrollment (Trainer action).
     */
    public Map<String, Object> updateEnrollment(Map<String, Object> body) {
        String enrollmentId = (String) body.get("enrollmentId");

        if (enrollmentId == null || enrollmentId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Active enrollment identifier required.");
        }

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Matching enrollment registry not found."));

        Object progressObj = body.get("progress");
        if (progressObj != null) {
            int progress = Integer.parseInt(progressObj.toString());
            progress = Math.min(100, Math.max(0, progress));
            enrollment.setProgress(progress);
            // Auto-complete when progress reaches 100%
            if (progress >= 100) {
                enrollment.setStatus("completed");
            }
        }

        Object gradeObj = body.get("grade");
        if (gradeObj != null) {
            enrollment.setGrade(gradeObj.toString());
        }

        Object feedbackObj = body.get("feedback");
        if (feedbackObj != null) {
            enrollment.setFeedback(feedbackObj.toString());
        }

        enrollmentRepository.save(enrollment);

        // SSE broadcasts
        Map<String, Object> fp = new HashMap<>();
        fp.put("enrollmentId", enrollmentId);
        fp.put("studentId", enrollment.getStudentId());
        fp.put("updated", enrollment);
        sseService.broadcast("FEEDBACK_MUTATED", fp);

        Map<String, Object> alertPayload = new HashMap<>();
        alertPayload.put("message", "Trainer added updates/feedback for student '" +
                enrollment.getStudentName() + "' in '" + enrollment.getCourseTitle() + "'.");
        sseService.broadcast("REALTIME_ALERT", alertPayload);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("enrollment", enrollment);
        return response;
    }
}
