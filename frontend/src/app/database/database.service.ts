import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

/**
 * Servicio base de acceso a SQLite.
 * Se encarga de abrir/crear la conexión a la base de datos local
 * y de garantizar que el esquema (tablas) exista antes de usarse.
 */
@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private readonly dbName = 'app_db';
  private ready = false;

  /** Abre (o crea) la base de datos local y garantiza el esquema. */
  async initializeDatabase(): Promise<void> {
    if (this.ready) {
      return;
    }

    try {
      const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

      if (isConn) {
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();
      await this.createSchema();
      this.ready = true;
    } catch (error) {
      console.error('[DatabaseService] Error inicializando la base de datos:', error);
      throw error;
    }
  }

  /** Crea las tablas necesarias si todavía no existen. */
  private async createSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    lugar TEXT NOT NULL,
    tipo TEXT NOT NULL,
    estado_sync TEXT DEFAULT 'SINCRONIZADO'
);
    `;
    await this.db.execute(schema);
  }

  /** Devuelve la conexión activa para que los servicios de dominio la usen. */
  getConnection(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error(
        '[DatabaseService] La base de datos no ha sido inicializada. Llama a initializeDatabase() primero.'
      );
    }
    return this.db;
  }

  /** Cierra la conexión (útil al salir de la app o en pruebas). */
  async closeConnection(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.dbName, false);
      this.ready = false;
    }
  }
}
