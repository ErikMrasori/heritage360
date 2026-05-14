import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { nonAdminGuard } from './core/guards/non-admin.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { LocationDetailsComponent } from './features/locations/location-details.component';
import { LocationsListComponent } from './features/locations/locations-list.component';
import { MapPageComponent } from './features/map/map-page.component';
import { PlannerComponent } from './features/planner/planner.component';
import { ProfileComponent } from './features/profile/profile.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate: [nonAdminGuard] },
  { path: 'map', component: MapPageComponent, canActivate: [nonAdminGuard] },
  { path: 'planner', component: PlannerComponent, canActivate: [nonAdminGuard] },
  { path: 'locations', component: LocationsListComponent, canActivate: [nonAdminGuard] },
  { path: 'locations/:id', component: LocationDetailsComponent, canActivate: [nonAdminGuard] },
  { path: 'login', component: LoginComponent, canActivate: [nonAdminGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [nonAdminGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard, nonAdminGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
