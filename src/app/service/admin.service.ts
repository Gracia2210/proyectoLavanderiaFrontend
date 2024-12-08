import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/admin';

  listarUsuarios(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listarUsuarios', JSON.stringify(data))
  }
  buscarPersona(idPersona: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('idPersona', idPersona);
    return this.http.get<any>(this.baseEndpoint + '/buscarPersona', { params: params })
  }
  crearUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/crearUsuario', JSON.stringify(data))
  }
  editarUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/editarUsuario', JSON.stringify(data))
  }
  eliminarUsuario(usuarioId: number): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/eliminarUsuario/' + usuarioId, null)
  }

  listarArchivos(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/listarArchivos', JSON.stringify(data))
  }
  buscarArchivo(idArchivo: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('idArchivo', idArchivo);
    return this.http.get<any>(this.baseEndpoint + '/buscarArchivo', { params: params })
  }
  crearArchivo(data: any, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('idTipoArchivo', data.idTipoArchivo);
    formData.append('archivo', file);  // El archivo como parte del FormData
    return this.http.post<any>(`${this.baseEndpoint}/crearArchivo`, formData);
  }
  editarArchivo(data: any, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('id', data.id);
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('idTipoArchivo', data.idTipoArchivo);
    formData.append('archivo', file);
    return this.http.post<any>(`${this.baseEndpoint}/editarArchivo`, formData);
  }
  eliminarArchivo(idArchivo: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('idArchivo', idArchivo);
    return this.http.get<any>(this.baseEndpoint + '/eliminarArchivo', { params: params })
  }

  obtenerDocumento(idArchivo: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('idArchivo', idArchivo);
    return this.http.get<any>(this.baseEndpoint + '/obtenerDocumento', { params: params })
  }
  crearUsuariosMasivo(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/crearUsuariosMasivo', JSON.stringify(data))
  }

  listarEstudiantes(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listarEstudiantes')
  }

  listarCategoria(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listarCategoria')
  }
}
