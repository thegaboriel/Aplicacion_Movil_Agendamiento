import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'eventos',
    loadComponent: () =>
      import('./pages/eventos-list/eventos-list.page').then((m) => m.EventosListPage),
  },
  {
    path: 'eventos/nuevo',
    loadComponent: () =>
      import('./pages/evento-form/evento-form.page').then((m) => m.EventoFormPage),
  },
  {
    path: 'eventos/:id',
    loadComponent: () =>
      import('./pages/evento-detail/evento-detail.page').then((m) => m.EventoDetailPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];