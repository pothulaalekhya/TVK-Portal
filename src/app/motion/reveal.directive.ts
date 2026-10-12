import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
  Inject,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { isMotionPermitted, MOTION_CONFIG } from "./motion.config";

@Directive({
  selector: "[appScrollReveal], [motionReveal]",
  standalone: true,
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input("appScrollReveal") set aliasScrollReveal(val: string) {
    if (val && ["fade-up", "slide-right", "slide-left", "scale", "fade"].includes(val)) {
      this.animationType = val as any;
    }
  }
  @Input("motionReveal") set aliasMotionReveal(val: string) {
    if (val && ["fade-up", "slide-right", "slide-left", "scale", "fade"].includes(val)) {
      this.animationType = val as any;
    }
  }

  @Input() animationType: "fade-up" | "slide-right" | "slide-left" | "scale" | "fade" = "fade-up";
  @Input() motionDelay = 0;
  @Input() delay = 0;
  @Input() motionStaggerIndex = 0;
  @Input() staggerIndex = 0;
  @Input() staggerDelay = 85;
  @Input() motionThreshold = 0.12;
  @Input() threshold = 0.12;

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const host = this.el.nativeElement;

    if (!isPlatformBrowser(this.platformId) || !isMotionPermitted()) {
      // If motion is disabled or SSR, show element directly without animation
      this.renderer.addClass(host, "is-revealed");
      return;
    }

    // Apply base class based on animation type
    if (this.animationType === "slide-right") {
      this.renderer.addClass(host, "motion-reveal-slide-right");
    } else if (this.animationType === "slide-left") {
      this.renderer.addClass(host, "motion-reveal-slide-left");
    } else if (this.animationType === "scale") {
      this.renderer.addClass(host, "motion-tech-tile");
    } else if (this.animationType === "fade") {
      this.renderer.addClass(host, "motion-reveal-fade");
    } else {
      this.renderer.addClass(host, "motion-reveal");
    }

    // Calculate delay (stagger or explicit delay)
    const effectiveIndex = this.staggerIndex || this.motionStaggerIndex || 0;
    const effectiveStagger = this.staggerDelay || MOTION_CONFIG.staggers.featureCards || 85;
    const effectiveDelay = (this.delay || this.motionDelay || 0) + (effectiveIndex * effectiveStagger);

    if (effectiveDelay > 0) {
      this.renderer.setStyle(host, "transition-delay", `${effectiveDelay}ms`);
    }

    // Set up IntersectionObserver
    const effectiveThreshold = this.threshold || this.motionThreshold || 0.12;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(host, "is-revealed");
            // Reveal once, then stop observing
            if (this.observer) {
              this.observer.unobserve(host);
            }
          }
        });
      },
      {
        threshold: effectiveThreshold,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}
