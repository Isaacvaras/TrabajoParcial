import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReturnService } from '../../services/return.service';
import { AuthService } from '../../services/auth.service';
import { Return } from '../../models/return';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './returns.html',
  styleUrls: ['./returns.css']
})
export class ReturnsComponent implements OnInit {
  returns: Return[] = [];
  filteredReturns: Return[] = [];
  selectedReturn: Return | null = null;
  filterStatus: string = 'todas';
  filterState: string = 'todos';
  stats: any = {};
  
  adminNotes: string = '';
  processingReturn: Return | null = null;

  constructor(
    private returnService: ReturnService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.isAdmin()) {
      this.router.navigate(['/home']);
      return;
    }
    this.loadReturns();
    this.loadStats();
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserData();
    return user?.correo === 'admin@gmail.com';
  }

  loadReturns(): void {
    this.returns = this.returnService.getAllReturns();
    this.applyFilters();
  }

  loadStats(): void {
    this.stats = this.returnService.getReturnStats();
  }

  applyFilters(): void {
    this.filteredReturns = this.returns.filter(ret => {
      const statusMatch = this.filterStatus === 'todas' || ret.status === this.filterStatus;
      const stateMatch = this.filterState === 'todos' || ret.productState === this.filterState;
      return statusMatch && stateMatch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  viewDetails(ret: Return): void {
    this.selectedReturn = ret;
  }

  closeDetails(): void {
    this.selectedReturn = null;
  }

  startProcessing(ret: Return): void {
    this.processingReturn = ret;
    this.adminNotes = ret.adminNotes || '';
  }

  approveReturn(): void {
    if (!this.processingReturn) return;
    
    const user = this.authService.currentUserData();
    if (user) {
      this.returnService.updateReturnStatus(
        this.processingReturn.id,
        'aprobada',
        user.correo,
        this.adminNotes
      );
      this.processingReturn = null;
      this.adminNotes = '';
      this.loadReturns();
      this.loadStats();
    }
  }

  rejectReturn(): void {
    if (!this.processingReturn) return;
    
    const user = this.authService.currentUserData();
    if (user) {
      this.returnService.updateReturnStatus(
        this.processingReturn.id,
        'rechazada',
        user.correo,
        this.adminNotes
      );
      this.processingReturn = null;
      this.adminNotes = '';
      this.loadReturns();
      this.loadStats();
    }
  }

  markAsProcessed(ret: Return): void {
    const user = this.authService.currentUserData();
    if (user) {
      this.returnService.updateReturnStatus(
        ret.id,
        'procesada',
        user.correo,
        'Devolución procesada y completada'
      );
      this.loadReturns();
      this.loadStats();
    }
  }

  cancelProcessing(): void {
    this.processingReturn = null;
    this.adminNotes = '';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pendiente': 'bg-warning',
      'aprobada': 'bg-success',
      'rechazada': 'bg-danger',
      'procesada': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getStateBadgeClass(state: string): string {
    const classes: { [key: string]: string } = {
      'nuevo': 'bg-primary',
      'dañado': 'bg-danger',
      'incompleto': 'bg-warning'
    };
    return classes[state] || 'bg-secondary';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
