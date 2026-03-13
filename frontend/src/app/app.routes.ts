import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { LocationDetailsComponent } from './features/locations/location-details.component';
import { LocationsListComponent } from './features/locations/locations-list.component';
import { MapPageComponent } from './features/map/map-page.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'map', component: MapPageComponent },
  { path: 'locations', component: LocationsListComponent },
  { path: 'locations/:id', component: LocationDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
