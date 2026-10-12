import { Routes } from "@angular/router";
import { SCROLLY_CONFIG } from "./scrolly-home/scrolly.config";
import { HomeComponent as ClassicHomeComponent } from "./components/home/home.component";
import { ScrollyHomeComponent } from "./scrolly-home/scrolly-home.component";
import { CoursesComponent } from "./components/courses/courses.component";
import { ContactComponent } from "./components/contact/contact.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

const ActiveHome = SCROLLY_CONFIG.HOME_SCROLLY ? ScrollyHomeComponent : ClassicHomeComponent;

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: ActiveHome },
  { path: "courses", component: CoursesComponent },
  { path: "contact", component: ContactComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "admin", component: DashboardComponent },
  { path: "**", redirectTo: "/home" },
];
