import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccesoInformesService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/acceso-informacion';

  categoriasMasUsadas(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/categoriasMasUsadas', JSON.stringify(data))
  }
  topDiasConsultas(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/topDiasConsultas', JSON.stringify(data))
  }
  listaMesesConsulta(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaMesesConsulta', JSON.stringify(data))
  }
  topUsuariosConsultas(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/topUsuariosConsultas', JSON.stringify(data))
  }
  exportarAccesoInformacionPDF(request: any): Observable<any> {
    return this.http.post(
      this.baseEndpoint + '/exportarAccesoInformacionPDF',
      request,
      {
        responseType: 'text',
      }
    );
  }

  exportarAccesoInformacionExcel(request: any): Observable<Blob> {
    return this.http.post(
      this.baseEndpoint + '/exportarAccesoInformacionExcel',
      request,
      {
        responseType: 'blob',
      }
    );
  }
}
