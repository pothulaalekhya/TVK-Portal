import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { DataService } from "../../services/data.service";
import { Course } from "../../models/models";
import { Subscription } from "rxjs";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  stats = {
    students: 0,
    trainers: 0,
    courses: 0,
    totalEnrollments: 0,
  };

  timeLeft = { hours: 14, minutes: 32, seconds: 45 };
  private timerInterval: any;
  private subscriptions: Subscription[] = [];

  benefits = [
    {
      title: "Industry-Oriented Training",
      desc: "Curriculum reviewed and crafted by working software engineers.",
    },
    {
      title: "Real-Time Live Projects",
      desc: "Collaborate on full-stack systems mimicking corporate deployment environments.",
    },
    {
      title: "Expert Trainer Support",
      desc: "Interactive lectures guided by certified specialists.",
    },
    {
      title: "Resume Building Assistance",
      desc: "Optimizing code profiles, projects presentation, and GitHub layout.",
    },
    {
      title: "Mock Interview Preparation",
      desc: "Rigorous technical reviews and soft skills training.",
    },
    {
      title: "100% Placement Support",
      desc: "Dedicated connector cell matching resumes to tech agencies.",
    },
  ];

  technologies = [
    { title: "Core Java", desc: "OOPs, Collections Framework, Multithreading", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    {
      title: "Spring Boot",
      desc: "REST APIs, Dependency Injections, Actuator",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg"
    },
    {
      title: "Angular",
      desc: "Standalone architecture, RxJS streams, Reactive validation",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg"
    },
    {
      title: "Microservices",
      desc: "API Gateways, Load Balancing, Service Registries",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg"
    },
    {
      title: "SQL Database",
      desc: "Relational design, subqueries, normalization",
      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg"
    },
    { title: "REST APIs", desc: "Postman API testing, Git revision cycles", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg" },
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.dataService.courses$.subscribe((courses) => {
        this.courses = courses;
      }),
      this.dataService.stats$.subscribe((stats) => {
        this.stats = stats;
      })
    );

    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private startCountdown(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft.seconds > 0) {
        this.timeLeft.seconds--;
      } else if (this.timeLeft.minutes > 0) {
        this.timeLeft.minutes--;
        this.timeLeft.seconds = 59;
      } else if (this.timeLeft.hours > 0) {
        this.timeLeft.hours--;
        this.timeLeft.minutes = 59;
        this.timeLeft.seconds = 59;
      } else {
        this.timeLeft = { hours: 24, minutes: 0, seconds: 0 };
      }
    }, 1000);
  }

  getCapacityPercentage(): number {
    const totalCapacity = this.getTotalCapacity();
    const seatsBooked = this.stats.totalEnrollments + 23;
    return Math.min(95, Math.floor((seatsBooked / (totalCapacity + 30)) * 100));
  }

  getTotalCapacity(): number {
    return this.courses.reduce((sum, c) => sum + c.capacity, 0);
  }

  getSeatsBooked(): number {
    return this.stats.totalEnrollments + 23;
  }

  getTotalCapacityPlusPadding(): number {
    return this.getTotalCapacity() + 30;
  }
}
