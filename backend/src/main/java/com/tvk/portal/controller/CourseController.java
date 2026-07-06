package com.tvk.portal.controller;

import com.tvk.portal.model.Course;
import com.tvk.portal.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired private CourseService courseService;

    /** GET /api/courses */
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    /** POST /api/courses — create new OR update existing */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrUpdate(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(courseService.createOrUpdate(body));
    }

    /** DELETE /api/courses/:id */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.deleteCourse(id));
    }
}
