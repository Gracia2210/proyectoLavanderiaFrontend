import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/configuracion';


  listarConfiguracion(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listarConfiguracion')
  }

  editarConfiguracion(data: any, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('id', data.id);
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('direccion', data.direccion);
    formData.append('telefono', data.telefono);
    formData.append('archivo', file);
    return this.http.post<any>(`${this.baseEndpoint}/editarConfiguracion`, formData);
  }

  obtenerImagen(idArchivo: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('idArchivo', idArchivo);
    return this.http.get<any>(this.baseEndpoint + '/obtenerImagen', { params: params })
  }
  listarSecuencia(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listarSecuencia')
  }
  editarSecuencia(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/editarSecuencia', JSON.stringify(data))
  }
}
