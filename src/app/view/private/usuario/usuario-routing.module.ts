import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FuncionesAdministrativasComponent } from './admin/funciones-administrativas/funciones-administrativas.component';
import { PersonalComponent } from './personal/personal.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/usuario/personal',
    pathMatch: 'full',
  },
  { path: 'personal', component: PersonalComponent},
  { path: 'admin/funciones', component: FuncionesAdministrativasComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
