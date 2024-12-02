import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateLayoutComponent } from './layout/private-layout/private-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { PrivateRoutes } from './routes/private.routes';
import { PublicRoutes } from './routes/public.routes';

const routes: Routes = [  {
  path: '',
  redirectTo: '/login',
  pathMatch: 'full',
},
{ path: '', component: PrivateLayoutComponent, data: { title: 'Paginas Libre' }, children: PrivateRoutes},
{ path: '', component: PublicLayoutComponent, data: { title: 'Pagina de Sistema' },children:PublicRoutes},

{
  path: '**',
  redirectTo: '/error/404'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
