import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService, LogEntry } from '../../services/log.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-catalog-history',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, NgClass],
  templateUrl: './catalog-history.html',
  styleUrls: ['./catalog-history.css']
})
export class CatalogHistory implements OnInit {
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  filterAction: string = 'ALL';

  constructor(
    private logService: LogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que sea administrador
    const currentUser = this.authService.currentUserData();
    if (currentUser?.correo !== 'admin@gmail.com') {
      this.router.navigate(['/catalog']);
      return;
    }

    this.loadLogs();
  }

  private loadLogs(): void {
    this.logs = this.logService.getLogs();
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filterAction === 'ALL') {
      this.filteredLogs = this.logs;
    } else {
      this.filteredLogs = this.logs.filter(log => log.action === this.filterAction);
    }
  }

  getActionBadgeClass(action: string): string {
    switch(action) {
      case 'ADD': return 'bg-success';
      case 'UPDATE': return 'bg-warning';
      case 'DELETE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getActionText(action: string): string {
    switch(action) {
      case 'ADD': return 'Añadido';
      case 'UPDATE': return 'Actualizado';
      case 'DELETE': return 'Eliminado';
      default: return action;
    }
  }

  clearHistory(): void {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.')) {
      this.logService.clearLogs();
      this.loadLogs();
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }

  getAddCount(): number {
    return this.logs.filter(l => l.action === 'ADD').length;
  }

  getUpdateCount(): number {
    return this.logs.filter(l => l.action === 'UPDATE').length;
  }

  getDeleteCount(): number {
    return this.logs.filter(l => l.action === 'DELETE').length;
  }
}
