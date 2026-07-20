import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { Evento } from '../models/evento.model';

export type TipoErrorApi = 'RED' | 'SERVIDOR' | 'DATOS_INVALIDOS' | 'DESCONOCIDO';

export class ApiError extends Error {
  constructor(message: string, public tipo: TipoErrorApi, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}
console.log("Plataforma:", Capacitor.getPlatform());
@Injectable({
  providedIn: 'root',
})
export class EventoApiService {
  // localhost para navegador/iOS, 10.0.2.2 para el emulador de Android
  private api = Capacitor.getPlatform() === 'android'
    ? 'http://10.0.2.2:3000/api/eventos'
    : 'http://localhost:3000/api/eventos';

  private readonly TIEMPO_LIMITE_MS = 5000;

  constructor(private http: HttpClient) {}

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.api).pipe(
      timeout(this.TIEMPO_LIMITE_MS),
      catchError(this.manejarError)
    );
  }

  crearEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(this.api, evento).pipe(
      timeout(this.TIEMPO_LIMITE_MS),
      catchError(this.manejarError)
    );
  }

  actualizarEvento(evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.api}/${evento.id}`, evento).pipe(
      timeout(this.TIEMPO_LIMITE_MS),
      catchError(this.manejarError)
    );
  }

  eliminarEvento(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.api}/${id}`).pipe(
      timeout(this.TIEMPO_LIMITE_MS),
      catchError(this.manejarError)
    );
  }

  private manejarError = (error: unknown) => {
    if (
      (error as any)?.name === 'TimeoutError' ||
      ((error as HttpErrorResponse)?.status === 0)
    ) {
      return throwError(
        () => new ApiError('No hay conexión con el servidor de eventos.', 'RED')
      );
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 400 || error.status === 404) {
        const mensaje = error.error?.mensaje ?? 'Los datos enviados no son válidos.';
        return throwError(() => new ApiError(mensaje, 'DATOS_INVALIDOS', error.status));
      }

      if (error.status >= 500) {
        return throwError(
          () => new ApiError('Error interno del servidor de eventos.', 'SERVIDOR', error.status)
        );
      }
    }

    return throwError(() => new ApiError('Ocurrió un error desconocido.', 'DESCONOCIDO'));
  };
}