import { Injectable } from '@angular/core';
import { Return } from '../models/return';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private readonly STORAGE_KEY = 'product_returns';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private getReturns(): Return[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveReturns(returns: Return[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(returns));
  }

  private generateId(): string {
    return 'RET-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  
  requestReturn(
    purchaseId: string,
    userId: string,
    userEmail: string,
    productId: string,
    productName: string,
    quantity: number,
    reason: string,
    productState: 'nuevo' | 'dañado' | 'incompleto'
  ): Return {
    const returns = this.getReturns();
    const newReturn: Return = {
      id: this.generateId(),
      purchaseId,
      userId,
      userEmail,
      productId,
      productName,
      quantity,
      reason,
      productState,
      status: 'pendiente',
      requestDate: new Date()
    };
    returns.push(newReturn);
    this.saveReturns(returns);
    return newReturn;
  }

  
  getAllReturns(): Return[] {
    return this.getReturns().sort((a, b) => 
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );
  }

  
  getReturnsByUser(userId: string): Return[] {
    return this.getReturns().filter(r => r.userId === userId);
  }

  
  getPendingReturns(): Return[] {
    return this.getReturns().filter(r => r.status === 'pendiente');
  }

 
  updateReturnStatus(
    returnId: string,
    status: 'aprobada' | 'rechazada' | 'procesada',
    adminEmail: string,
    adminNotes?: string
  ): boolean {
    const returns = this.getReturns();
    const returnIndex = returns.findIndex(r => r.id === returnId);
    
    if (returnIndex !== -1) {
      returns[returnIndex].status = status;
      returns[returnIndex].resolutionDate = new Date();
      returns[returnIndex].adminEmail = adminEmail;
      if (adminNotes) {
        returns[returnIndex].adminNotes = adminNotes;
      }
      this.saveReturns(returns);
      return true;
    }
    return false;
  }

 
  getReturnById(returnId: string): Return | undefined {
    return this.getReturns().find(r => r.id === returnId);
  }


  getReturnStats(): {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    procesadas: number;
    porEstado: { [key: string]: number };
  } {
    const returns = this.getReturns();
    const stats = {
      total: returns.length,
      pendientes: returns.filter(r => r.status === 'pendiente').length,
      aprobadas: returns.filter(r => r.status === 'aprobada').length,
      rechazadas: returns.filter(r => r.status === 'rechazada').length,
      procesadas: returns.filter(r => r.status === 'procesada').length,
      porEstado: {
        nuevo: returns.filter(r => r.productState === 'nuevo').length,
        dañado: returns.filter(r => r.productState === 'dañado').length,
        incompleto: returns.filter(r => r.productState === 'incompleto').length
      }
    };
    return stats;
  }
}
