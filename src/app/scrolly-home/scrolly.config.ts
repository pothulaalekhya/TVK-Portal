/**
 * Scrollytelling Configuration & Theme System for TVK Technologies
 * Exact Color Palette:
 * --bg #F5F3EE, --ink #14121F, --brand #5B3DF5, --brand-2 #8B5CF6,
 * pastels: lavender #E4DBFF, blush #FFD9E6, mint #D5F5E3, peach #FFE3CC, sky #D6ECFF
 * dark panels: #0E0B24 with purple radial glow
 * accent gradient: linear-gradient(135deg, #5B3DF5, #A855F7, #EC4899)
 */
export const SCROLLY_CONFIG = {
  // Global feature flag: toggle to instantly revert to classic Home
  HOME_SCROLLY: true,

  // Lenis ultra-smooth scroll configuration (lerp 0.12, syncTouch false, wheelMultiplier 1)
  lenis: {
    duration: 1.0,
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
  },

  // Pin lengths strictly between 100% and 300% viewport height (NO DEAD SPACE)
  pins: {
    pillRoll: '+=140%',        // Scene A: Pill Roll (~140% viewport)
    darkPanel: '+=140%',       // Scene B: Inset Dark Panel pinned (~140% viewport)
    pinnedStepSwap: '+=120%',  // Scene C: 4-Phase Step Swap (~120% viewport)
  },

  // Exact Requested Color Palette
  colors: {
    bg: '#F5F3EE',
    ink: '#14121F',
    brand: '#5B3DF5',
    brand2: '#8B5CF6',
    lavender: '#E4DBFF',
    blush: '#FFD9E6',
    mint: '#D5F5E3',
    peach: '#FFE3CC',
    sky: '#D6ECFF',
    darkPanel: '#0E0B24',
    accentGradient: 'linear-gradient(135deg, #5B3DF5 0%, #A855F7 50%, #EC4899 100%)',
  },

  // 4 Step Colors for Scene C
  stepColors: [
    {
      name: 'lavender',
      tag: '01 • TRAINING',
      lightBg: '#E4DBFF',
      darkBg: '#231942',
      lightBorder: '#C8B6FF',
      darkBorder: '#5E4B8B',
      accent: '#5B3DF5',
    },
    {
      name: 'blush',
      tag: '02 • PROJECTS',
      lightBg: '#FFD9E6',
      darkBg: '#3D1322',
      lightBorder: '#FFB3CC',
      darkBorder: '#7A2242',
      accent: '#EC4899',
    },
    {
      name: 'peach',
      tag: '03 • PLACEMENT',
      lightBg: '#FFE3CC',
      darkBg: '#3B210B',
      lightBorder: '#FFC899',
      darkBorder: '#754015',
      accent: '#D97706',
    },
    {
      name: 'sky',
      tag: '04 • CAREER',
      lightBg: '#D6ECFF',
      darkBg: '#0F2942',
      lightBorder: '#A8D7FF',
      darkBorder: '#1E5285',
      accent: '#0284C7',
    },
  ],

  motion: {
    scrubSmoothness: 0.8,
  },
};

export function isScrollyMotionPermitted(): boolean {
  if (typeof window === 'undefined') return false;
  if (!SCROLLY_CONFIG.HOME_SCROLLY) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
