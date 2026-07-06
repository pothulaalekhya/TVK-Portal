package com.tvk.portal.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonInclude;

@Entity
@Table(name = "system_logs")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String time;

    @Column(name = "log_event")
    private String event;

    @Column(columnDefinition = "TEXT")
    private String detail;

    public SystemLog() {}

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
}
