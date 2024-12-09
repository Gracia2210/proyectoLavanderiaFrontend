import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { UsuarioComponent } from './usuario.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FuncionesAdministrativasComponent } from './admin/funciones-administrativas/funciones-administrativas.component';
import { CreacionUsuarioComponent } from './admin/funciones-administrativas/creacion-usuario/creacion-usuario.component';
import { PersonalComponent } from './personal/personal.component';
import { CreacionClienteComponent } from './admin/funciones-administrativas/creacion-cliente/creacion-cliente.component';
import { CreacionServiciosComponent } from './admin/funciones-administrativas/creacion-servicios/creacion-servicios.component';


@NgModule({
  declarations: [UsuarioComponent,PersonalComponent, FuncionesAdministrativasComponent, CreacionUsuarioComponent,CreacionClienteComponent,CreacionServiciosComponent
  ],
  imports: [
    CommonModule,
    UsuarioRoutingModule,
    SharedModule
  ]
})
export class UsuarioModule { }
