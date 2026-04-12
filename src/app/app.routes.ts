import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./index/index').then((c) => c.Index),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then((c) => c.About),
  },
];
