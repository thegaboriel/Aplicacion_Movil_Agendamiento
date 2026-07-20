import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  constructor(private databaseService: DatabaseService) {}

  /** Convierte una fila cruda de SQLite (estado_sync) al modelo Evento (estadoSync). */
  private mapRow(row: any): Evento {
    return {
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      fecha: row.fecha,
      hora: row.hora,
      lugar: row.lugar,
      tipo: row.tipo,
      estadoSync: row.estado_sync,
    };
  }

  /** Crea un nuevo evento local y devuelve el id generado. */
  async create(evento: Evento): Promise<number> {
    const db = this.databaseService.getConnection();
    const sql = `INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, tipo, estado_sync)
                 VALUES (?, ?, ?, ?, ?, ?, ?);`;
    const values = [
      evento.titulo,
      evento.descripcion ?? null,
      evento.fecha,
      evento.hora,
      evento.lugar,
      evento.tipo,
      evento.estadoSync ?? 'SINCRONIZADO',
    ];
    const result = await db.run(sql, values);
    return result.changes?.lastId ?? -1;
  }

  /** Devuelve todos los eventos ordenados por fecha y hora. */
  async findAll(): Promise<Evento[]> {
    const db = this.databaseService.getConnection();
    const result = await db.query('SELECT * FROM eventos ORDER BY fecha ASC, hora ASC;');
    return ((result.values as any[]) ?? []).map((r) => this.mapRow(r));
  }

  /** Busca un evento por su id local. */
  async findById(id: number): Promise<Evento | undefined> {
    const db = this.databaseService.getConnection();
    const result = await db.query('SELECT * FROM eventos WHERE id = ?;', [id]);
    const row = (result.values as any[])?.[0];
    return row ? this.mapRow(row) : undefined;
  }

  /** Busca coincidencia por título+fecha+hora, usado para no duplicar al refrescar desde la API. */
  async buscarCoincidencia(titulo: string, fecha: string, hora: string): Promise<Evento | undefined> {
    const db = this.databaseService.getConnection();
    const result = await db.query(
      'SELECT * FROM eventos WHERE titulo = ? AND fecha = ? AND hora = ? LIMIT 1;',
      [titulo, fecha, hora]
    );
    const row = (result.values as any[])?.[0];
    return row ? this.mapRow(row) : undefined;
  }

  /** Devuelve los eventos que aún no se han enviado al servidor. */
  async findPendientes(): Promise<Evento[]> {
    const db = this.databaseService.getConnection();
    const result = await db.query(
      `SELECT * FROM eventos WHERE estado_sync = 'PENDIENTE' ORDER BY fecha ASC, hora ASC;`
    );
    return ((result.values as any[]) ?? []).map((r) => this.mapRow(r));
  }

  /** Actualiza un evento existente (incluye su estado de sincronización). */
  async update(evento: Evento): Promise<void> {
    if (!evento.id) {
      throw new Error('El evento necesita un id para poder actualizarse.');
    }
    const db = this.databaseService.getConnection();
    const sql = `UPDATE eventos
                 SET titulo = ?, descripcion = ?, fecha = ?, hora = ?, lugar = ?, tipo = ?, estado_sync = ?
                 WHERE id = ?;`;
    const values = [
      evento.titulo,
      evento.descripcion ?? null,
      evento.fecha,
      evento.hora,
      evento.lugar,
      evento.tipo,
      evento.estadoSync ?? 'SINCRONIZADO',
      evento.id,
    ];
    await db.run(sql, values);
  }

  /** Marca un registro local como confirmado por el servidor. */
  async marcarComoSincronizado(id: number): Promise<void> {
    const db = this.databaseService.getConnection();
    await db.run(`UPDATE eventos SET estado_sync = 'SINCRONIZADO' WHERE id = ?;`, [id]);
  }

  /** Marca un registro local como rechazado por el servidor (requiere corrección). */
  async marcarComoError(id: number): Promise<void> {
    const db = this.databaseService.getConnection();
    await db.run(`UPDATE eventos SET estado_sync = 'ERROR' WHERE id = ?;`, [id]);
  }

  /** Elimina un evento por id. */
  async delete(id: number): Promise<void> {
    const db = this.databaseService.getConnection();
    await db.run('DELETE FROM eventos WHERE id = ?;', [id]);
  }

  /**
   * Inserta datos semilla solo si la tabla está vacía,
   * para no duplicar registros en cada arranque de la app.
   */
  async seed(): Promise<void> {
    const existentes = await this.findAll();
    if (existentes.length > 0) {
      return;
    }

    const eventosSemilla: Evento[] = [
      {
        titulo: 'Conferencia de Inteligencia Artificial',
        descripcion: 'Charla sobre tendencias de IA aplicadas a la educación.',
        fecha: '2026-08-05',
        hora: '09:00',
        lugar: 'Auditorio Principal',
        tipo: 'Conferencia',
        estadoSync: 'SINCRONIZADO',
      },
      {
        titulo: 'Taller de Robótica Educativa',
        descripcion: 'Taller práctico de armado de robots básicos.',
        fecha: '2026-08-12',
        hora: '14:00',
        lugar: 'Laboratorio de Ingeniería',
        tipo: 'Taller',
        estadoSync: 'SINCRONIZADO',
      },
      {
        titulo: 'Seminario de Investigación Científica',
        descripcion: 'Presentación de proyectos de investigación estudiantil.',
        fecha: '2026-08-20',
        hora: '10:30',
        lugar: 'Sala de Conferencias B',
        tipo: 'Seminario',
        estadoSync: 'SINCRONIZADO',
      },
    ];

    for (const evento of eventosSemilla) {
      await this.create(evento);
    }
  }
}
