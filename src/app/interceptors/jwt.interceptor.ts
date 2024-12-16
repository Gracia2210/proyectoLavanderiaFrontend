import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private _authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this._authService.token();
    let id = environment.apiConnectId;
    if(!request.url.includes('oauth/token') && token && !request.url.includes('api.ipify.org')) {

      if(request.url.includes('editarConfiguracion') || request.url.includes('editarArchivo') || request.url.includes('enviarMensajeConArchivo')  || request.url.includes('export.highcharts.com')  || request.url.includes('speakToText') ){
        request = request.clone({
          setHeaders: {
            "Authorization": "Bearer " + token,
          }
        });
      }
      else{
        request = request.clone({
          setHeaders: {
            "Authorization": "Bearer " + token,
            "Content-Type":"application/json; charset=utf-8"
           // "X-IBM-Client-Id": id
          }
        });
      }


    } else if (!request.url.includes('api.ipify.org')){
      request = request.clone({
        setHeaders: {
         // "X-IBM-Client-Id": id
        }
      });
    }
    return next.handle(request);
  }
}
