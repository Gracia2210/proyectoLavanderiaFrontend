import { Routes, RouterModule } from '@angular/router';

export const PublicRoutes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('../view/public/login/login.module').then(m => m.LoginModule)
  },
];
