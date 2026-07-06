import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { CoursesComponent } from "./components/courses/courses.component";
import { ContactComponent } from "./components/contact/contact.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "courses", component: CoursesComponent },
  { path: "contact", component: ContactComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "**", redirectTo: "/home" },
];
