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

  listarPagosxCliente(clienteId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('clienteId', clienteId);
    return this.http.get<any>(this.baseEndpoint + '/listarPagosxCliente', { params: params })
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


}
