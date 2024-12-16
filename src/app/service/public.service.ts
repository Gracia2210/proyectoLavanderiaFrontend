import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/publico';

  obtenerConfiguracionGlobal(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/obtenerConfiguracionGlobal')
  }

 
}
