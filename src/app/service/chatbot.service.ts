import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  constructor(
    private http: HttpClient,
  ) {
  }
  private baseEndpoint = environment.urlApiMicroservices.domain + '/chatbot';
  private baseEndpointAzure = environment.urlApiMicroservices.domain + '/azure';

  enviarMensaje(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/enviarMensaje', JSON.stringify(data))
  }

  buscarGuias(data: any): Observable<any> {
    return this.http.post<any>(this.baseEndpoint + '/buscarGuias', JSON.stringify(data))
  }

  enviarMensajeConArchivo(categoria: string, mensaje: string, prompt: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('categoria', categoria);
    formData.append('mensaje', mensaje);
    formData.append('prompt', prompt);
    formData.append('archivo', file);
    return this.http.post<any>(`${this.baseEndpoint}/enviarMensajeConArchivo`, formData);
  }

  speakToText(audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    return this.http.post<any>(`${this.baseEndpointAzure}/speakToText`, formData);
  }

  
  speakToTextApi(audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    return this.http.post<any>(`${this.baseEndpointAzure}/speakToTextApi`, formData);
  }


  textToSpeak(request: any): Observable<Blob> {
    return this.http.post(
      this.baseEndpointAzure + '/textToSpeak',
      request,
      {
        responseType: 'blob',
      }
    );
  }
  
  textToSpeakApi(request: any): Observable<Blob> {
    return this.http.post(
      this.baseEndpointAzure + '/textToSpeakApi',
      request,
      {
        responseType: 'blob',
      }
    );
  }
}
