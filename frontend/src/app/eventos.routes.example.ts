// EJEMPLO: agrega estas rutas a tu app.routes.ts existente.
// IMPORTANTE: 'eventos/nuevo' debe ir ANTES que 'eventos/:id',
// de lo contrario Angular interpretará "nuevo" como un id.

import { Routes } from '@angular/router';

export const eventosRoutes: Routes = [
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
];

// En tu app.routes.ts:
// export const routes: Routes = [
//   ...eventosRoutes,
//   // ...tus otras rutas
// ];
