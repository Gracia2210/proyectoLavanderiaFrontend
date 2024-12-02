import { Component } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-funciones-administrativas',
  templateUrl: './funciones-administrativas.component.html',
  styleUrls: ['./funciones-administrativas.component.scss']
})
export class FuncionesAdministrativasComponent {
  constructor(
    public _authService:AuthService
  ) {
  }

  verPermisos(){
    return this._authService.obtenerRol();
  }
}
