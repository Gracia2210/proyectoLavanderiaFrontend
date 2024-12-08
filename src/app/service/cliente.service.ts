import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(
    private http: HttpClient,
  ) {
  }

  private baseEndpoint = environment.urlApiMicroservices.domain + '/cliente';

  listar(): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/listar')
  }

  editar(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/editar', JSON.stringify(data))
  }
  crear(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/insertar', JSON.stringify(data))
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(this.baseEndpoint + '/buscar/'+id)
  }

  eliminar(id: number): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/eliminar/' + id,null)
  }
  buscarFiltro(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/buscar-filtro', JSON.stringify(data))
  }

}
