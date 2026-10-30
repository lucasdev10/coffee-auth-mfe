import { Routes } from '@angular/router';

/**
 * Auth MFE routes exposed via Module Federation.
 * These routes are lazy-loaded by the Shell App at /auth/*.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page').then((c) => c.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-page/register-page').then((c) => c.RegisterPageComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
