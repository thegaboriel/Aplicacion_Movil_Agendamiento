export interface Evento {
  id?: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;

  /**
   * Estado de sincronización del registro local respecto al backend.
   * - SINCRONIZADO: coincide con el servidor.
   * - PENDIENTE: se creó/editó sin conexión y falta enviarlo.
   * - ERROR: el servidor rechazó el envío (dato inválido) y requiere corrección manual.
   */
  estadoSync?: 'PENDIENTE' | 'SINCRONIZADO' | 'ERROR';
}
