import { Routes } from "@angular/router";
import { SCROLLY_CONFIG } from "./features/scrolly-home/scrolly.config";
import { HomeComponent as ClassicHomeComponent } from "./features/home/home.component";
import { ScrollyHomeComponent } from "./features/scrolly-home/scrolly-home.component";
import { CoursesComponent } from "./features/courses/courses.component";
import { ContactComponent } from "./features/contact/contact.component";
import { DashboardComponent } from "./features/dashboard/dashboard.component";

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
