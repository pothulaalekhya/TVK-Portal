import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scrolly-illustration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 1. Laptop with Code Window -->
    <svg *ngIf="type === 'laptop-code'" class="w-full h-auto drop-shadow-2xl" viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Laptop Screen Shell -->
      <rect x="50" y="30" width="440" height="280" rx="16" fill="#0B1224" stroke="#334155" stroke-width="4"/>
      <!-- Window Controls -->
      <circle cx="76" cy="56" r="6" fill="#EF4444"/>
      <circle cx="96" cy="56" r="6" fill="#F59E0B"/>
      <circle cx="116" cy="56" r="6" fill="#10B981"/>
      <text x="140" y="60" fill="#94A3B8" font-size="12" font-family="monospace">tvk-placement-service.java</text>
      <!-- Editor Code Lines -->
      <rect x="76" y="86" width="120" height="10" rx="3" fill="#818CF8"/>
      <rect x="206" y="86" width="80" height="10" rx="3" fill="#38BDF8"/>
      <rect x="76" y="110" width="180" height="8" rx="2" fill="#475569"/>
      <rect x="96" y="130" width="220" height="8" rx="2" fill="#34D399"/>
      <rect x="96" y="150" width="140" height="8" rx="2" fill="#F472B6"/>
      <rect x="116" y="170" width="260" height="8" rx="2" fill="#E2E8F0"/>
      <rect x="116" y="190" width="190" height="8" rx="2" fill="#A78BFA"/>
      <rect x="96" y="210" width="100" height="8" rx="2" fill="#FBBF24"/>
      <rect x="76" y="234" width="60" height="8" rx="2" fill="#475569"/>
      
      <!-- Mini Floating Microservice Node -->
      <g filter="url(#dropGlow)">
        <rect x="320" y="100" width="150" height="90" rx="12" fill="#1E293B" stroke="#6366F1" stroke-width="2"/>
        <text x="336" y="128" fill="#FFFFFF" font-size="12" font-weight="bold" font-family="sans-serif">Spring Boot 3</text>
        <text x="336" y="148" fill="#10B981" font-size="10" font-family="sans-serif">● 100% Placed</text>
        <rect x="336" y="162" width="118" height="6" rx="3" fill="#334155"/>
        <rect x="336" y="162" width="108" height="6" rx="3" fill="#10B981"/>
      </g>

      <!-- Laptop Base -->
      <path d="M20 310 H520 C528 310 534 316 530 324 L510 340 C506 344 500 346 492 346 H48 C40 346 34 344 30 340 L10 324 C6 316 12 310 20 310 Z" fill="#1E293B" stroke="#475569" stroke-width="2"/>
      <rect x="220" y="312" width="100" height="6" rx="3" fill="#64748B"/>
      
      <defs>
        <filter id="dropGlow" x="310" y="90" width="170" height="110" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#4F46E5" flood-opacity="0.25"/>
        </filter>
      </defs>
    </svg>

    <!-- 2. Graduation Cap -->
    <svg *ngIf="type === 'graduation-cap'" class="w-full h-auto drop-shadow-xl" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M80 20 L150 55 L80 90 L10 55 Z" fill="#4F46E5"/>
      <path d="M80 30 L136 57 L80 84 L24 57 Z" fill="#6366F1"/>
      <!-- Skull cap bottom -->
      <path d="M35 70 V100 C35 118 125 118 125 100 V70 L80 92 Z" fill="#3730A3"/>
      <!-- Golden Tassel -->
      <circle cx="80" cy="55" r="4" fill="#FBBF24"/>
      <path d="M80 55 C100 65 110 80 115 105" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
      <rect x="110" y="105" width="10" height="16" rx="3" fill="#D97706"/>
    </svg>

    <!-- 3. Trophy -->
    <svg *ngIf="type === 'trophy'" class="w-full h-auto drop-shadow-xl" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cup Handles -->
      <path d="M30 45 C15 45 15 85 45 90" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M130 45 C145 45 145 85 115 90" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" fill="none"/>
      <!-- Cup Body -->
      <path d="M40 30 H120 V80 C120 102 102 115 80 115 C58 115 40 102 40 80 Z" fill="#FBBF24"/>
      <path d="M48 36 H112 V78 C112 96 98 107 80 107 C62 107 48 96 48 78 Z" fill="#FCD34D"/>
      <!-- Star on Cup -->
      <path d="M80 54 L83 62 H91 L85 67 L87 75 L80 70 L73 75 L75 67 L69 62 H77 Z" fill="#D97706"/>
      <!-- Stem and Base -->
      <rect x="74" y="115" width="12" height="18" fill="#D97706"/>
      <path d="M50 133 H110 L115 148 H45 Z" fill="#1E293B"/>
      <rect x="58" y="137" width="44" height="6" rx="2" fill="#FBBF24"/>
    </svg>

    <!-- 4. Briefcase -->
    <svg *ngIf="type === 'briefcase'" class="w-full h-auto drop-shadow-xl" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="45" width="110" height="75" rx="10" fill="#1E293B" stroke="#475569" stroke-width="3"/>
      <!-- Handle -->
      <path d="M60 45 V32 C60 27 65 24 70 24 H90 C95 24 100 27 100 32 V45" stroke="#64748B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <!-- Accent Bands -->
      <rect x="45" y="45" width="12" height="75" fill="#334155"/>
      <rect x="103" y="45" width="12" height="75" fill="#334155"/>
      <!-- Lock Center -->
      <rect x="72" y="70" width="16" height="12" rx="3" fill="#F59E0B"/>
      <circle cx="80" cy="76" r="2" fill="#78350F"/>
    </svg>

    <!-- 5. Placement Guarantee Token Badge -->
    <svg *ngIf="type === 'guarantee-badge'" class="w-full h-auto drop-shadow-lg" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="56" fill="#4F46E5"/>
      <circle cx="70" cy="70" r="48" stroke="#818CF8" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M50 70 L64 84 L92 56" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="70" y="106" text-anchor="middle" fill="#C7D2FE" font-size="10" font-weight="bold" font-family="sans-serif">100% PLACED</text>
    </svg>

    <!-- 6. Rotating Orbital Tech Gear -->
    <svg *ngIf="type === 'tech-gear'" class="w-full h-auto drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="32" fill="#1E1B4B" stroke="#818CF8" stroke-width="3"/>
      <circle cx="50" cy="50" r="16" fill="#4F46E5"/>
      <!-- Gear Teeth -->
      <rect x="46" y="8" width="8" height="14" rx="2" fill="#818CF8"/>
      <rect x="46" y="78" width="8" height="14" rx="2" fill="#818CF8"/>
      <rect x="8" y="46" width="14" height="8" rx="2" fill="#818CF8"/>
      <rect x="78" y="46" width="14" height="8" rx="2" fill="#818CF8"/>
      <g transform="rotate(45 50 50)">
        <rect x="46" y="8" width="8" height="14" rx="2" fill="#A78BFA"/>
        <rect x="46" y="78" width="8" height="14" rx="2" fill="#A78BFA"/>
        <rect x="8" y="46" width="14" height="8" rx="2" fill="#A78BFA"/>
        <rect x="78" y="46" width="14" height="8" rx="2" fill="#A78BFA"/>
      </g>
    </svg>

    <!-- 7. Rotating Sparkle Star / Diamond Badge -->
    <svg *ngIf="type === 'sparkle-star'" class="w-full h-auto drop-shadow-lg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C50 30 70 50 95 50 C70 50 50 70 50 95 C50 70 30 50 5 50 C30 50 50 30 50 5 Z" fill="url(#sparkleGrad)"/>
      <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
      <defs>
        <linearGradient id="sparkleGrad" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#F59E0B"/>
          <stop offset="50%" stop-color="#EC4899"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- 8. Orbital Dashed Tech Ring -->
    <svg *ngIf="type === 'orbital-ring'" class="w-full h-auto" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="150" cy="150" r="135" stroke="url(#ringGrad)" stroke-width="2" stroke-dasharray="10 8" opacity="0.6"/>
      <circle cx="150" cy="15" r="5" fill="#38BDF8"/>
      <circle cx="285" cy="150" r="6" fill="#F472B6"/>
      <circle cx="150" cy="285" r="5" fill="#34D399"/>
      <circle cx="15" cy="150" r="6" fill="#A78BFA"/>
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#5B3DF5"/>
          <stop offset="50%" stop-color="#EC4899"/>
          <stop offset="100%" stop-color="#38BDF8"/>
        </linearGradient>
      </defs>
    </svg>
  `
})
export class ScrollyIllustrationComponent {
  @Input() type: 'laptop-code' | 'graduation-cap' | 'trophy' | 'briefcase' | 'guarantee-badge' | 'tech-gear' | 'sparkle-star' | 'orbital-ring' = 'laptop-code';
}
