package com.tvk.portal.service;

import com.tvk.portal.model.Course;
import com.tvk.portal.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/**
 * CourseService — CRUD operations for training courses.
 * Mirrors Express POST/GET/DELETE /api/courses
 */
@Service
@Transactional
public class CourseService {

    @Autowired private CourseRepository courseRepository;
    @Autowired private SseService sseService;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Creates a new course OR updates an existing one.
     * If body contains "id", it's an update. Otherwise, creates new.
     */
    public Map<String, Object> createOrUpdate(Map<String, Object> body) {
        String title = (String) body.get("title");
        String description = (String) body.get("description");

        if (title == null || title.isBlank() || description == null || description.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Course title and description are strictly required.");
        }

        String courseId = (String) body.get("id");
        Course course;

        if (courseId != null && !courseId.isBlank()) {
            // Update existing course
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Requested course not found."));
        } else {
            // Create new course
            course = new Course();
            course.setId("c-" + System.currentTimeMillis());
            course.setEnrolledCount(0);
            course.setIsLive(true);
        }

        course.setTitle(title);
        course.setDescription(description);
        course.setDuration((String) body.getOrDefault("duration", "8 Weeks"));
        course.setTrainerName((String) body.getOrDefault("trainerName", "To Be Assigned"));
        course.setPrice((String) body.get("price"));

        Object capacityObj = body.get("capacity");
        if (capacityObj != null) {
            course.setCapacity(Integer.parseInt(capacityObj.toString()));
        } else if (course.getCapacity() == null) {
            course.setCapacity(30);
        }

        // Parse features list
        Object featuresObj = body.get("features");
        if (featuresObj instanceof List<?> fl) {
            List<String> features = new ArrayList<>();
            fl.forEach(f -> features.add(f.toString()));
            course.setFeatures(features);
        }

        // Parse syllabus list
        Object syllabusObj = body.get("syllabus");
        if (syllabusObj instanceof List<?> sl) {
            List<String> syllabus = new ArrayList<>();
            sl.forEach(s -> syllabus.add(s.toString()));
            course.setSyllabus(syllabus);
        }

        // Parse batches list
        Object batchesObj = body.get("batches");
        if (batchesObj instanceof List<?> bl) {
            List<String> batches = new ArrayList<>();
            bl.forEach(b -> batches.add(b.toString()));
            course.setBatches(batches);
        }

        courseRepository.save(course);

        Map<String, Object> ep = new HashMap<>();
        ep.put("course", course);
        sseService.broadcast("COURSE_MUTATED", ep);

        Map<String, Object> alertPayload = new HashMap<>();
        alertPayload.put("message", "Course list updated: '" + course.getTitle() + "' was added or updated.");
        sseService.broadcast("REALTIME_ALERT", alertPayload);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("course", course);
        return response;
    }

    public Map<String, Object> deleteCourse(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found."));
        String title = course.getTitle();
        courseRepository.deleteById(id);

        Map<String, Object> ep = new HashMap<>();
        ep.put("deletedId", id);
        sseService.broadcast("COURSE_MUTATED", ep);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Successfully deleted course: " + title);
        return response;
    }
}
