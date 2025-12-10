import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseService, Purchase } from '../../services/purchase.service';
import { AuthService } from '../../services/auth.service';
import { ReturnService } from '../../services/return.service';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-history.html',
  styleUrls: ['./purchase-history.css']
})
export class PurchaseHistoryComponent implements OnInit {
  purchases: Purchase[] = [];
  selectedPurchase: Purchase | null = null;
  
  // Para solicitar devolución
  showReturnModal: boolean = false;
  returnForm = {
    purchaseId: 0,
    productId: '',
    productName: '',
    quantity: 0,
    maxQuantity: 0,
    reason: '',
    productState: 'nuevo' as 'nuevo' | 'dañado' | 'incompleto'
  };

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private returnService: ReturnService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPurchases();
  }

  loadPurchases(): void {
    const user = this.authService.currentUserData();
    if (user) {
      this.purchases = this.purchaseService.getAll()
        .filter(p => p.userCorreo === user.correo)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
  }

  viewDetails(purchase: Purchase): void {
    this.selectedPurchase = purchase;
  }

  closeDetails(): void {
    this.selectedPurchase = null;
  }

  openReturnRequest(purchase: Purchase, productId: number, productName: string, quantity: number): void {
    this.returnForm = {
      purchaseId: purchase.id,
      productId: productId.toString(),
      productName,
      quantity: 1,
      maxQuantity: quantity,
      reason: '',
      productState: 'nuevo'
    };
    this.showReturnModal = true;
  }

  submitReturn(): void {
    if (!this.returnForm.reason.trim()) {
      alert('Por favor ingrese el motivo de la devolución');
      return;
    }

    if (this.returnForm.quantity < 1 || this.returnForm.quantity > this.returnForm.maxQuantity) {
      alert(`La cantidad debe ser entre 1 y ${this.returnForm.maxQuantity}`);
      return;
    }

    const user = this.authService.currentUserData();
    if (user) {
      this.returnService.requestReturn(
        this.returnForm.purchaseId.toString(),
        user.correo,
        user.correo,
        this.returnForm.productId,
        this.returnForm.productName,
        this.returnForm.quantity,
        this.returnForm.reason,
        this.returnForm.productState
      );

      alert('Solicitud de devolución enviada exitosamente. Será revisada por un administrador.');
      this.closeReturnModal();
    }
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
    this.returnForm = {
      purchaseId: 0,
      productId: '',
      productName: '',
      quantity: 0,
      maxQuantity: 0,
      reason: '',
      productState: 'nuevo'
    };
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalItems(purchase: Purchase): number {
    return purchase.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
