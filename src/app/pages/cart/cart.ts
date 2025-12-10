import { Component } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/user';
import { PurchaseService } from '../../services/purchase.service';
import { ProductService } from '../../services/product.services';
import { Alerts } from '../../utils/alerts';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  selectedAddressIndex: number | null = null;
  selectedPaymentMethod: string = '';
  showCardModal: boolean = false;
  showWalletModal: boolean = false;
  showCashModal: boolean = false;
  showReviewModal: boolean = false;
  selectedWallet: string = '';
  purchasedItems: CartItem[] = [];
  reviewData = {
    gameId: 0,
    gameName: '',
    rating: 0,
    comment: '',
  };
  cardData = {
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  };
  cashData = {
    phone: '',
    dni: '',
    acceptTerms: false,
  };

  walletQRImages: { [key: string]: string } = {
    yape: 'assets/qr-yape.jpg',
    plin: 'assets/qr-plin.avif',
    pagoefectivo: 'assets/qr-pagoefectivo.png',
  };
  constructor(
    public cartService: CartService,
    private auth: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private purchaseService: PurchaseService,
    private productService: ProductService
  ) {
    if (this.addresses.length > 0) {
      this.selectedAddressIndex = 0;
    }
  }

  get items(): CartItem[] {
    return this.cartService.getItems();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  get extraWrapPrice(): number {
    return this.cartService.extraWrapPrice;
  }

  get addresses(): Address[] {
    return this.auth.getAddresses();
  }

  onQuantityChange(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    this.cartService.updateQuantity(item, newQty);
  }

  onFragileChange(item: CartItem, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.cartService.setFragile(item, checked);
  }

  onExtraWrapChange(item: CartItem, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.cartService.setExtraWrap(item, checked);
  }
  quitarItem(item: CartItem) {
    this.cartService.removeItem(item);
  }
  irADireccion() {
    this.router.navigate(['/direccion']);
  }

  finalizarCompra() {
    if (this.items.length === 0) {
      Alerts.warning('Tu carrito está vacío.');
      return;
    }

    if (this.addresses.length === 0 || this.selectedAddressIndex === null) {
      Alerts.warning('Selecciona o agrega una dirección antes de comprar.');
      return;
    }

    if (!this.selectedPaymentMethod) {
      Alerts.warning('Selecciona un método de pago.');
      return;
    }

    if (this.selectedPaymentMethod === 'tarjeta') {
      this.showCardModal = true;
      return;
    }

    if (this.selectedPaymentMethod === 'billetera') {
      this.showWalletModal = true;
      return;
    }

    if (this.selectedPaymentMethod === 'contraentrega') {
      this.showCashModal = true;
      return;
    }

    this.completarCompra();
  }

  closeCardModal() {
    this.showCardModal = false;
    this.cardData = {
      number: '',
      holder: '',
      expiry: '',
      cvv: '',
    };
  }

  procesarPagoTarjeta() {
    if (
      !this.cardData.number ||
      !this.cardData.holder ||
      !this.cardData.expiry ||
      !this.cardData.cvv
    ) {
      Alerts.warning('Por favor completa todos los datos de la tarjeta.');
      return;
    }

    console.log('Procesando pago con tarjeta:', this.cardData);
    this.closeCardModal();
    this.completarCompra();
  }

  closeWalletModal() {
    this.showWalletModal = false;
    this.selectedWallet = '';
  }

  selectWallet(wallet: string) {
    this.selectedWallet = wallet;
  }

  confirmarPagoBilletera() {
    if (!this.selectedWallet) {
      Alerts.warning('Por favor selecciona una billetera digital.');
      return;
    }

    console.log('Pago realizado con:', this.selectedWallet);
    this.closeWalletModal();
    this.completarCompra();
  }

  closeCashModal() {
    this.showCashModal = false;
    this.cashData = {
      phone: '',
      dni: '',
      acceptTerms: false,
    };
  }

  confirmarContraentrega() {
    if (!this.cashData.phone || !this.cashData.dni) {
      Alerts.warning('Por favor completa todos los campos.');
      return;
    }

    if (!this.cashData.acceptTerms) {
      Alerts.warning('Debes aceptar los términos y condiciones.');
      return;
    }

    console.log('Pago contraentrega confirmado:', this.cashData);
    this.closeCashModal();
    this.completarCompra();
  }

  private completarCompra() {
    const direccionElegida = this.addresses[this.selectedAddressIndex!];
    console.log('Compra realizada con envío a:', direccionElegida);
    console.log('Método de pago:', this.selectedPaymentMethod);
    const user = this.auth.getCurrentUser();
    if (!user) {
      Alerts.warning('Debes iniciar sesión para comprar.');
      this.router.navigate(['/login']);
      return;
    }
    this.purchaseService.addPurchase(user, this.items, direccionElegida, this.total);

    this.productService.decreaseStockForItems(
      this.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }))
    );

    this.purchasedItems = [...this.items];

    Alerts.success('Compra realizada. ¡Gracias por tu pedido!');
    this.cartService.clear();
    this.selectedPaymentMethod = '';

    if (this.purchasedItems.length > 0) {
      this.openReviewModal(this.purchasedItems[0]);
    }
  }
  openReviewModal(item: CartItem): void {
    this.reviewData = {
      gameId: item.id,
      gameName: item.name,
      rating: 0,
      comment: '',
    };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.reviewData = {
      gameId: 0,
      gameName: '',
      rating: 0,
      comment: '',
    };
  }

  setRating(rating: number): void {
    this.reviewData.rating = rating;
  }

  submitReview(): void {
    if (this.reviewData.rating === 0) {
      alert('Por favor selecciona una calificación.');
      return;
    }

    if (!this.reviewData.comment.trim()) {
      alert('Por favor escribe un comentario.');
      return;
    }

    const currentUser = this.auth.currentUserData();
    if (!currentUser) return;

    this.reviewService.addReview(
      this.reviewData.gameId,
      this.reviewData.gameName,
      currentUser.correo,
      currentUser.nombre,
      this.reviewData.rating,
      this.reviewData.comment
    );

    alert('¡Gracias por tu reseña!');

    const currentIndex = this.purchasedItems.findIndex((i) => i.id === this.reviewData.gameId);
    if (currentIndex >= 0 && currentIndex < this.purchasedItems.length - 1) {
      const nextItem = this.purchasedItems[currentIndex + 1];
      this.closeReviewModal();
      setTimeout(() => this.openReviewModal(nextItem), 500);
    } else {
      this.purchasedItems = [];
      this.closeReviewModal();
    }
  }

  skipReview(): void {
    const currentIndex = this.purchasedItems.findIndex((i) => i.id === this.reviewData.gameId);

    if (currentIndex >= 0 && currentIndex < this.purchasedItems.length - 1) {
      const nextItem = this.purchasedItems[currentIndex + 1];
      this.closeReviewModal();
      setTimeout(() => this.openReviewModal(nextItem), 500);
    } else {
      this.purchasedItems = [];
      this.closeReviewModal();
    }
  }
}
