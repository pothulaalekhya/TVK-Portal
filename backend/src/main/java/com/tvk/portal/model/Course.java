package com.tvk.portal.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Course {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String duration;
    private String trainerName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_features", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "feature_order")
    @Column(name = "feature", columnDefinition = "TEXT")
    private List<String> features = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_syllabus", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "syllabus_order")
    @Column(name = "syllabus_item", columnDefinition = "TEXT")
    private List<String> syllabus = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_batches", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "batch_order")
    @Column(name = "batch_info")
    private List<String> batches = new ArrayList<>();

    private Integer capacity;
    private Integer enrolledCount = 0;
    private Boolean isLive = true;
    private String price;

    public Course() {}

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getTrainerName() { return trainerName; }
    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public List<String> getSyllabus() { return syllabus; }
    public void setSyllabus(List<String> syllabus) { this.syllabus = syllabus; }

    public List<String> getBatches() { return batches; }
    public void setBatches(List<String> batches) { this.batches = batches; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(Integer enrolledCount) { this.enrolledCount = enrolledCount; }

    public Boolean getIsLive() { return isLive; }
    public void setIsLive(Boolean isLive) { this.isLive = isLive; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
}
