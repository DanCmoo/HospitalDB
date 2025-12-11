export class SedeConfig {
  /**
   * Obtiene la sede activa desde variable de entorno
   */
  static getSedeActiva(): string {
    return process.env.SEDE_ID || 'norte';
  }

  /**
   * Obtiene el ID numérico de la sede activa
   */
  static getIdSede(): number {
    const sedes: Record<string, number> = {
      norte: 1,
      centro: 2,
      sur: 3,
    };
    return sedes[this.getSedeActiva()] || 1;
  }

  /**
   * Obtiene el nombre completo de la sede activa
   */
  static getNombreSede(): string {
    const nombres: Record<string, string> = {
      norte: 'Sede Norte',
      centro: 'Sede Centro',
      sur: 'Sede Sur',
    };
    return nombres[this.getSedeActiva()] || 'Sede Norte';
  }

  /**
   * Obtiene el ID de red para sincronización con Hub
   */
  static getRedId(): string {
    return `RED_${this.getSedeActiva().toUpperCase()}`;
  }

  /**
   * Verifica si la sede configurada es válida
   */
  static isSedeValida(sede: string): boolean {
    return ['norte', 'centro', 'sur'].includes(sede);
  }
}
