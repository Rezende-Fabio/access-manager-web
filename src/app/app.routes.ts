import { Routes } from '@angular/router';
import { IndexPage } from './pages/index';
import { initializedGuard, setupGuard } from './guards/setupGuard';
import { SetupPage } from './pages/setup/setup';

export const routes: Routes = [
  {
    path: 'setup',
    component: SetupPage,
    canActivate: [setupGuard]
  },
  {
    path: 'index',
    component: IndexPage,
    canActivate: [initializedGuard]
  },
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full'
  },
];
