package com.tvk.portal.config;

import com.tvk.portal.model.*;
import com.tvk.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * DataSeeder — populates MySQL with default data on first run.
 * Checks if admin user already exists before seeding to avoid duplicates.
 * This mirrors the default seed data in server.ts (Express version).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private ContactRequestRepository contactRepository;
    @Autowired private SystemLogRepository systemLogRepository;

    @Override
    public void run(String... args) {
        // Seed users if empty
        if (!userRepository.existsById("u-admin")) {
            System.out.println("[TVK] First run detected — seeding MySQL database with default data...");
            seedUsers();
            seedEnrollments();
            seedContacts();
            seedSystemLog();
        }

        // Always check-seed courses to populate new ones
        seedCourses();
    }

    private void seedUsers() {
        User admin = new User();
        admin.setId("u-admin");
        admin.setName("Global Registrar");
        admin.setEmail("admin@tvktechs.com");
        admin.setPassword("password123");
        admin.setRole("admin");
        admin.setApprovalStatus("approved");
        admin.setCreatedAt(Instant.now().toString());
        userRepository.save(admin);

        User trainer1 = new User();
        trainer1.setId("u-trainer1");
        trainer1.setName("Mr. Satish Raghavan (Sr. Java Architect)");
        trainer1.setEmail("trainer.java@tvktechs.com");
        trainer1.setPassword("password123");
        trainer1.setRole("trainer");
        trainer1.setApprovalStatus("approved");
        trainer1.setSpecialization("Enterprise Java Architect");
        trainer1.setStrongTechnologies("Core Java, Spring Boot, Hibernate");
        trainer1.setCreatedAt(Instant.now().toString());
        userRepository.save(trainer1);

        User trainer2 = new User();
        trainer2.setId("u-trainer2");
        trainer2.setName("Ms. Priyanka Sen (Frontend UX Specialist)");
        trainer2.setEmail("trainer.angular@tvktechs.com");
        trainer2.setPassword("password123");
        trainer2.setRole("trainer");
        trainer2.setApprovalStatus("approved");
        trainer2.setSpecialization("Frontend & UI/UX Expert");
        trainer2.setStrongTechnologies("Angular, React, Tailwind CSS");
        trainer2.setCreatedAt(Instant.now().toString());
        userRepository.save(trainer2);

        User student1 = new User();
        student1.setId("u-student1");
        student1.setName("Rahul Bose");
        student1.setEmail("rahul.b@gmail.com");
        student1.setPassword("password123");
        student1.setRole("student");
        student1.setApprovalStatus("approved");
        student1.setPaymentStatus("paid");
        student1.setBatchNumber("B-2026-WKND-1");
        student1.setAssignedTrainer("Mr. Satish Raghavan");
        student1.setContactNum("+91 9900990099");
        student1.setCollegeName("IIT Bombay");
        student1.setBranch("Computer Science");
        student1.setAcademicStatus("Graduated (Looking for Job)");
        student1.setCreatedAt(Instant.now().toString());
        userRepository.save(student1);

        User student2 = new User();
        student2.setId("u-student2");
        student2.setName("Ananya Rao");
        student2.setEmail("ananya.r@gmail.com");
        student2.setPassword("password123");
        student2.setRole("student");
        student2.setApprovalStatus("pending");
        student2.setPaymentStatus("yet to pay");
        student2.setBatchNumber("B-2026-WKDAY-2");
        student2.setAssignedTrainer("Ms. Priyanka Sen");
        student2.setContactNum("+91 8877665544");
        student2.setCollegeName("NIT Trichy");
        student2.setBranch("Information Technology");
        student2.setAcademicStatus("Pursuing (4th Year)");
        student2.setCreatedAt(Instant.now().toString());
        userRepository.save(student2);
    }

    private void seedCourses() {
        if (!courseRepository.existsById("c-java-fullstack")) {
            Course javaFullStack = new Course();
            javaFullStack.setId("c-java-fullstack");
            javaFullStack.setTitle("Java with Angular: Professional Full Stack Developer");
            javaFullStack.setDescription("Our premier training & placement program. Master high-performance Java frameworks paired with Angular enterprise SPA architecture.");
            javaFullStack.setDuration("12 Weeks (Weekend & Weekday Batches)");
            javaFullStack.setTrainerName("Mr. Satish Raghavan & Ms. Priyanka Sen");
            javaFullStack.setFeatures(Arrays.asList(
                    "100% Job Confirmation Guarantee",
                    "Expert Trainer & Placement Support",
                    "Resume Building & Mock Interviews",
                    "Real-Time Live Projects"
            ));
            javaFullStack.setSyllabus(Arrays.asList(
                    "Core Java (OOPs, Collections, Exceptions, Multithreading, Streams)",
                    "Advanced Java (JDBC, Hibernate ORM, SQL Databases)",
                    "Spring Boot & RESTful APIs Microservice Architecture",
                    "Angular 17+ Essentials (Components, RxJS Routing, HTTP Client)",
                    "Git, GitHub & Cloud CI/CD Deployment Practice"
            ));
            javaFullStack.setBatches(Arrays.asList("Weekend Batch (10 AM - 2 PM)", "Weekday Batch (7 AM - 9 AM)"));
            javaFullStack.setCapacity(30);
            javaFullStack.setEnrolledCount(12);
            javaFullStack.setIsLive(true);
            javaFullStack.setPrice("$299 (Flexible EMI Options)");
            courseRepository.save(javaFullStack);
        }

        if (!courseRepository.existsById("c-spring-micro")) {
            Course springMicro = new Course();
            springMicro.setId("c-spring-micro");
            springMicro.setTitle("Enterprise Spring Boot & Microservices");
            springMicro.setDescription("Deep dive into production-grade microservices with Spring Cloud, OAuth2, and scalable Docker container deployments.");
            springMicro.setDuration("6 Weeks");
            springMicro.setTrainerName("Mr. Satish Raghavan");
            springMicro.setFeatures(Arrays.asList("Advanced Concepts", "API Gateway & Security", "Doubt Slay Sessions"));
            springMicro.setSyllabus(Arrays.asList(
                    "Spring Boot Configuration & Spring Data JPA",
                    "Microservices Core principles (Eureka, Spring Cloud Gateway)",
                    "Security & Authentication with JWT and OAuth2",
                    "Kafka/RabbitMQ Messaging Systems",
                    "Kubernetes & Docker Deployment"
            ));
            springMicro.setCapacity(25);
            springMicro.setEnrolledCount(8);
            springMicro.setIsLive(true);
            springMicro.setPrice("$199");
            courseRepository.save(springMicro);
        }

        if (!courseRepository.existsById("c-angular-pro")) {
            Course angularPro = new Course();
            angularPro.setId("c-angular-pro");
            angularPro.setTitle("Angular 17+ Modern Web Applications");
            angularPro.setDescription("Master modern reactive web architecture using standalone components, RxJS, NgRx, and server-side pre-rendering.");
            angularPro.setDuration("6 Weeks");
            angularPro.setTrainerName("Ms. Priyanka Sen");
            angularPro.setFeatures(Arrays.asList("Reactive Architecture", "Mock Interview Training", "Real-Time Project Support"));
            angularPro.setSyllabus(Arrays.asList(
                    "Standalone Components & Signals Control State",
                    "Advanced Routers & Guard Interceptors",
                    "RxJS Observables Flow & Reactive Forms",
                    "State Management with NgRx Store",
                    "Optimizing Performance & Accessibility"
            ));
            angularPro.setCapacity(25);
            angularPro.setEnrolledCount(9);
            angularPro.setIsLive(true);
            angularPro.setPrice("$149");
            courseRepository.save(angularPro);
        }

        if (!courseRepository.existsById("c-python-dev")) {
            Course pythonDev = new Course();
            pythonDev.setId("c-python-dev");
            pythonDev.setTitle("Python Developer: Professional Automation & Web");
            pythonDev.setDescription("Build scalable web backends, data processors, and task automation scripts using Python, Django, and Flask.");
            pythonDev.setDuration("8 Weeks");
            pythonDev.setTrainerName("TBD / Guest Specialist");
            pythonDev.setFeatures(Arrays.asList("Automation Projects", "Python OOPs", "Mock Interviews"));
            pythonDev.setSyllabus(Arrays.asList(
                    "Python Syntax & OOPs Core Principles",
                    "Django Web Framework & Routing",
                    "Database Integration with PostgreSQL & SQLite",
                    "Web Scraping & Script Automation",
                    "REST API Design & Deployment"
            ));
            pythonDev.setBatches(Arrays.asList("Weekend Batch (3 PM - 6 PM)", "Weekday Batch (6 PM - 8 PM)"));
            pythonDev.setCapacity(25);
            pythonDev.setEnrolledCount(0);
            pythonDev.setIsLive(true);
            pythonDev.setPrice("$199");
            courseRepository.save(pythonDev);
        }

        if (!courseRepository.existsById("c-ai-datascience")) {
            Course aiData = new Course();
            aiData.setId("c-ai-datascience");
            aiData.setTitle("AI & Data Science Specialist");
            aiData.setDescription("Learn mathematics for machine learning, Python data pipelines, deep neural networks, and model deployment.");
            aiData.setDuration("12 Weeks");
            aiData.setTrainerName("Mr. Satish Raghavan");
            aiData.setFeatures(Arrays.asList("Machine Learning Projects", "Neural Networks", "Hands-on Labs"));
            aiData.setSyllabus(Arrays.asList(
                    "Data Preprocessing with Pandas & NumPy",
                    "Supervised & Unsupervised Machine Learning",
                    "Neural Networks & Deep Learning with TensorFlow",
                    "Model Evaluation & Hyperparameter Tuning",
                    "Production Deployment & API Serving"
            ));
            aiData.setBatches(Arrays.asList("Weekend Batch (9 AM - 1 PM)", "Weekday Batch (8 PM - 10 PM)"));
            aiData.setCapacity(30);
            aiData.setEnrolledCount(0);
            aiData.setIsLive(true);
            aiData.setPrice("$299");
            courseRepository.save(aiData);
        }

        if (!courseRepository.existsById("c-qa-testing")) {
            Course qaTest = new Course();
            qaTest.setId("c-qa-testing");
            qaTest.setTitle("Software QA & Automation Test Engineer");
            qaTest.setDescription("Master software testing lifecycle, test-driven development, manual QA, and automated UI/API scripts.");
            qaTest.setDuration("6 Weeks");
            qaTest.setTrainerName("TBD / Guest Specialist");
            qaTest.setFeatures(Arrays.asList("Selenium Automation", "TestNG Framework", "Postman API Testing"));
            qaTest.setSyllabus(Arrays.asList(
                    "Manual Testing Methodologies & SDLC/STLC",
                    "UI Testing with Selenium WebDriver & Java",
                    "API Testing with RestAssured & Postman",
                    "TDD/BDD with Cucumber Framework",
                    "CI/CD Pipeline Integration with Jenkins"
            ));
            qaTest.setBatches(Arrays.asList("Weekend Batch (4 PM - 7 PM)", "Weekday Batch (8 AM - 10 AM)"));
            qaTest.setCapacity(20);
            qaTest.setEnrolledCount(0);
            qaTest.setIsLive(true);
            qaTest.setPrice("$149");
            courseRepository.save(qaTest);
        }

        if (!courseRepository.existsById("c-react-dev")) {
            Course reactDev = new Course();
            reactDev.setId("c-react-dev");
            reactDev.setTitle("React Developer: Modern Frontend Applications");
            reactDev.setDescription("Master state management, React Hooks, client routers, Redux, and modern SSR deployment.");
            reactDev.setDuration("6 Weeks");
            reactDev.setTrainerName("Ms. Priyanka Sen");
            reactDev.setFeatures(Arrays.asList("Vite Project Setups", "Redux Toolkit", "Performance Tuning"));
            reactDev.setSyllabus(Arrays.asList(
                    "JSX Syntax, Props & State Management",
                    "React Hooks (useState, useEffect, useContext)",
                    "State Flow with Redux Toolkit",
                    "Tailwind CSS Styling & Responsive Views",
                    "Next.js Essentials & Server-Side Rendering"
            ));
            reactDev.setBatches(Arrays.asList("Weekend Batch (10 AM - 1 PM)", "Weekday Batch (7 PM - 9 PM)"));
            reactDev.setCapacity(25);
            reactDev.setEnrolledCount(0);
            reactDev.setIsLive(true);
            reactDev.setPrice("$149");
            courseRepository.save(reactDev);
        }

        if (!courseRepository.existsById("c-devops")) {
            Course devops = new Course();
            devops.setId("c-devops");
            devops.setTitle("DevOps & Cloud Systems Engineer");
            devops.setDescription("Bridge the gap between code and infrastructure. Learn continuous delivery pipelines, containers, and cloud hosts.");
            devops.setDuration("10 Weeks");
            devops.setTrainerName("Mr. Satish Raghavan");
            devops.setFeatures(Arrays.asList("CI/CD Pipelines", "Kubernetes Deployments", "AWS Labs"));
            devops.setSyllabus(Arrays.asList(
                    "Linux Command Line & Shell Scripting",
                    "Docker Containerization & Multi-stage builds",
                    "Kubernetes Pods, Services & Deployments",
                    "CI/CD Automation with Jenkins & GitHub Actions",
                    "AWS Infrastructure (EC2, S3, RDS) & IaC with Terraform"
            ));
            devops.setBatches(Arrays.asList("Weekend Batch (2 PM - 6 PM)", "Weekday Batch (8 PM - 10 PM)"));
            devops.setCapacity(25);
            devops.setEnrolledCount(0);
            devops.setIsLive(true);
            devops.setPrice("$249");
            courseRepository.save(devops);
        }
    }

    private void seedEnrollments() {
        Enrollment e1 = new Enrollment();
        e1.setId("e1");
        e1.setCourseId("c-java-fullstack");
        e1.setCourseTitle("Java with Angular: Professional Full Stack Developer");
        e1.setStudentId("u-student1");
        e1.setStudentName("Rahul Bose");
        e1.setStudentEmail("rahul.b@gmail.com");
        e1.setStatus("active");
        e1.setRegisteredAt(Instant.now().minusSeconds(432000).toString());
        e1.setProgress(45);
        e1.setGrade("A");
        e1.setFeedback("Demonstrates exceptional understanding of database schemas and Spring JPA queries.");
        enrollmentRepository.save(e1);

        Enrollment e2 = new Enrollment();
        e2.setId("e2");
        e2.setCourseId("c-angular-pro");
        e2.setCourseTitle("Angular 17+ Modern Web Applications");
        e2.setStudentId("u-student2");
        e2.setStudentName("Ananya Rao");
        e2.setStudentEmail("ananya.r@gmail.com");
        e2.setStatus("active");
        e2.setRegisteredAt(Instant.now().minusSeconds(172800).toString());
        e2.setProgress(20);
        e2.setFeedback("Responsive components are fully functional. Keep up the high dedication!");
        enrollmentRepository.save(e2);
    }

    private void seedContacts() {
        ContactRequest contact = new ContactRequest();
        contact.setId("cnt1");
        contact.setName("Karan Johar");
        contact.setEmail("karan.j@gmail.com");
        contact.setPhone("+91 9876543210");
        contact.setSubject("Queries on Job Placement Assistance");
        contact.setMessage("Hi TVK Techs, I graduated from BE in 2024. Can I apply for the Java with Angular Training? Please let me know how the placement assurance program works.");
        contact.setStatus("read");
        contact.setCreatedAt(Instant.now().toString());
        contactRepository.save(contact);
    }

    private void seedSystemLog() {
        SystemLog log = new SystemLog();
        log.setTime(Instant.now().toString());
        log.setEvent("SYSTEM_INITIALIZED");
        log.setDetail("TVK Technologies Spring Boot Platform booted successfully with MySQL database.");
        systemLogRepository.save(log);
    }
}
