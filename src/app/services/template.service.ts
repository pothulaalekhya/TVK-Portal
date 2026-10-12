import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { MessageTemplate, User } from "../models/models";

export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl-reg-welcome",
    title: "Registration Welcome & Demo Invite",
    category: "registration",
    channel: "both",
    isDefault: true,
    subject: "Welcome to TVK Technologies - Your {course} Program Registration",
    body: `Hello {name}, greetings from TVK Technologies! 🎓

We received your registration for the *{course}* program ({location} campus & online).

Our upcoming batch features 100% placement assurance, real-time enterprise microservices labs, and 1-on-1 mock interviews with Senior Architects.

Are you available today for a quick 5-minute call to discuss your batch timing preference and reserve your Free Demo Session seat?

Best regards,
*{counselorName}*
Admissions Desk | TVK Technologies
Phone: +91 98765 43210
Website: https://tvktechnologies.com`,
    updatedAt: new Date().toISOString()
  },
  {
    id: "tpl-interested-details",
    title: "Interested Candidate - Syllabus & Fee Structure",
    category: "interested",
    channel: "both",
    subject: "TVK Technologies: Detailed Syllabus & Placement Roadmap for {course}",
    body: `Hi {name},

Thank you for your interest in our *{course}* program at TVK Technologies!

Here is a quick summary of what is included:
• 12-Week Comprehensive Live Training (Weekday/Weekend)
• Enterprise Architecture, Spring Boot 3 & Modern Frontend
• 100% Placement Assistance & Dedicated Interview Drives
• Total Program Fee: {fee} (EMI options starting at ₹2,499/mo)

Would you like me to share the complete day-by-day syllabus PDF and book your seat for the next batch starting this week?

Warm regards,
*{counselorName}*
TVK Admissions Team`,
    updatedAt: new Date().toISOString()
  },
  {
    id: "tpl-followup-checkin",
    title: "Follow-up & Callback Check-in",
    category: "followup",
    channel: "whatsapp",
    subject: "Following up on your TVK Technologies Training Inquiry",
    body: `Hello {name}, hope you are having a productive day! 🌟

This is *{counselorName}* from TVK Technologies Admissions. I am checking back regarding your application for the *{course}* track.

Seats for our upcoming batch in {location} are almost filled. When would be a good time to connect today to finalize your admission?

Looking forward to hearing from you!`,
    updatedAt: new Date().toISOString()
  },
  {
    id: "tpl-weekend-demo",
    title: "Free Weekend Live Demo Invitation",
    category: "batch_info",
    channel: "both",
    subject: "Exclusive Invitation: Free Live Masterclass on {course}",
    body: `Dear {name},

You are exclusively invited to attend our *Free Live Masterclass & Architecture Walkthrough* for *{course}* with our Senior Lead Architect this Saturday at 10:00 AM!

Key Takeaways:
1. Live Coding Enterprise Microservices
2. 2026 Tech Hiring Trends & Salary Packages
3. Interactive Q&A with Industry Experts

Please reply with *"CONFIRM"* to reserve your VIP access link.

Regards,
*{counselorName}*
TVK Technologies`,
    updatedAt: new Date().toISOString()
  },
  {
    id: "tpl-not-interested",
    title: "Not Interested / Future Batch Connect",
    category: "not_interested",
    channel: "both",
    subject: "Thank you for connecting with TVK Technologies",
    body: `Hi {name},

Thank you for speaking with us today. We have noted that you are not looking to start training right now.

Whenever you decide to upskill in {course} or seek job placement opportunities in {location}, our admissions desk will always be delighted to support you.

Wishing you great success in your career!

Best regards,
*{counselorName}*
TVK Technologies`,
    updatedAt: new Date().toISOString()
  }
];

const STORAGE_KEY = "tvk_message_templates_v2";

@Injectable({
  providedIn: "root"
})
export class TemplateService {
  private templatesSubject = new BehaviorSubject<MessageTemplate[]>([]);
  public templates$: Observable<MessageTemplate[]> = this.templatesSubject.asObservable();

  constructor() {
    this.loadTemplates();
  }

  get templates(): MessageTemplate[] {
    return this.templatesSubject.value;
  }

  loadTemplates(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.templatesSubject.next(parsed);
            return;
          }
        } catch (e) {
          console.error("Failed to parse stored message templates:", e);
        }
      }
    }
    this.templatesSubject.next(INITIAL_TEMPLATES);
    this.persistTemplates(INITIAL_TEMPLATES);
  }

  private persistTemplates(templates: MessageTemplate[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      } catch (e) {
        console.error("Failed to persist templates to localStorage", e);
      }
    }
  }

  getTemplateById(id: string): MessageTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getDefaultTemplate(channel: "whatsapp" | "email" = "whatsapp"): MessageTemplate {
    const matching = this.templates.find(t => t.isDefault && (t.channel === channel || t.channel === "both"));
    if (matching) return matching;
    const fallback = this.templates.find(t => t.channel === channel || t.channel === "both");
    return fallback || this.templates[0] || INITIAL_TEMPLATES[0];
  }

  saveTemplate(template: Partial<MessageTemplate>): MessageTemplate {
    const list = [...this.templates];
    let savedItem: MessageTemplate;

    if (template.isDefault) {
      // Clear other defaults in same channel
      list.forEach(t => {
        if (t.channel === template.channel || template.channel === "both" || t.channel === "both") {
          t.isDefault = false;
        }
      });
    }

    if (template.id) {
      const index = list.findIndex(t => t.id === template.id);
      if (index !== -1) {
        savedItem = {
          ...list[index],
          ...template,
          updatedAt: new Date().toISOString()
        } as MessageTemplate;
        list[index] = savedItem;
      } else {
        savedItem = {
          id: template.id,
          title: template.title || "Custom Template",
          category: template.category || "custom",
          channel: template.channel || "both",
          subject: template.subject || "",
          body: template.body || "",
          isDefault: !!template.isDefault,
          updatedAt: new Date().toISOString()
        };
        list.push(savedItem);
      }
    } else {
      savedItem = {
        id: "tpl-" + Date.now(),
        title: template.title || "Custom Template",
        category: template.category || "custom",
        channel: template.channel || "both",
        subject: template.subject || "",
        body: template.body || "",
        isDefault: !!template.isDefault,
        updatedAt: new Date().toISOString()
      };
      list.push(savedItem);
    }

    this.templatesSubject.next(list);
    this.persistTemplates(list);
    return savedItem;
  }

  deleteTemplate(id: string): boolean {
    const current = this.templates;
    const filtered = current.filter(t => t.id !== id);
    if (filtered.length === current.length) return false;
    this.templatesSubject.next(filtered);
    this.persistTemplates(filtered);
    return true;
  }

  createTemplate(template: Partial<MessageTemplate>): MessageTemplate {
    return this.saveTemplate(template);
  }

  updateTemplate(id: string, template: Partial<MessageTemplate>): MessageTemplate {
    return this.saveTemplate({ ...template, id });
  }

  getWhatsAppUrl(student: Partial<User>, counselorName?: string, customBody?: string): string {
    const phone = student.personalPhone || student.contactNum || "";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const defaultTpl = this.getDefaultTemplate("whatsapp");
    const body = customBody || (defaultTpl ? this.interpolate(defaultTpl.body, student, counselorName) : `Hello ${student.name || 'Candidate'}, greetings from TVK Technologies!`);
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(body)}`;
  }

  resetToDefaults(): void {
    this.templatesSubject.next(INITIAL_TEMPLATES);
    this.persistTemplates(INITIAL_TEMPLATES);
  }

  /**
   * Interpolate placeholders in a template string with actual student / counselor variables
   */
  interpolate(text: string, student: Partial<User>, counselorName: string = "Admissions Counselor"): string {
    if (!text) return "";
    const name = student.name || student.firstName || "Candidate";
    const course = student.targetCourse || student.trackType || "Full Stack Software Engineering";
    const location = student.preferredLocation || student.city || "Bengaluru / Chennai";
    const phone = student.personalPhone || student.contactNum || "";
    const email = student.email || "";
    const fee = "₹34,999 (Special Offer: ₹29,999)";
    const date = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    const counselor = counselorName || student.assignedCounselor || "Admissions Desk";

    return text
      .replace(/{name}/g, name)
      .replace(/{firstName}/g, student.firstName || name.split(" ")[0])
      .replace(/{course}/g, course)
      .replace(/{location}/g, location)
      .replace(/{phone}/g, phone)
      .replace(/{email}/g, email)
      .replace(/{fee}/g, fee)
      .replace(/{date}/g, date)
      .replace(/{counselorName}/g, counselor);
  }
}
