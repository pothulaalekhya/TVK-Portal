import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { DataService } from "../../core/services/data.service";
import { ToastService } from "../../core/services/toast.service";

interface ChatMessage {
  sender: "bot" | "user";
  text: string;
  time: string;
}

import { RevealDirective } from "../../shared/motion";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RevealDirective],
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
})
export class ContactComponent implements OnInit {
  formData = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredCampus: "Bangalore",
  };
  isSubmitting = false;
  formSubmitted = false;

  // Country Code Selector (Default: India +91)
  countryCode = "+91";
  showCountryDropdown = false;
  countrySearchTerm = "";
  countryCodes = [
    { code: "+91", country: "IN", label: "India (+91)", flag: "🇮🇳" },
    { code: "+1", country: "US", label: "USA (+1)", flag: "🇺🇸" },
    { code: "+44", country: "GB", label: "UK (+44)", flag: "🇬🇧" },
    { code: "+61", country: "AU", label: "Australia (+61)", flag: "🇦🇺" },
    { code: "+1", country: "CA", label: "Canada (+1)", flag: "🇨🇦" },
    { code: "+971", country: "AE", label: "UAE (+971)", flag: "🇦🇪" },
    { code: "+65", country: "SG", label: "Singapore (+65)", flag: "🇸🇬" },
    { code: "+49", country: "DE", label: "Germany (+49)", flag: "🇩🇪" },
    { code: "+33", country: "FR", label: "France (+33)", flag: "🇫🇷" },
    { code: "+81", country: "JP", label: "Japan (+81)", flag: "🇯🇵" },
    { code: "+966", country: "SA", label: "Saudi Arabia (+966)", flag: "🇸🇦" },
    { code: "+974", country: "QA", label: "Qatar (+974)", flag: "🇶🇦" },
    { code: "+977", country: "NP", label: "Nepal (+977)", flag: "🇳🇵" },
    { code: "+94", country: "LK", label: "Sri Lanka (+94)", flag: "🇱🇰" },
    { code: "+880", country: "BD", label: "Bangladesh (+880)", flag: "🇧🇩" },
  ];

  get filteredCountryCodes() {
    if (!this.countrySearchTerm.trim()) return this.countryCodes;
    const term = this.countrySearchTerm.trim().toLowerCase();
    return this.countryCodes.filter(
      c => c.label.toLowerCase().includes(term) || c.code.includes(term) || c.country.toLowerCase().includes(term)
    );
  }

  selectCountryCode(code: string): void {
    this.countryCode = code;
    this.showCountryDropdown = false;
    this.countrySearchTerm = "";
  }

  getCountryFlag(code: string): string {
    const found = this.countryCodes.find(c => c.code === code);
    return found ? found.flag : "🇮🇳";
  }

  toggleCountryDropdown(): void {
    this.showCountryDropdown = !this.showCountryDropdown;
    this.countrySearchTerm = "";
  }

  // Interactive AI/FAQ Chat Assistant Widget
  showChatWidget = false;
  chatInput = "";
  chatMessages: ChatMessage[] = [
    {
      sender: "bot",
      text: "👋 Hi there! I'm the TVK Admissions Assistant. How can I help you today? You can ask about our Course Fees in ₹ INR, Weekend/Weekday Batches, or Campus Locations.",
      time: "Just now",
    },
  ];

  quickFaqChips = [
    "What is the Course Fee?",
    "When does next batch start?",
    "Do you offer 100% placement?",
    "Bangalore Campus address?",
    "Chennai Campus address?",
  ];

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {}

  submitForm(): void {
    if (
      !this.formData.name.trim() ||
      !this.formData.email.trim() ||
      !this.formData.phone.trim() ||
      !this.formData.subject.trim() ||
      !this.formData.message.trim()
    ) {
      this.toastService.showError("Please fill out all required fields.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.formData.email.trim())) {
      this.toastService.showError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    this.isSubmitting = true;

    const payload = {
      ...this.formData,
      phone: this.countryCode + " " + this.formData.phone.trim(),
    };

    this.dataService.submitContactRequest(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.formSubmitted = true;
        this.toastService.showSuccess("Inquiry submitted! Our admissions counselor will call you within 2 hours.");
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formSubmitted = true;
        this.toastService.showSuccess("Inquiry submitted! Our admissions counselor will call you shortly.");
      },
    });
  }

  sendChatMessage(query?: string): void {
    const text = query || this.chatInput.trim();
    if (!text) return;

    this.chatMessages.push({
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    this.chatInput = "";

    // Simulated Intelligent Assistant Response
    setTimeout(() => {
      let reply = "Thank you for reaching out! Our admissions team can assist you directly with custom batch details.";
      const lower = text.toLowerCase();

      if (lower.includes("fee") || lower.includes("price") || lower.includes("cost") || lower.includes("inr")) {
        reply = "Our certified training tracks range from ₹24,999 to ₹34,999 with 0% No-Cost EMI options starting at just ₹2,499/month.";
      } else if (lower.includes("batch") || lower.includes("timing") || lower.includes("start")) {
        reply = "New weekday and weekend batches start every Monday and Saturday. We offer 7:30 AM & 7:00 PM weekday batches as well as weekend intensive sessions.";
      } else if (lower.includes("placement") || lower.includes("job") || lower.includes("guarantee")) {
        reply = "We offer 100% placement assurance with 160+ partner companies. Our students receive continuous interview calls until they secure an offer.";
      } else if (lower.includes("bangalore") || lower.includes("btm") || lower.includes("blr")) {
        reply = "Our Bangalore Hub is located at BTM Layout 2nd Stage, Outer Ring Road, Bangalore - 560076. Phone: +91 98765 43210.";
      } else if (lower.includes("chennai") || lower.includes("omr") || lower.includes("maa")) {
        reply = "Our Chennai Hub is located at OMR IT Expressway, Sholinganallur, Chennai - 600119. Phone: +91 98765 43211.";
      }

      this.chatMessages.push({
        sender: "bot",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }, 400);
  }
}
