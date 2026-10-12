import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
  Inject,
  PLATFORM_ID,
  NgZone,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { isMotionPermitted, isMobileViewport } from "./motion.config";

@Directive({
  selector: "[motionHeroHandoff]",
  standalone: true,
})
export class HeroHandoffDirective implements OnInit, OnDestroy {
  private scrollListener?: () => void;
  private ticking = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || !isMotionPermitted() || isMobileViewport()) {
      return;
    }

    const host = this.el.nativeElement;
    this.renderer.addClass(host, "motion-hero-handoff");

    // Passive scroll listener outside Angular zone to avoid triggering change detection
    this.zone.runOutsideAngular(() => {
      const onScroll = () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.updateHandoff();
            this.ticking = false;
          });
          this.ticking = true;
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      this.scrollListener = () => window.removeEventListener("scroll", onScroll);
    });
  }

  private updateHandoff(): void {
    const scrollY = window.scrollY;
    // Only scrub during first 400px of scroll
    if (scrollY > 500) return;

    const progress = Math.min(scrollY / 400, 1);
    // Subtle upward drift: 0 to -24px; subtle opacity fade: 1 to 0.75
    const driftY = -1 * progress * 24;
    const opacity = 1 - progress * 0.25;

    this.renderer.setStyle(this.el.nativeElement, "transform", `translate3d(0, ${driftY}px, 0)`);
    this.renderer.setStyle(this.el.nativeElement, "opacity", `${opacity}`);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
  }
}
