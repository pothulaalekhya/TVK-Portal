import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-mockup',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="mockup-laptop-shell mx-auto relative select-none">
      
      <!-- Laptop Top Bezel & Window Header -->
      <div class="mockup-window-header flex items-center justify-between px-4 py-2.5 bg-[#0F172A] rounded-t-2xl border-b border-slate-800/80 select-none">
        <div class="flex items-center space-x-2">
          <span class="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-sm"></span>
          <span class="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-sm"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-sm"></span>
        </div>

        <div class="flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#1E293B]/80 border border-slate-700/60 shadow-inner">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[11px] text-slate-300 font-mono tracking-wide font-medium">portal.tvktechnologies.com</span>
        </div>

        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
            Phase 0{{ activeStepIndex + 1 }}
          </span>
        </div>
      </div>

      <!-- Screen Display Viewport -->
      <div class="mockup-screen-viewport relative overflow-hidden bg-[#070B14]">
        
        <!-- =============================================================== -->
        <!-- STEP 1 SCREEN: TRAINING (Interactive Cloud IDE & Lab)          -->
        <!-- =============================================================== -->
        <div class="step-screen-panel absolute inset-0 p-5 text-white flex flex-col justify-between"
          [class.active-screen]="activeStepIndex === 0">
          
          <!-- Top Editor Tabs Bar -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
            <div class="flex items-center space-x-2">
              <div class="px-3 py-1 rounded-md bg-[#1E1B4B] border border-indigo-500/40 text-indigo-300 font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                <span class="text-amber-400 font-bold">☕</span> OrderService.java
              </div>
              <div class="px-2.5 py-1 rounded-md bg-slate-900/60 text-slate-400 font-mono text-[11px] hidden sm:flex items-center gap-1.5">
                <span class="text-cyan-400">⚛</span> AppRoutes.ts
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] text-emerald-400 font-mono font-bold">Java 21 Virtual Threads</span>
            </div>
          </div>

          <!-- Code Snippet Body -->
          <div class="my-2 p-3 rounded-xl bg-[#0B0F19] border border-slate-800/90 font-mono text-[11px] leading-relaxed shadow-inner overflow-hidden">
            <div class="text-slate-500">// TVK Production Microservice Lab</div>
            <div class="text-purple-400">&#64;RestController</div>
            <div class="text-purple-400">&#64;RequestMapping<span class="text-slate-300">("/api/v1/orders")</span></div>
            <div>
              <span class="text-blue-400 font-bold">public class</span> <span class="text-yellow-300">OrderDispatchService</span> &#123;
            </div>
            <div class="pl-4">
              <span class="text-purple-400">&#64;PostMapping</span><span class="text-slate-300">("/process")</span>
            </div>
            <div class="pl-4">
              <span class="text-blue-400">public</span> <span class="text-emerald-400">CompletableFuture&lt;Order&gt;</span> <span class="text-yellow-300">dispatch</span>(...) &#123;
            </div>
            <div class="pl-8 text-slate-400">
              <span class="text-cyan-400">return</span> Thread.<span class="text-yellow-300">startVirtualThread</span>(() -&gt; executePipeline());
            </div>
            <div class="pl-4">&#125;</div>
            <div>&#125;</div>
          </div>

          <!-- Terminal Output Drawer -->
          <div class="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <div class="flex items-center space-x-2">
              <span class="text-emerald-400 font-bold">&gt;</span>
              <span class="text-slate-300">[INFO] Spring Boot 3.3.4 started on port 8080 (JVM 1.42s)</span>
            </div>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              BUILD SUCCESS ✓
            </span>
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- STEP 2 SCREEN: PROJECTS (Microservices & Docker Container View)-->
        <!-- =============================================================== -->
        <div class="step-screen-panel absolute inset-0 p-5 text-white flex flex-col justify-between"
          [class.active-screen]="activeStepIndex === 1">
          
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-md bg-pink-600/30 border border-pink-500/40 text-pink-400 flex items-center justify-center font-bold text-xs">⚡</span>
              <div>
                <span class="font-bold text-xs text-white block">Enterprise Microservices Cluster</span>
                <span class="text-[9px] text-pink-400 font-mono">tvk-repo / master (CI/CD Passed)</span>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
              100% Student Authored
            </span>
          </div>

          <!-- Live Microservices Rows -->
          <div class="space-y-2 my-2 font-mono text-[11px]">
            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                <span class="text-slate-200 font-bold">order-dispatch-service</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-slate-400">Docker #8801</span>
                <span class="text-[10px] text-emerald-400 font-bold">240 req/s</span>
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                <span class="text-slate-200 font-bold">auth-jwt-security-service</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-slate-400">Spring Sec 6.2</span>
                <span class="text-[10px] text-cyan-400 font-bold">OAuth2/RSA</span>
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"></span>
                <span class="text-slate-200 font-bold">kafka-event-cluster</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-[10px] text-slate-400">3 Partitions</span>
                <span class="text-[10px] text-indigo-300 font-bold">14.2k msg/s</span>
              </div>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 flex items-center justify-between text-[11px] text-pink-300">
            <span>AWS Multi-Stage Cloud Deploy</span>
            <span class="font-bold text-white flex items-center gap-1">GitHub Verified Repository &rarr;</span>
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- STEP 3 SCREEN: PLACEMENT (1-on-1 Technical Mock Interview)     -->
        <!-- =============================================================== -->
        <div class="step-screen-panel absolute inset-0 p-5 text-white flex flex-col justify-between"
          [class.active-screen]="activeStepIndex === 2">
          
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">🎯</span>
              <div>
                <span class="font-bold text-xs text-white block">1-on-1 Technical Mock Desk</span>
                <span class="text-[9px] text-amber-400 font-mono">Staff Architect Mentorship</span>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              Readiness: 4.9 / 5.0
            </span>
          </div>

          <!-- Evaluation Cards -->
          <div class="space-y-2.5 my-2">
            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-[11px] font-bold">
                <span class="text-white">System Design & Distributed Cache Round</span>
                <span class="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">Cleared ✓</span>
              </div>
              <p class="text-[10px] text-slate-400 mt-1 leading-normal">
                Mentor Note: "Mastered connection pools, Redis cache invalidation, and microservices resilience."
              </p>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-[11px] font-bold">
                <span class="text-white">Live DSA & Concurrency Assessment</span>
                <span class="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">Cleared ✓</span>
              </div>
              <p class="text-[10px] text-slate-400 mt-1 leading-normal">
                Sliding window algorithm and binary tree traversal solved in 24 minutes with O(N) complexity.
              </p>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300">
            <span>Next Exclusive Drive: <strong>Oracle Cloud Infrastructure</strong></span>
            <span class="font-semibold text-white">Bangalore BTM Campus</span>
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- STEP 4 SCREEN: CAREER (Verified High-Paying Offer Letter)      -->
        <!-- =============================================================== -->
        <div class="step-screen-panel absolute inset-0 p-5 text-white flex flex-col justify-between"
          [class.active-screen]="activeStepIndex === 3">
          
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-md bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-xs">🏆</span>
              <div>
                <span class="font-bold text-xs text-white block">Official Verified Offer Issued</span>
                <span class="text-[9px] text-sky-400 font-mono">100% Placement Assurance</span>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified Role
            </span>
          </div>

          <!-- Offer Letter Showcase Box -->
          <div class="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1427] border border-slate-700/80 space-y-2 text-center my-2 shadow-2xl relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Candidate Offer Confirmed</div>
            <div class="text-base sm:text-lg font-black text-white tracking-tight">Full Stack Java Cloud Engineer</div>
            
            <div class="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 py-0.5 tracking-tight drop-shadow-sm">
              ₹14,20,000 <span class="text-sm font-bold text-emerald-300">/ Year</span>
            </div>
            
            <div class="text-[11px] text-slate-300 flex items-center justify-center gap-2 font-medium">
              <span>Amazon Web Services (AWS)</span>
              <span>&bull;</span>
              <span>Bangalore Campus</span>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between text-[11px] text-sky-300">
            <span>Placement Network</span>
            <span class="font-bold text-white">2,850+ Alumni Connected &rarr;</span>
          </div>
        </div>

      </div>

      <!-- Laptop Base Pedestal -->
      <div class="mockup-laptop-base"></div>

      <!-- Floating Dynamic Badges that change per step with smooth bounce -->
      <div *ngIf="activeStepIndex === 0" 
        class="absolute -top-3 -right-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xl border border-indigo-400/50 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Batch Starts Monday
      </div>

      <div *ngIf="activeStepIndex === 1" 
        class="absolute -bottom-3 -left-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold shadow-xl border border-pink-400/50 flex items-center gap-1.5">
        <span>⚡</span> Docker & Microservices Live
      </div>

      <div *ngIf="activeStepIndex === 2" 
        class="absolute -top-3 -left-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-xs font-bold shadow-xl border border-amber-400/50 flex items-center gap-1.5">
        <span>🎯</span> Mock Interview 4.9/5 Cleared
      </div>

      <div *ngIf="activeStepIndex === 3" 
        class="absolute -bottom-3 -right-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-xl border border-emerald-400/50 flex items-center gap-1.5">
        <span>🏆</span> Offer Letter: ₹14.2 LPA
      </div>

    </div>
  `,
  styles: [`
    app-device-mockup {
      display: block;
      width: 100%;
    }

    .mockup-laptop-shell {
      width: 100%;
      min-width: 290px;
      max-width: 660px;
      background: #14122B;
      border-radius: 20px 20px 0 0;
      padding: 10px 10px 0 10px;
      box-shadow: 0 35px 80px -15px rgba(0, 0, 0, 0.6), 0 0 40px -10px rgba(91, 61, 245, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
      position: relative;
      transform: perspective(1200px) rotateX(1.5deg);
      transition: transform 0.4s ease, box-shadow 0.4s ease;
    }

    @media (min-width: 768px) {
      .mockup-laptop-shell {
        min-width: 380px;
        padding: 12px 12px 0 12px;
      }
    }

    .mockup-screen-viewport {
      background: #070B14;
      border-radius: 12px 12px 0 0;
      width: 100%;
      height: 360px;
      min-height: 340px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8);
    }

    @media (min-width: 768px) {
      .mockup-screen-viewport {
        height: 380px;
        min-height: 360px;
      }
    }

    .mockup-laptop-base {
      width: 108%;
      margin-left: -4%;
      height: 16px;
      background: linear-gradient(180deg, #374151 0%, #1F2937 100%);
      border-radius: 0 0 16px 16px;
      position: relative;
      box-shadow: 0 20px 35px rgba(0, 0, 0, 0.45);
    }

    .step-screen-panel {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity;
    }

    .step-screen-panel.active-screen {
      opacity: 1 !important;
      transform: translateY(0) scale(1) !important;
      pointer-events: auto !important;
    }
  `]
})
export class DeviceMockupComponent {
  @Input() activeStepIndex: number = 0;
}
