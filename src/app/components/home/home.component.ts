import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { Course } from "../../models/models";
import { Subscription } from "rxjs";

interface AlumniStory {
  id: string;
  name: string;
  role: string;
  company: string;
  packageLpa: string;
  previousBg: string;
  quote: string;
  avatarUrl: string;
  course: string;
  campus: string;
}

interface TrainerProfile {
  name: string;
  role: string;
  experience: string;
  exCompany: string;
  specialization: string[];
  bio: string;
  avatarUrl: string;
  rating: number;
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

import { RevealDirective, HeroHandoffDirective } from "../../motion";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RevealDirective, HeroHandoffDirective],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  activeTrackFilter: "all" | "fullstack" | "backend" | "frontend" | "cloud" = "all";
  selectedSyllabusCourse: Course | null = null;
  activeFaqIndex: number | null = 0;

  // EMI Calculator State in Indian Rupees (₹ INR)
  emiCoursePrice: number = 34999;
  emiDownPayment: number = 5000;
  emiTenureMonths: number = 6;

  // Carousel & Stats State
  activeSlideIndex = 0;
  private autoSlideInterval: any;
  private subscriptions: Subscription[] = [];

  stats = {
    studentsPlaced: 2850,
    hiringPartners: 160,
    avgPackageLpa: "8.4 LPA",
    highestPackageLpa: "24.5 LPA",
    successRate: "97.4%",
    yearsExcellence: "10+",
  };

  hiringPartners = [
    { name: "TCS", logo: "TATA CONSULTANCY SERVICES" },
    { name: "Infosys", logo: "Infosys" },
    { name: "Wipro", logo: "Wipro" },
    { name: "Amazon", logo: "amazon" },
    { name: "Cognizant", logo: "Cognizant" },
    { name: "Capgemini", logo: "Capgemini" },
    { name: "Accenture", logo: "accenture" },
    { name: "Oracle", logo: "ORACLE" },
    { name: "HCL Tech", logo: "HCLTech" },
    { name: "Tech Mahindra", logo: "Tech Mahindra" },
    { name: "Dell", logo: "DELL" },
    { name: "IBM", logo: "IBM" },
  ];

  learningTimeline = [
    {
      step: "01",
      phaseNumber: 1,
      title: "Core Architecture & Coding",
      subtitle: "Foundation Mastery (Weeks 1 - 3)",
      desc: "Deep-dive into Core Java 21, Data Structures, OOPs design patterns, and Modern TypeScript essentials from scratch.",
      icon: "💻",
      highlight: "Foundation Mastery",
      checklist: [
        "Core Java 21: Virtual Threads, Streams, Lambdas & Concurrency",
        "Data Structures: HashMaps, Trees, Graph traversals & Big-O",
        "OOPs & SOLID Principles: Factory, Strategy, Builder Patterns",
        "Modern TypeScript 5 & Clean Code Best Practices",
      ],
      tags: ["Java 21", "TypeScript", "Data Structures", "Design Patterns"],
      mockupTitle: "CoreArchitectureLab.java",
      mockupCode: `// TVK Core Lab: High-Throughput Order Processor
public class OrderPipelineEngine {
    private final ExecutorService vThreads = 
        Executors.newVirtualThreadPerTaskExecutor();

    public CompletableFuture<OrderReceipt> processOrder(OrderRequest req) {
        return CompletableFuture.supplyAsync(() -> {
            validateInventory(req.items());
            PaymentToken token = chargePaymentGateway(req.payment());
            return new OrderReceipt(UUID.randomUUID(), token, Status.CONFIRMED);
        }, vThreads);
    }
}`,
      mockupMetric: "10,000 req/sec Virtual Thread Throughput",
      mockupStatus: "Compiled & Verified in 12ms",
    },
    {
      step: "02",
      phaseNumber: 2,
      title: "Full Stack & Microservices",
      subtitle: "Enterprise Project Labs (Weeks 4 - 8)",
      desc: "Architect enterprise Spring Boot REST APIs, Angular/React reactive SPAs, PostgreSQL, and Docker containerization.",
      icon: "⚡",
      highlight: "Real Project Labs",
      checklist: [
        "Spring Boot 3: Security, JWT Auth, JPA/Hibernate & RESTful APIs",
        "Distributed Microservices: Eureka Discovery, API Gateway, Kafka",
        "Angular 18: Standalone Components, Signals, RxJS & State",
        "Docker & Multi-Stage Containers + PostgreSQL ACID Schema",
      ],
      tags: ["Spring Boot 3", "Angular 18", "Microservices", "Docker", "PostgreSQL"],
      mockupTitle: "microservices-compose.yml",
      mockupCode: `version: '3.8'
services:
  api-gateway:
    image: tvk/spring-cloud-gateway:3.2
    ports: ["8080:8080"]
  auth-service:
    image: tvk/oauth2-jwt-service:latest
    environment:
      - SPRING_PROFILES_ACTIVE=production
  order-microservice:
    image: tvk/order-engine:v2.4
    depends_on: [postgres-cluster, kafka-broker]`,
      mockupMetric: "5 Microservices Containerized & Deployed",
      mockupStatus: "Zero-Downtime Rolling Update Healthy",
    },
    {
      step: "03",
      phaseNumber: 3,
      title: "Corporate Mock Interviews",
      subtitle: "Technical Readiness Drills (Weeks 9 - 10)",
      desc: "Live 1-on-1 technical mock drills, system design reviews, coding assessments, and GitHub portfolio optimization.",
      icon: "🎯",
      highlight: "Interview Readiness",
      checklist: [
        "1-on-1 Technical Mock Interviews with Working Tech Leads",
        "Live System Design: Distributed Caching, Rate Limiters, Sharding",
        "Live Coding Assessments on LeetCode Medium/Hard Patterns",
        "ATS-Optimized Resume Polish & GitHub Code Portfolio Review",
      ],
      tags: ["System Design", "Mock Drills", "Live Coding", "Resume Audit"],
      mockupTitle: "Technical-Assessment-Scorecard.json",
      mockupCode: `{
  "candidate": "Rahul Sharma",
  "track": "Java Full Stack Engineer",
  "evaluation": {
    "systemArchitecture": 9.5,
    "concurrencyAndAcid": 9.2,
    "frontendReactiveState": 9.0,
    "problemSolvingSpeed": "18 mins (Target: 25 mins)"
  },
  "verdict": "READY_FOR_TIER_1_HIRING_DRIVE"
}`,
      mockupMetric: "Overall Performance Score: 94.2%",
      mockupStatus: "Certified for Tier-1 Hiring Partner Drives",
    },
    {
      step: "04",
      phaseNumber: 4,
      title: "100% Placement Drives",
      subtitle: "Guaranteed Offer Letter (Weeks 11 - 12)",
      desc: "Direct interview scheduling with 160+ hiring partner companies across Bangalore and Chennai until you secure an offer.",
      icon: "🚀",
      highlight: "Guaranteed Offer",
      checklist: [
        "Direct Interview Scheduling with 160+ Top MNCs & Unicorns",
        "Unlimited Placement Drive Access across Bangalore & Chennai Hubs",
        "Salary Negotiation & Offer Acceptance Guidance (6 - 24 LPA)",
        "Post-Placement Career Mentorship & Tech Alumni Community",
      ],
      tags: ["160+ Partners", "Unlimited Drives", "Bangalore & Chennai", "Offer Assured"],
      mockupTitle: "Placement-Drive-Scheduler.ts",
      mockupCode: `// TVK Corporate Hiring Desk Dispatch
const placementQueue = new PlacementDispatch({
  hiringPartners: ["Amazon", "Oracle", "Cognizant", "Infosys", "TCS"],
  interviewMode: "Hybrid / In-Campus Bangalore & Chennai",
  batchYear: 2026,
  status: "OFFER_DISPATCHED",
  highestPackage: "₹24.5 LPA",
  averagePackage: "₹8.4 LPA"
});`,
      mockupMetric: "Average Placement Turnaround: 14 Days",
      mockupStatus: "100% Placement Policy Active",
    },
  ];

  // Phase Stepper Scrollytelling State
  activePhaseIndex = 0;
  isPhaseTransitioning = false;
  private phaseTimeout: any;

  // Testimonial Carousel State
  testimonialSlideIndex = 0;
  isQuoteFading = false;
  private autoTestimonialInterval: any;
  private quoteFadeTimeout: any;

  technologies = [
    { title: "Java 21", desc: "Virtual Threads, Streams, Modern OOP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    { title: "Spring Boot 3", desc: "Microservices, Security, REST APIs", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg" },
    { title: "Angular 18", desc: "Signals, Standalone, RxJS Streams", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" },
    { title: "React 18", desc: "Hooks, Next.js, Redux Toolkit", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
    { title: "PostgreSQL", desc: "Relational Schema, Indexing, ACID", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
    { title: "Docker", desc: "Containers, Compose, Multi-stage", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
    { title: "AWS Cloud", desc: "EC2, S3, RDS, Serverless, IAM", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { title: "Git & GitHub", desc: "CI/CD Actions, Branching, PRs", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
  ];

  alumniStories: AlumniStory[] = [
    {
      id: "1",
      name: "Sneha Varadharajan",
      role: "Full Stack Java Engineer",
      company: "Amazon Web Services",
      packageLpa: "₹14.2 LPA",
      previousBg: "Non-IT Mechanical Graduate (2024)",
      quote: "TVK Technologies completely redefined my career trajectory. The hands-on Spring Boot microservices labs and dedicated mock interviews helped me clear AWS on my first attempt!",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      course: "Full Stack Java Developer with Angular",
      campus: "Bangalore (BTM Hub)",
    },
    {
      id: "2",
      name: "Karthik Subramanian",
      role: "Senior Angular Frontend Engineer",
      company: "Cognizant Digital",
      packageLpa: "₹9.8 LPA",
      previousBg: "B.Sc Computer Science (2 Years Career Gap)",
      quote: "The faculty at TVK are working software architects. They taught us real reactive state architecture and unit testing that actual corporate teams use daily.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      course: "Angular Developer Specialist",
      campus: "Chennai (OMR Hub)",
    },
    {
      id: "3",
      name: "Pooja Venkatesh",
      role: "Backend Spring Boot Specialist",
      company: "Oracle Cloud Infrastructure",
      packageLpa: "₹12.5 LPA",
      previousBg: "B.E Electronics & Communication (2025)",
      quote: "From zero backend knowledge to designing distributed systems with Kafka and Docker. TVK's placement team arranged 5 interviews within 2 weeks of course completion!",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      course: "Java Full Stack with React",
      campus: "Bangalore (BTM Hub)",
    },
  ];

  trainersList: TrainerProfile[] = [
    {
      name: "Vikramaditya Rao",
      role: "Lead Enterprise Architect & Full Stack Mentor",
      experience: "14+ Years Industry Experience",
      exCompany: "Ex-Oracle & Infosys Principal Architect",
      specialization: ["Core Java 21", "Spring Boot 3", "Microservices", "Kafka", "AWS"],
      bio: "Trained 3,200+ engineers into high-performing enterprise Java developers. Passionate about clean code, concurrency, and high-throughput systems.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
    },
    {
      name: "Swathi Sundaram",
      role: "Staff Frontend Architect & Angular Lead",
      experience: "11+ Years Industry Experience",
      exCompany: "Ex-Thoughtworks & Mindtree Frontend Specialist",
      specialization: ["Angular 18", "TypeScript", "RxJS", "State Management", "Design Systems"],
      bio: "Specializes in building complex reactive web enterprise applications. Guides students through real production UI performance patterns.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 4.92,
    },
    {
      name: "Arun Prakash",
      role: "Cloud & DevOps Infrastructure Lead",
      experience: "9+ Years Industry Experience",
      exCompany: "Ex-Wipro Cloud Platforms & Kubernetes Lead",
      specialization: ["Docker", "Kubernetes", "CI/CD Pipelines", "AWS Solutions", "PostgreSQL"],
      bio: "Helps learners bridge the gap between development and cloud production deployments with zero downtime architectures.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      rating: 4.88,
    },
  ];

  faqsList: FaqItem[] = [
    {
      question: "What is TVK Technologies' 100% Placement Assurance Policy?",
      answer: "We provide structured placement support through our dedicated placement cell in Bangalore and Chennai. Students receive unlimited interview opportunities with our 160+ hiring partners until they receive an official offer letter. We also provide resume polishing, GitHub portfolio audits, and 1-on-1 technical mock interviews.",
      category: "Placements",
      isOpen: true,
    },
    {
      question: "I come from a Non-IT or Mechanical/Civil background. Can I join?",
      answer: "Absolutely! Over 45% of our successfully placed alumni transitioned from non-computer science streams or mechanical/civil degrees. Our curriculum starts from absolute zero fundamentals and progresses systematically to advanced enterprise design patterns.",
      category: "Eligibility",
      isOpen: false,
    },
    {
      question: "What are the batch timings and modes of training available?",
      answer: "We offer both Weekday (Monday to Friday, 2 hours/day + lab access) and Weekend (Saturday & Sunday, 4 hours/day) batches. You can choose In-Campus Classroom learning at our Bengaluru (BTM Layout) or Chennai (OMR) centers, or attend Live Interactive Online classes with full LMS access.",
      category: "Batches",
      isOpen: false,
    },
    {
      question: "How does the 0% No-Cost EMI payment scheme work?",
      answer: "We partner with leading education finance providers to offer 0% interest monthly installment options (3, 6, 9, or 12 months). You can begin your training with a small initial token fee and pay flexible monthly installments in Indian Rupees (₹ INR).",
      category: "Pricing & EMI",
      isOpen: false,
    },
    {
      question: "Will I work on real-time enterprise live projects?",
      answer: "Yes! Every candidate develops at least 2 production-grade capstone projects — an Enterprise Microservices E-Commerce Portal and a Reactive Real-time Analytics Dashboard with Docker containers and AWS deployment.",
      category: "Curriculum",
      isOpen: false,
    },
  ];

  courseSlides = [
    {
      id: "java-angular",
      title: "Java Full Stack with Angular",
      titlePrimary: "Java with Angular",
      titleConnector: "Full Stack",
      titleSecondary: "Program",
      subtitle: "Enterprise Application Architecture & Placement Track",
      badge: "Flagship Career Track",
      desc: "Master enterprise software development with Core Java 21, Spring Boot 3, RESTful Microservices, and Angular 18 SPA architecture.",
      duration: "12 Weeks (Weekday & Weekend)",
      batchStart: "New Batch Starting Monday",
      features: ["100% Placement Assurance", "Enterprise Capstone Project", "Technical Mock Interviews", "Classroom (BLR / MAA) & Hybrid"],
      tags: ["Core Java 21", "Spring Boot 3", "Microservices", "Angular 18", "Hibernate", "PostgreSQL"],
      iconType: "code",
      priceInr: "₹34,999",
      emiInr: "₹3,499/mo",
    },
    {
      id: "java-react",
      title: "Java Full Stack with React",
      titlePrimary: "Java Full Stack",
      titleConnector: "with",
      titleSecondary: "React",
      subtitle: "Full Stack Engineering & Cloud Architecture Track",
      badge: "High Demand Track",
      desc: "Build scalable cloud backends in Java & Spring Boot paired with reactive, high-performance React frontends and Redux Toolkit.",
      duration: "12 Weeks (Weekday & Weekend)",
      batchStart: "New Batch Starting Monday",
      features: ["100% Placement Assurance", "Microservices & Docker Labs", "React 18 & Next.js App Router", "CI/CD & AWS Deployment"],
      tags: ["Java 21", "Spring Boot", "React 18", "Redux", "Docker", "REST APIs"],
      iconType: "layers",
      priceInr: "₹34,999",
      emiInr: "₹3,499/mo",
    },
    {
      id: "angular-dev",
      title: "Angular Developer Specialist",
      titlePrimary: "Angular Developer",
      titleConnector: "Specialist",
      titleSecondary: "Track",
      subtitle: "Modern Frontend Engineering & Reactive State Architecture",
      badge: "Frontend Specialization",
      desc: "Develop complex single-page enterprise applications with TypeScript, RxJS streams, Angular Signals, and modern component design systems.",
      duration: "8 Weeks",
      batchStart: "Flexible Batches",
      features: ["Enterprise SPA Patterns", "Signals & Reactive Forms", "Tailwind CSS & Material UI", "Live Production Project"],
      tags: ["Angular 18", "TypeScript", "RxJS", "Signals", "Tailwind CSS", "HTML5/CSS3"],
      iconType: "frontend",
      priceInr: "₹24,999",
      emiInr: "₹2,499/mo",
    },
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.courses$.subscribe((courses) => {
        this.courses = courses;
      })
    );
    this.startAutoSlide();
    this.startAutoTestimonial();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    if (this.autoTestimonialInterval) {
      clearInterval(this.autoTestimonialInterval);
    }
    if (this.phaseTimeout) {
      clearTimeout(this.phaseTimeout);
    }
    if (this.quoteFadeTimeout) {
      clearTimeout(this.quoteFadeTimeout);
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // --- Phase Stepper Scrollytelling Methods ---
  selectPhase(index: number): void {
    if (this.activePhaseIndex === index) return;
    if (this.phaseTimeout) clearTimeout(this.phaseTimeout);
    
    // 150ms fade-out of current content, then 300ms fade+slide in
    this.isPhaseTransitioning = true;
    this.phaseTimeout = setTimeout(() => {
      this.activePhaseIndex = index;
      setTimeout(() => {
        this.isPhaseTransitioning = false;
      }, 50);
    }, 150);
  }

  // --- Testimonial Carousel Methods (translateX + Quote Crossfade) ---
  startAutoTestimonial(): void {
    if (typeof window !== "undefined") {
      this.autoTestimonialInterval = setInterval(() => {
        this.nextTestimonial();
      }, 7000);
    }
  }

  nextTestimonial(): void {
    this.triggerQuoteFade(() => {
      this.testimonialSlideIndex = (this.testimonialSlideIndex + 1) % this.alumniStories.length;
    });
  }

  prevTestimonial(): void {
    this.triggerQuoteFade(() => {
      this.testimonialSlideIndex = (this.testimonialSlideIndex - 1 + this.alumniStories.length) % this.alumniStories.length;
    });
  }

  goToTestimonial(index: number): void {
    if (this.testimonialSlideIndex === index) return;
    this.triggerQuoteFade(() => {
      this.testimonialSlideIndex = index;
    });
    if (this.autoTestimonialInterval) {
      clearInterval(this.autoTestimonialInterval);
      this.startAutoTestimonial();
    }
  }

  private triggerQuoteFade(updateFn: () => void): void {
    if (this.quoteFadeTimeout) clearTimeout(this.quoteFadeTimeout);
    this.isQuoteFading = true;
    updateFn();
    this.quoteFadeTimeout = setTimeout(() => {
      this.isQuoteFading = false;
    }, 250);
  }

  startAutoSlide(): void {
    if (typeof window !== "undefined") {
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }
  }

  nextSlide(): void {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.courseSlides.length;
  }

  prevSlide(): void {
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.courseSlides.length) % this.courseSlides.length;
  }

  goToSlide(index: number): void {
    this.activeSlideIndex = index;
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.startAutoSlide();
    }
  }

  // Filter courses on Home Tracks section
  get filteredCourses(): Course[] {
    if (this.activeTrackFilter === "all") return this.courses;
    if (this.activeTrackFilter === "fullstack") {
      return this.courses.filter((c) => (c.category || "").toLowerCase() === "full stack" || (c.title || "").toLowerCase().includes("full stack"));
    }
    if (this.activeTrackFilter === "backend") {
      return this.courses.filter((c) => (c.category || "").toLowerCase() === "backend" || (c.title || "").toLowerCase().includes("spring") || (c.title || "").toLowerCase().includes("cloud") || (c.title || "").toLowerCase().includes("devops") || (c.title || "").toLowerCase().includes("backend") || (c.title || "").toLowerCase().includes("java"));
    }
    if (this.activeTrackFilter === "frontend") {
      return this.courses.filter((c) => (c.category || "").toLowerCase() === "frontend" || (c.title || "").toLowerCase().includes("angular") || (c.title || "").toLowerCase().includes("react") || (c.title || "").toLowerCase().includes("frontend"));
    }
    if (this.activeTrackFilter === "cloud") {
      return this.courses.filter((c) => (c.title || "").toLowerCase().includes("cloud") || (c.title || "").toLowerCase().includes("devops") || (c.title || "").toLowerCase().includes("docker"));
    }
    return this.courses;
  }

  openSyllabusDrawer(course: Course): void {
    this.selectedSyllabusCourse = course;
  }

  closeSyllabusDrawer(): void {
    this.selectedSyllabusCourse = null;
  }

  toggleFaq(index: number): void {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  // Calculate Monthly EMI in Indian Rupees (₹ INR)
  get monthlyEmiAmount(): number {
    const loanPrincipal = Math.max(0, this.emiCoursePrice - this.emiDownPayment);
    if (this.emiTenureMonths <= 0) return 0;
    return Math.round(loanPrincipal / this.emiTenureMonths);
  }

  triggerApply(courseTitle?: string): void {
    this.dataService.triggerRegisterModal(courseTitle || "");
  }
}
