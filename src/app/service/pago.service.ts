import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/pago';

  listarPagosxCliente(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listarPagosxCliente', JSON.stringify(data))
  }

  listarServicios(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listarServicios')
  }

  listarSubservicios(servicioId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('servicioId', servicioId);
    return this.http.get<any>(this.baseEndpoint + '/listarSubservicios', { params: params })
  }

  listarMedioPagos(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listarMedioPagos')
  }

  generarBoleta(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/generarBoleta', JSON.stringify(data))
  }
  obtenerPagoEdit(pago: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('pago', pago);
    return this.http.get<any>(this.baseEndpoint + '/obtenerPagoEdit', { params: params })
  }
  edicionBoleta(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/edicionBoleta', JSON.stringify(data))
  }
  imprimirBoleta(pago: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('pago', pago);
    return this.http.get<any>(this.baseEndpoint + '/imprimirBoleta', { params: params })
  }
  anularPago(pago: number,codigo:string): Observable<any> {
    let params = new HttpParams();
    params = params.append('pago', pago);
    params = params.append('codigo', codigo);
    return this.http.get<any>(this.baseEndpoint + '/anularPago', { params: params })
  }
}
