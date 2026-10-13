import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor() {}

  showToast(
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    duration = 5000,
  ): void {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  removeToast(id: string): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }

  showSuccess(message: string, duration = 5000): void {
    this.showToast(message, "success", duration);
  }

  showError(message: string, duration = 5000): void {
    this.showToast(message, "error", duration);
  }

  showInfo(message: string, duration = 5000): void {
    this.showToast(message, "info", duration);
  }
}
