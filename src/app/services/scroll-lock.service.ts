import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Lenis from 'lenis';

@Injectable({
  providedIn: 'root'
})
export class ScrollLockService {
  private openModalCount = 0;
  private savedScrollY = 0;
  private savedPaddingRight = '';
  private activeLenis?: Lenis;
  private openerElement: HTMLElement | null = null;

  public isLocked$ = new BehaviorSubject<boolean>(false);

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined') {
      // Global ESC key listener to dispatch modal close event
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.openModalCount > 0) {
          window.dispatchEvent(new CustomEvent('tvk-modal-esc'));
        }
      });

      // Prevent wheel bubbling to background page if modal is open
      window.addEventListener('wheel', (e) => {
        if (this.openModalCount > 0) {
          const target = e.target as HTMLElement | null;
          // If event occurred inside a modal dialog or lenis-prevent container, allow scrolling the modal
          if (target && target.closest('[role="dialog"], .modal, [data-lenis-prevent], .motion-modal-dialog, .modal-form-scrollable, form')) {
            return;
          }
          // Outside the dialog (backdrop / overlay): prevent wheel propagation to page
          e.preventDefault();
        }
      }, { passive: false });
    }
  }

  public registerLenis(lenis: Lenis): void {
    this.activeLenis = lenis;
  }

  public unregisterLenis(): void {
    this.activeLenis = undefined;
  }

  public lock(opener?: HTMLElement): void {
    if (typeof document === 'undefined') return;

    this.openModalCount++;
    if (opener) {
      this.openerElement = opener;
    } else if (document.activeElement instanceof HTMLElement) {
      this.openerElement = document.activeElement;
    }

    if (this.openModalCount === 1) {
      // 1. Save scroll position
      this.savedScrollY = Math.round(window.scrollY || window.pageYOffset || 0);

      // 2. Prevent layout shift from scrollbar disappearing
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        this.savedPaddingRight = document.body.style.paddingRight;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // 3. Stop smooth scroll (Lenis)
      try {
        this.activeLenis?.stop();
      } catch (e) {
        console.warn('Error stopping Lenis:', e);
      }

      // 4. Lock page scroll with html class + iOS fixed body technique
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked');

      const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
      if (isIOS) {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.savedScrollY}px`;
        document.body.style.width = '100%';
      }

      // 5. Pause animations & rAF scroll loop
      this.isLocked$.next(true);
      window.dispatchEvent(new CustomEvent('tvk-scroll-lock', { detail: { locked: true } }));
    }
  }

  public unlock(): void {
    if (typeof document === 'undefined') return;

    this.openModalCount = Math.max(0, this.openModalCount - 1);

    if (this.openModalCount === 0) {
      // 1. Remove scroll-locked classes and reset body fixed styles
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
      document.body.style.paddingRight = this.savedPaddingRight;

      // 2. Restore exact previous scroll position
      window.scrollTo(0, this.savedScrollY);

      // 3. Restart Lenis and sync position
      try {
        this.activeLenis?.start();
        this.activeLenis?.scrollTo(this.savedScrollY, { immediate: true });
      } catch (e) {
        console.warn('Error starting Lenis:', e);
      }

      // 4. Resume animations & rAF loop
      this.isLocked$.next(false);
      window.dispatchEvent(new CustomEvent('tvk-scroll-lock', { detail: { locked: false, savedScrollY: this.savedScrollY } }));

      // 5. Return focus to opener element
      if (this.openerElement && typeof this.openerElement.focus === 'function') {
        this.openerElement.focus();
        this.openerElement = null;
      }
    }
  }

  public isLocked(): boolean {
    return this.openModalCount > 0;
  }
}
