import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/reporte';

  listaIngresoTotalesPeriodo(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaIngresoTotalesPeriodo', JSON.stringify(data))
  }
  listaServicioSolicitado(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaServicioSolicitado', JSON.stringify(data))
  }
  listaEstadosPagos(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaEstadosPagos', JSON.stringify(data))
  }
  listaClientesFrecuentes(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaClientesFrecuentes', JSON.stringify(data))
  }
  listaMedioPagosMonto(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaMedioPagosMonto', JSON.stringify(data))
  }
  listaIngresoUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listaIngresoUsuario', JSON.stringify(data))
  }
  listarDeudores(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listarDeudores', JSON.stringify(data))
  }
}
