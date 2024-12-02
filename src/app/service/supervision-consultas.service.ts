import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupervisionConsultaService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/consultas';
  listaConsultas(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaConsultas', JSON.stringify(data))
  }
  listaConsultaDetalle(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaConsultaDetalle', JSON.stringify(data))
  }


  exportarSupervisionConsultaPDF(request: any): Observable<any> {
    return this.http.post(
      this.baseEndpoint + '/exportarSupervisionConsultaPDF',
      request,
      {
        responseType: 'text',
      }
    );
  }

  exportarSupervisionConsultaExcel(request: any): Observable<Blob> {
    return this.http.post(
      this.baseEndpoint + '/exportarSupervisionConsultaExcel',
      request,
      {
        responseType: 'blob',
      }
    );
  }

}
