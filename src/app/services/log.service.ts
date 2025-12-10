import { Injectable } from '@angular/core';

export interface LogEntry {
  id: string;
  timestamp: Date;
  action: 'ADD' | 'UPDATE' | 'DELETE';
  gameId: number;
  gameName: string;
  details: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly STORAGE_KEY = 'catalog_log';

  constructor() {}

  private loadLogs(): LogEntry[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const logs = JSON.parse(stored);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
    return [];
  }

  private saveLogs(logs: LogEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
  }

  addLog(action: 'ADD' | 'UPDATE' | 'DELETE', gameId: number, gameName: string, details: string): void {
    const logs = this.loadLogs();
    
    const newLog: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      action,
      gameId,
      gameName,
      details,
      user: 'Administrador de Almacen'
    };

    logs.unshift(newLog);
    this.saveLogs(logs);
  }

  getLogs(): LogEntry[] {
    return this.loadLogs();
  }

  clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private generateId(): string {
    return `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
