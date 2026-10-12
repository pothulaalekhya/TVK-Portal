import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  NgZone,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { isMotionPermitted } from "./motion.config";

@Directive({
  selector: "[motionFlipGrid]",
  standalone: true,
})
export class FlipGridDirective implements AfterViewInit, OnDestroy {
  private mutationObserver?: MutationObserver;
  private previousRects = new Map<HTMLElement, DOMRect>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !isMotionPermitted()) return;

    this.zone.runOutsideAngular(() => {
      this.recordPositions();

      this.mutationObserver = new MutationObserver(() => {
        this.animateFlip();
      });

      this.mutationObserver.observe(this.el.nativeElement, {
        childList: true,
        subtree: false,
      });
    });
  }

  private recordPositions(): void {
    const children = Array.from(this.el.nativeElement.children) as HTMLElement[];
    this.previousRects.clear();
    for (const child of children) {
      this.previousRects.set(child, child.getBoundingClientRect());
    }
  }

  private animateFlip(): void {
    const children = Array.from(this.el.nativeElement.children) as HTMLElement[];

    // Calculate deltas
    children.forEach((child) => {
      const first = this.previousRects.get(child);
      const last = child.getBoundingClientRect();

      if (first) {
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;

        if (deltaX !== 0 || deltaY !== 0) {
          // Invert: position element at previous location instantly
          child.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
          child.style.transition = "transform 0s";

          // Play: animate to final position in next animation frame
          requestAnimationFrame(() => {
            child.style.transition = "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)";
            child.style.transform = "translate3d(0, 0, 0)";

            const cleanup = () => {
              child.style.transition = "";
              child.style.transform = "";
              child.removeEventListener("transitionend", cleanup);
            };
            child.addEventListener("transitionend", cleanup, { once: true });
          });
        }
      } else {
        // Newly added card fades and scales in
        child.style.opacity = "0";
        child.style.transform = "scale(0.95)";
        child.style.transition = "opacity 250ms ease, transform 250ms ease";

        requestAnimationFrame(() => {
          child.style.opacity = "1";
          child.style.transform = "scale(1)";
        });
      }
    });

    // Update positions for next mutation
    this.recordPositions();
  }

  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
    this.previousRects.clear();
  }
}
