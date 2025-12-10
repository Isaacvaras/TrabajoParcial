export interface Return {
  id: string;
  purchaseId: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  productState: 'nuevo' | 'dañado' | 'incompleto';
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'procesada';
  requestDate: Date;
  resolutionDate?: Date;
  adminNotes?: string;
  adminEmail?: string;
}
