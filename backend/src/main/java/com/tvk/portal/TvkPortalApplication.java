package com.tvk.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * TVK Technologies Training & Placement Portal
 * Spring Boot 3 + MySQL Backend
 *
 * Starts the embedded Tomcat server on port 8080.
 * All Angular frontend routes are served from dist/browser.
 * REST API is available at /api/**
 * Real-time SSE stream at /api/sync/stream
 */
@SpringBootApplication
@EnableScheduling   // Required for SSE heartbeat (@Scheduled)
@EnableAsync        // Required for async SSE broadcast
public class TvkPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(TvkPortalApplication.class, args);
        System.out.println("===============================================");
        System.out.println("TVK TECHNOLOGIES TRAINING PORTAL RUNNING");
        System.out.println("Open browser: http://localhost:8080");
        System.out.println("H2 Console  : N/A (using MySQL)");
        System.out.println("API Base    : http://localhost:8080/api");
        System.out.println("===============================================");
    }
}
