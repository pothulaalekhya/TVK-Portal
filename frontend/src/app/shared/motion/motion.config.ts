/**
 * TVK Technologies - Motion & Animation Configuration
 * Single source of truth for all animation parameters.
 * Setting ENABLE_MOTION to false immediately disables all motion effects globally.
 */

export const ENABLE_MOTION = true;

export const MOTION_CONFIG = {
  // Global feature flag
  enabled: ENABLE_MOTION,

  // Durations in milliseconds (3-Tier Standard: Micro 150ms, Standard 300ms, Section 550ms)
  durations: {
    micro: 150,
    standard: 300,
    section: 550,
    heroEntrance: 750,
    sectionReveal: 550,
    cardStagger: 85,
    carouselSlide: 400,
    phaseTextOut: 150,
    phaseTextIn: 300,
    modalEnter: 250,
    modalExit: 150,
    darkModeToggle: 200,
    flipTransition: 300,
    faqAccordion: 300,
  },

  // Easing curves (GPU accelerated - Standard Ease-Out-Expo: cubic-bezier(0.22, 1, 0.36, 1))
  easings: {
    expoOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
    standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    micro: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  // Distances (px) - translateY 24px per requirements
  distances: {
    desktopY: 24,
    mobileY: 16,
    desktopX: 32,
    mobileX: 16,
    routeShiftY: 12,
    hoverLiftY: -4,
    floatY: 4,
  },

  // Stagger intervals (ms)
  staggers: {
    heroCta: 90,
    featureCards: 85,
    techStack: 60,
    statCards: 85,
    phaseSteps: 90,
    testimonials: 85,
    footerCols: 80,
  },

  // Viewport thresholds for IntersectionObserver
  thresholds: {
    section: 0.12,
    card: 0.1,
    headerScrollOffset: 8,
  },
};

/**
 * Checks whether motion is currently permitted:
 * Must be browser environment, feature flag ENABLE_MOTION must be true,
 * and user must NOT prefer reduced motion.
 */
export function isMotionPermitted(): boolean {
  if (!ENABLE_MOTION) return false;
  if (typeof window === 'undefined') return false;
  try {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReduced;
  } catch (e) {
    return true;
  }
}

/**
 * Helper to determine if current viewport is mobile (<768px)
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
