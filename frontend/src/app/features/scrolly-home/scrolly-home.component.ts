import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Lenis from 'lenis';

import { SCROLLY_CONFIG, isScrollyMotionPermitted } from './scrolly.config';
import { ScrollyIllustrationComponent } from './scrolly-illustrations.component';
import { DeviceMockupComponent } from './device-mockup.component';
import { ScrollLockService } from '../../core/services/scroll-lock.service';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-scrolly-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ScrollyIllustrationComponent,
    DeviceMockupComponent,
  ],
  templateUrl: './scrolly-home.component.html',
  styleUrls: ['./scrolly-home.component.css'],
})
export class ScrollyHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollyContainer') scrollyContainer!: ElementRef<HTMLElement>;
  @ViewChild('wrapperHero') wrapperHero!: ElementRef<HTMLElement>;
  @ViewChild('heroContent') heroContent!: ElementRef<HTMLElement>;
  @ViewChild('wrapperPillRoll') wrapperPillRoll!: ElementRef<HTMLElement>;
  @ViewChild('sceneAContent') sceneAContent!: ElementRef<HTMLElement>;
  @ViewChild('wrapperDarkPanel') wrapperDarkPanel!: ElementRef<HTMLElement>;
  @ViewChild('wrapperStepSwap') wrapperStepSwap!: ElementRef<HTMLElement>;

  @ViewChild('pillRollTrack') pillRollTrack!: ElementRef<HTMLElement>;
  @ViewChild('darkPanelBox') darkPanelBox!: ElementRef<HTMLElement>;
  @ViewChild('stepLeftContent') stepLeftContent!: ElementRef<HTMLElement>;
  @ViewChild('stepStageCard') stepStageCard!: ElementRef<HTMLElement>;

  private lenis?: Lenis;
  private rafId?: number;
  private failSafeTimer?: any;
  public motionInitialized = false;
  public motionReady = false;

  // Debug HUD State (?debug=1)
  public isDebugMode = false;
  public currentScrollY = 0;
  public totalPageHeight = 0;
  public progressPillRoll = 0;
  public progressDarkPanel = 0;
  public progressStepSwap = 0;

  // Scene C: Step Swap State
  activeStepIndex = 0;
  stepProgressPercent = 0;

  // 4 Steps Data with Exact Pastel Themes
  stepsData = [
    {
      stepNum: '01',
      tag: 'TRAINING',
      title: 'Learn job-ready enterprise stacks',
      desc: 'Master Core Java 21, Spring Boot 3 microservices, Angular 18, React 18, and PostgreSQL from scratch with active enterprise software architects.',
      points: ['Virtual Threads & Reactive Architecture', 'RESTful API & Distributed Microservices', 'Hands-on Coding Labs with Mentor Reviews'],
      badge: 'Job-Ready Curriculum',
      stageClass: 'step-stage-0',
      tagColor: 'bg-[#5B3DF5]/15 text-[#5B3DF5] dark:text-[#A855F7] border-[#5B3DF5]/30',
      accentColor: '#5B3DF5',
    },
    {
      stepNum: '02',
      tag: 'PROJECTS',
      title: 'Build real enterprise projects',
      desc: 'Architect high-concurrency microservices, Docker container deployments, Kafka event queues, and reactive SPAs built for real enterprise workloads.',
      points: ['Distributed Order Dispatch Microservices', 'JWT Auth & Spring Security 6.2 Architecture', 'Docker Multi-Stage Builds & AWS Cloud Pipelines'],
      badge: 'Live Production Labs',
      stageClass: 'step-stage-1',
      tagColor: 'bg-[#EC4899]/15 text-[#EC4899] dark:text-pink-300 border-[#EC4899]/30',
      accentColor: '#EC4899',
    },
    {
      stepNum: '03',
      tag: 'PLACEMENT',
      title: 'Interview prep & direct company calls',
      desc: 'Rigorous weekly 1-on-1 technical mock drills covering live coding assessments, system design, and direct interview scheduling with 160+ hiring partners.',
      points: ['Live System Design & Concurrency Rounds', 'DSA Sliding Window, Trees & Graphs Drills', '1-on-1 Feedback & Confidence Coaching'],
      badge: '1-on-1 Mentorship',
      stageClass: 'step-stage-2',
      tagColor: 'bg-[#D97706]/15 text-[#D97706] dark:text-amber-300 border-[#D97706]/30',
      accentColor: '#D97706',
    },
    {
      stepNum: '04',
      tag: 'CAREER',
      title: 'Land your first high-paying role',
      desc: 'Step into high-paying software roles across Bangalore & Chennai. Our dedicated placement cell supports you until your official offer letter is in hand.',
      points: ['Uncapped Placement Drives Across 160+ Partners', 'Average CTC ₹8.4 LPA • Highest CTC ₹24.5 LPA', 'Official Offer Letter & Alumni Network Access'],
      badge: '100% Placement Assured',
      stageClass: 'step-stage-3',
      tagColor: 'bg-[#0284C7]/15 text-[#0284C7] dark:text-sky-300 border-[#0284C7]/30',
      accentColor: '#0284C7',
    },
  ];

  // Scene A: Tech Matrix Pills
  pillRollStack = [
    { title: 'Java 21 Enterprise', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg', tag: 'Core' },
    { title: 'Spring Boot 3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg', tag: 'Cloud API' },
    { title: 'Angular 18 SPA', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg', tag: 'Frontend' },
    { title: 'React 18 & Next', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', tag: 'UI Library' },
    { title: 'PostgreSQL ACID', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg', tag: 'Database' },
    { title: 'Docker Containers', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', tag: 'DevOps' },
    { title: 'AWS Cloud Services', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', tag: 'Infra' },
    { title: 'Git & GitHub CI/CD', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', tag: 'Pipelines' },
  ];

  // Scene B: Feature Bento Cards
  featureCards = [
    {
      title: 'Dedicated Placement Assistance',
      desc: 'Direct interview scheduling with 160+ hiring partner companies across Bangalore and Chennai until you secure an official offer letter.',
      icon: '🎯',
      badge: 'Uncapped Drives',
      highlight: '160+ Partners',
    },
    {
      title: 'Live Enterprise Projects',
      desc: 'Architect production-grade distributed microservices, Docker containers, and high-throughput reactive user interfaces from day one.',
      icon: '⚡',
      badge: 'Capstone Labs',
      highlight: 'Production Ready',
    },
    {
      title: 'Veteran Tech Mentors',
      desc: 'Master real production patterns directly from Staff Engineers and Principal Architects who build large-scale systems daily.',
      icon: '🧠',
      badge: '10+ Yrs Exp',
      highlight: 'Ex-Tech Leads',
    },
    {
      title: '1-on-1 Mock Interviews',
      desc: 'Weekly 1-on-1 technical mock drills covering live coding challenges, system design architecture, and behavioral rounds.',
      icon: '💼',
      badge: 'Confidence Drills',
      highlight: 'Weekly Drills',
    },
    {
      title: 'Resume & GitHub Optimization',
      desc: 'ATS-optimized resume engineering and GitHub portfolio reviews that guarantee attention from engineering hiring managers.',
      icon: '✨',
      badge: 'Profile Polish',
      highlight: 'ATS Compliant',
    },
    {
      title: 'Dual-Hub Campus Access',
      desc: 'High-speed coding labs and in-person mentorship at our prime hubs: BTM Layout Bangalore and OMR IT Expressway Chennai.',
      icon: '🏢',
      badge: 'BLR & MAA Hubs',
      highlight: 'Classroom & Labs',
    },
  ];
  activeFeatureIndex = 0;

  // Scene D: Testimonials
  testimonials = [
    {
      name: 'Sneha Varadharajan',
      role: 'Full Stack Java Engineer',
      company: 'Amazon Web Services',
      package: '₹14.2 LPA',
      campus: 'Bangalore (BTM Hub)',
      quote: 'TVK Technologies completely redefined my career trajectory. The hands-on Spring Boot microservices labs and dedicated mock interviews helped me clear AWS on my first attempt!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Karthik Subramanian',
      role: 'Senior Angular Frontend Engineer',
      company: 'Cognizant Digital',
      package: '₹9.8 LPA',
      campus: 'Chennai (OMR Hub)',
      quote: 'The faculty at TVK are working software architects. They taught us real reactive state architecture and unit testing that actual corporate teams use daily.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Pooja Venkatesh',
      role: 'Backend Spring Boot Specialist',
      company: 'Oracle Cloud Infrastructure',
      package: '₹12.5 LPA',
      campus: 'Bangalore (BTM Hub)',
      quote: 'From zero backend knowledge to designing distributed systems with Kafka and Docker. TVK arranged 5 interviews within 2 weeks of course completion!',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    },
  ];
  activeTestimonialIndex = 0;

  // Scene E: FAQ List
  faqs: FaqItem[] = [
    {
      question: "What is TVK Technologies' 100% Placement Assurance Policy?",
      answer: "We provide structured placement support through our dedicated placement cells in Bangalore and Chennai. Students receive unlimited interview opportunities with our 160+ hiring partners until they receive an official offer letter. We also provide resume polishing, GitHub portfolio audits, and 1-on-1 technical mock interviews.",
      category: "Placements",
      isOpen: true,
    },
    {
      question: "I come from a Non-IT or Mechanical/Civil background. Can I join?",
      answer: "Over 45% of our successfully placed alumni transitioned from non-computer science streams or mechanical/civil degrees. Our curriculum starts from absolute zero fundamentals and progresses systematically to advanced enterprise design patterns.",
      category: "Eligibility",
      isOpen: false,
    },
    {
      question: "What are the batch timings and modes of training available?",
      answer: "We offer both Weekday (Monday to Friday, 2 hours/day + lab access) and Weekend (Saturday & Sunday, 4 hours/day) batches. You can choose In-Campus Classroom learning at our Bengaluru (BTM Layout) or Chennai (OMR) centers, or attend Live Interactive Online classes.",
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

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private scrollLockService: ScrollLockService
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isDebugMode = window.location.search.includes('debug=1');
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Re-evaluate scene progress on scroll unlock
      window.addEventListener('tvk-scroll-lock', (e: any) => {
        if (!e.detail?.locked) {
          this.computeSceneProgress();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (!isScrollyMotionPermitted()) {
      return;
    }

    // Fail-safe: if animations have not initialised within 2.5s, remove motion-ready
    this.failSafeTimer = setTimeout(() => {
      if (!this.motionInitialized && typeof document !== 'undefined') {
        document.documentElement.classList.remove('motion-ready');
        console.warn('[TVK SCROLLY] Fail-safe triggered: motion not initialized within 2.5s. Falling back to static layout.');
      }
    }, 2500);

    try {
      this.initSmoothScroll();
      this.startStickyProgressLoop();

      // Successfully initialized: add motion-ready class
      this.motionInitialized = true;
      this.motionReady = true;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('motion-ready');

        // Immediately compute frame on fonts ready and image load (never wait for first user scroll)
        if (document.fonts?.ready) {
          document.fonts.ready.then(() => {
            this.computeSceneProgress();
          });
        }
        window.addEventListener('load', () => {
          this.computeSceneProgress();
        }, { once: true, passive: true });
      }
      this.cdr.detectChanges();
    } catch (e) {
      console.error('[TVK SCROLLY] Motion initialization error:', e);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('motion-ready');
      }
    }
  }

  private initSmoothScroll(): void {
    try {
      this.lenis = new Lenis({
        duration: SCROLLY_CONFIG.lenis.duration,
        lerp: SCROLLY_CONFIG.lenis.lerp,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: SCROLLY_CONFIG.lenis.wheelMultiplier,
        touchMultiplier: SCROLLY_CONFIG.lenis.touchMultiplier,
      });
      this.scrollLockService.registerLenis(this.lenis);
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize:', e);
    }
  }

  /**
   * High-Performance Single RAF Loop Computing CSS Sticky Progress Clamped 0..1
   * Paused when modal is open to freeze background animations.
   */
  private startStickyProgressLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const updateFrame = (time: number) => {
        if (!this.scrollLockService.isLocked()) {
          this.lenis?.raf(time);
          this.computeSceneProgress();
        }
        this.rafId = requestAnimationFrame(updateFrame);
      };
      this.rafId = requestAnimationFrame(updateFrame);
    });
  }

  private computeSceneProgress(): void {
    if (typeof window === 'undefined') return;

    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    // 0. Hero hand-off: Smooth natural visibility
    const wrapperHeroEl = this.wrapperHero?.nativeElement;
    const heroContentEl = this.heroContent?.nativeElement;
    if (wrapperHeroEl && heroContentEl) {
      const rectHero = wrapperHeroEl.getBoundingClientRect();
      const heroHeight = wrapperHeroEl.offsetHeight || vh;
      const heroProgress = Math.max(0, Math.min(1, -rectHero.top / heroHeight));
      if (heroProgress <= 0.85) {
        heroContentEl.style.opacity = '1';
        heroContentEl.style.transform = 'translateY(0px)';
      } else {
        const t = (heroProgress - 0.85) / 0.15;
        const opacity = Math.max(0, 1 - t * 0.4);
        heroContentEl.style.opacity = opacity.toFixed(3);
        heroContentEl.style.transform = `translateY(${(-16 * t).toFixed(1)}px)`;
      }
    }

    // 1. Scene A: Pill Roll Progress
    const wrapperA = this.wrapperPillRoll?.nativeElement;
    const sceneAContentEl = this.sceneAContent?.nativeElement;
    if (wrapperA) {
      const rectA = wrapperA.getBoundingClientRect();
      const maxScrollA = wrapperA.offsetHeight - vh;
      const progressA = maxScrollA > 0 ? Math.max(0, Math.min(1, -rectA.top / maxScrollA)) : 0;
      this.progressPillRoll = progressA;
      this.renderPillRoll(progressA);

      if (sceneAContentEl) {
        if (rectA.top > vh) {
          sceneAContentEl.style.opacity = '0';
        } else if (rectA.top > 0) {
          // Entering viewport smoothly as user scrolls past hero
          const enterProgress = Math.max(0, 1 - (rectA.top / vh));
          sceneAContentEl.style.opacity = Math.min(1, enterProgress * 1.5).toFixed(3);
        } else if (progressA <= 0.85) {
          // Holding range: fully visible at opacity 1
          sceneAContentEl.style.opacity = '1';
        } else {
          // Leaving: soft fade
          const t = (progressA - 0.85) / 0.15;
          sceneAContentEl.style.opacity = (1 - 0.25 * t).toFixed(3);
        }
      }
    }

    // 2. Scene B: Dark Panel Progress
    const wrapperB = this.wrapperDarkPanel?.nativeElement;
    if (wrapperB) {
      const rectB = wrapperB.getBoundingClientRect();
      const maxScrollB = wrapperB.offsetHeight - vh;
      const progressB = maxScrollB > 0 ? Math.max(0, Math.min(1, -rectB.top / maxScrollB)) : 0;
      this.progressDarkPanel = progressB;
      this.renderDarkPanel(progressB);
    }

    // 3. Scene C: Step Swap Progress
    const wrapperC = this.wrapperStepSwap?.nativeElement;
    if (wrapperC) {
      const rectC = wrapperC.getBoundingClientRect();
      const maxScrollC = wrapperC.offsetHeight - vh;
      const progressC = maxScrollC > 0 ? Math.max(0, Math.min(1, -rectC.top / maxScrollC)) : 0;
      this.progressStepSwap = progressC;
      this.renderStepSwap(progressC);
    }

    // 4. Background Color Scrub (light mode interpolation)
    const isDark =
      typeof document !== 'undefined' &&
      (document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark'));

    if (!isDark && this.scrollyContainer?.nativeElement) {
      if (this.progressDarkPanel > 0 && this.progressDarkPanel < 1) {
        this.scrollyContainer.nativeElement.style.backgroundColor = '#0E0B24';
      } else {
        this.scrollyContainer.nativeElement.style.backgroundColor = '#F5F3EE';
      }
    }

    // Update Debug HUD if active
    if (this.isDebugMode) {
      this.currentScrollY = Math.round(scrollY);
      this.totalPageHeight = document.documentElement.scrollHeight;
    }
  }

  /**
   * Scene A: Pill Roll Progress Renderer
   * Continuous interpolation: index = progress * (n - 1)
   * Active = opacity 1 / scale 1.05; neighbours = 0.85 / 0.98; far ones = 0.55 / 0.92
   */
  private renderPillRoll(progress: number): void {
    if (!this.pillRollTrack?.nativeElement) return;

    const n = this.pillRollStack.length; // 8
    const activeFloatIndex = progress * (n - 1);

    // Translate track so active pill stays vertically centered
    const itemHeight = 70;
    const trackY = (n - 1) * itemHeight * 0.35 - activeFloatIndex * itemHeight;
    this.pillRollTrack.nativeElement.style.transform = `translateY(${trackY.toFixed(1)}px)`;

    // Interpolate opacity and scale without thresholds
    const children = this.pillRollTrack.nativeElement.children;
    for (let i = 0; i < children.length; i++) {
      const pillEl = children[i] as HTMLElement;
      const dist = Math.abs(i - activeFloatIndex);
      let opacity = 0.55;
      let scale = 0.92;

      if (dist <= 1.0) {
        opacity = 1.0 - dist * (1.0 - 0.85);
        scale = 1.05 - dist * (1.05 - 0.98);
      } else if (dist <= 2.0) {
        const t = dist - 1.0;
        opacity = 0.85 - t * (0.85 - 0.55);
        scale = 0.98 - t * (0.98 - 0.92);
      } else {
        opacity = 0.55;
        scale = 0.92;
      }

      pillEl.style.opacity = opacity.toFixed(3);
      pillEl.style.transform = `scale(${scale.toFixed(3)})`;
    }
  }

  /**
   * Scene B: Dark Panel Progress Renderer
   * Scale 0.92→1 on entry (0–0.20)
   * Stay fully visible at scale 1 for middle 60% (0.20–0.80)
   * Soft shrink 1→0.94 on exit (0.80–1.00)
   */
  private renderDarkPanel(progress: number): void {
    if (!this.darkPanelBox?.nativeElement) return;

    let scale = 1;
    let opacity = 1;

    if (progress < 0.20) {
      // Entering: 0 to 0.20
      const t = progress / 0.20;
      scale = 0.92 + 0.08 * t;
      opacity = 0.85 + 0.15 * t;
    } else if (progress <= 0.80) {
      // Middle 60% holding: fully visible, scale 1, opacity 1
      scale = 1.0;
      opacity = 1.0;
    } else {
      // Leaving: 0.80 to 1.00
      const t = (progress - 0.80) / 0.20;
      scale = 1.0 - 0.06 * t;
      opacity = 1.0 - 0.15 * t;
    }

    this.darkPanelBox.nativeElement.style.transform = `scale(${scale.toFixed(4)})`;
    this.darkPanelBox.nativeElement.style.opacity = `${opacity.toFixed(3)}`;
  }

  /**
   * Scene C: Step Swap Progress Renderer
   * 4 phases mapped: 0–.25, .25–.5, .5–.75, .75–1
   */
  private renderStepSwap(progress: number): void {
    const rawStep = Math.min(3, Math.floor(progress * 4));
    this.stepProgressPercent = Math.round(progress * 100);

    if (this.activeStepIndex !== rawStep) {
      this.ngZone.run(() => {
        this.activeStepIndex = rawStep;
        this.cdr.detectChanges();
      });
    }
  }

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  nextTestimonial(): void {
    this.activeTestimonialIndex = (this.activeTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.activeTestimonialIndex =
      (this.activeTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  get visibleFeatureCards(): any[] {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const idx = (this.activeFeatureIndex + i) % this.featureCards.length;
      cards.push(this.featureCards[idx]);
    }
    return cards;
  }

  nextFeature(): void {
    this.activeFeatureIndex = (this.activeFeatureIndex + 1) % this.featureCards.length;
  }

  prevFeature(): void {
    this.activeFeatureIndex =
      (this.activeFeatureIndex - 1 + this.featureCards.length) % this.featureCards.length;
  }

  openDemoModal(): void {
    const event = new CustomEvent('open-reg-modal');
    window.dispatchEvent(event);
  }

  openLoginModal(): void {
    const event = new CustomEvent('open-login-modal');
    window.dispatchEvent(event);
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.failSafeTimer) {
      clearTimeout(this.failSafeTimer);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('motion-ready');
    }
    this.lenis?.destroy();
  }
}
