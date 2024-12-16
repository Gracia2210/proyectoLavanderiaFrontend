import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptor implements HttpInterceptor {
  private readonly URL_AUTH = ['/oauth/token'];
  constructor(private modalService: NgbModal,private _authService :AuthService, private router: Router, private spinner: NgxSpinnerService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((e) => {
        if (this.showForUrl(req.url)) {
          Swal.close();
          this.spinner.hide();
          this.modalService.dismissAll();
          if((e.status==401)||e.status==403){
            switch(e.status){
              case 401:
                if(e.error.error_description.includes("Access token expired")){
                  Swal.fire({ icon: 'info', title: 'Su sesión ha expirado por límite de tiempo en el '+environment.nameSystem, text:'Para volver a iniciar sesión por favor ingrese nuevamente sus credenciales válidas(usuario de red y contraseña)', allowOutsideClick: false });
                }
                else if(e.error.error_description.includes("Full authentication is required to access this resource")){
                  Swal.fire({ icon: 'warning', title: 'Usted necesita autenticacion para acceder a este recurso en el '+environment.nameSystem, text:'Por favor ingresar al sistema con sus credenciales válidas(usuario de red y contraseña)', allowOutsideClick: false });
                }
                else if(e.error.error_description.includes("Cannot convert access token to JSON")){
                  Swal.fire({ icon: 'error', title: 'Su autenticación es invalida en el '+environment.nameSystem, text:'Por favor ingresar al sistema con sus credenciales(usuario de red y contraseña), si persiste el problema por favor comunicarse con Mesa de Ayuda de su Zona Registral', allowOutsideClick: false });
                }
                this._authService.logout();
                this.router.navigate(['/login']);
              break;
              case 403:
                Swal.fire({ icon: 'warning', title: 'Usted no tiene autorización para acceder a este recurso en el '+environment.nameSystem, text:'Por favor consultar con el Administrador del '+environment.nameSystem, allowOutsideClick: false });
                this.router.navigate(['/login']);
              break;
            }
          }
          else{
            if(e.status==500){
              if(e.error.message.includes('Connection refused: no further information:')){
                Swal.fire({ icon: 'info', title: 'El servidor donde se procesan sus funcionalidad se encuentra en actualización o apagado', text:'Por favor esperar máximo 5 minutos, si este mensaje persiste por favor comunicarse con Mesa de Ayuda o Soporte del Sistema', allowOutsideClick: false });
                this._authService.logout();
                this.router.navigate(['/login']);
              }
              else{
                //Swal.fire({ icon: 'warning', title: 'Se ha producido un error inesperado en el '+environment.nameSystem, text:'Error: '+e.status, allowOutsideClick: false });
              }
            }
            else if (e.status==503){
              Swal.fire({ icon: 'warning', title: 'El servicio no se encuentra disponible (Error 503)', text:'Error: '+e.status, allowOutsideClick: false });

            }
            else{
              Swal.fire({ icon: 'warning', title: 'Se ha producido un error inesperado en '+environment.nameSystem, text:'Error: '+e.status, allowOutsideClick: false });
            }
          }
        }
        return throwError(e);
      })
    );
  }

  showForUrl(reqUrl: string): boolean {
    for(let url of this.URL_AUTH) {
      if (reqUrl.indexOf(url) != -1){
        return false;
      }
    }
    return true;
  }
}
