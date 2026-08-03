import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'patients',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/patient-list/patient-list').then((m) => m.PatientListComponent),
  },
  {
    path: 'patients/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/patient-form/patient-form').then((m) => m.PatientFormComponent),
  },
  {
    path: 'patients/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/patient-form/patient-form').then((m) => m.PatientFormComponent),
  },
  {
    path: 'patients/:id/results',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/test-results/test-results').then((m) => m.TestResultsComponent),
  },
  {
    path: 'patients/:id/report',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/lab-report/lab-report').then((m) => m.LabReportComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
