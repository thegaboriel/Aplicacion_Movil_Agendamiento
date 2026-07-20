import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Evento } from '../models/evento.model';
import { EventoService } from './evento.service';
import { EventoApiService, ApiError } from './evento-api.service';

export interface ResultadoObtener {
  eventos: Evento[];
  origen: 'LOCAL' | 'REMOTO';
  error?: string;
}

export interface ResultadoCrear {
  ok: boolean;
  pendiente: boolean;
  mensaje: string;
}

export interface ResultadoSync {
  exitosos: number;
  fallidos: number;
  detalle: string[];
}

@Injectable({
  providedIn: 'root',
})
export class EventoRepository {
  constructor(
    private local: EventoService,
    private remoto: EventoApiService
  ) {}

  async obtenerEventos(): Promise<ResultadoObtener> {
    let eventosLocales: Evento[] = [];

    try {
      eventosLocales = await this.local.findAll();
    } catch (error) {
      console.error('[EventoRepository] No se pudo leer la base local:', error);
    }

    try {
      const eventosRemotos = await firstValueFrom(this.remoto.getEventos());
      await this.actualizarCacheLocal(eventosRemotos);
      const actualizados = await this.local.findAll();
      return { eventos: actualizados, origen: 'REMOTO' };
    } catch (error) {
      const mensaje = this.mensajeDeError(error);
      console.warn('[EventoRepository] No se pudo refrescar desde la API:', mensaje);
      return { eventos: eventosLocales, origen: 'LOCAL', error: mensaje };
    }
  }

  private async actualizarCacheLocal(remotos: Evento[]): Promise<void> {
    for (const remoto of remotos) {
      const existente = await this.local.buscarCoincidencia(
        remoto.titulo,
        remoto.fecha,
        remoto.hora
      );

      if (existente) {
        if (existente.estadoSync === 'PENDIENTE') {
          continue;
        }
        await this.local.update({
          ...remoto,
          id: existente.id,
          estadoSync: 'SINCRONIZADO',
        });
      } else {
        await this.local.create({ ...remoto, id: undefined, estadoSync: 'SINCRONIZADO' });
      }
    }
  }

  async crearEvento(evento: Evento): Promise<ResultadoCrear> {
    const idLocal = await this.local.create({ ...evento, estadoSync: 'PENDIENTE' });

    try {
      await firstValueFrom(this.remoto.crearEvento(evento));
      await this.local.marcarComoSincronizado(idLocal);
      return {
        ok: true,
        pendiente: false,
        mensaje: 'Evento creado y sincronizado con el servidor.',
      };
    } catch (error) {
      if (error instanceof ApiError && error.tipo === 'DATOS_INVALIDOS') {
        await this.local.marcarComoError(idLocal);
        return {
          ok: false,
          pendiente: false,
          mensaje: `El servidor rechazó el evento: ${error.message}`,
        };
      }

      const mensaje = this.mensajeDeError(error);
      console.warn('[EventoRepository] Sin conexión, evento guardado como pendiente:', mensaje);
      return {
        ok: true,
        pendiente: true,
        mensaje: 'Sin conexión con el servidor. El evento quedó pendiente de sincronización.',
      };
    }
  }

  async sincronizarPendientes(): Promise<ResultadoSync> {
    const pendientes = await this.local.findPendientes();
    const resultado: ResultadoSync = { exitosos: 0, fallidos: 0, detalle: [] };

    for (const evento of pendientes) {
      try {
        await firstValueFrom(this.remoto.crearEvento(evento));
        await this.local.marcarComoSincronizado(evento.id!);
        resultado.exitosos++;
        resultado.detalle.push(`OK  - "${evento.titulo}" sincronizado correctamente.`);
      } catch (error) {
        resultado.fallidos++;
        const mensaje = this.mensajeDeError(error);

        if (error instanceof ApiError && error.tipo === 'DATOS_INVALIDOS') {
          await this.local.marcarComoError(evento.id!);
        }

        resultado.detalle.push(`ERROR - "${evento.titulo}": ${mensaje}`);
      }
    }

    return resultado;
  }

  private mensajeDeError(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message;
    }
    return 'Error desconocido de conexión.';
  }
}