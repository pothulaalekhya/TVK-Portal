import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../services/data.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  };
  isSubmitting = false;

  constructor(
    private dataService: DataService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {}

  submitForm(): void {
    if (
      !this.formData.name ||
      !this.formData.email ||
      !this.formData.phone ||
      !this.formData.subject ||
      !this.formData.message
    ) {
      this.toastService.showError("Please fill all fields");
      return;
    }

    this.isSubmitting = true;

    this.dataService.submitContactRequest(this.formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastService.showSuccess("Your message was sent successfully. Admissions cell will callback shortly!");
          // Reset form
          this.formData = {
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
          };
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error("Failed to submit contact form", err);
        const errMsg = err.error?.error || "Inquiry submission failed. Please try again.";
        this.toastService.showError(errMsg);
      }
    });
  }
}
