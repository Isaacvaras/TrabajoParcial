import { Component } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/user';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

    selectedAddressIndex: number | null = null;
  selectedPaymentMethod: string = '';
  showCardModal: boolean = false;
  showWalletModal: boolean = false;
  showCashModal: boolean = false;
  selectedWallet: string = '';
  cardData = {
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  };
  cashData = {
    phone: '',
    dni: '',
    acceptTerms: false
  };

  walletQRImages: { [key: string]: string } = {
    'yape': 'assets/qr-yape.jpg',
    'plin': 'assets/qr-plin.avif',
    'pagoefectivo': 'assets/qr-pagoefectivo.png'
  };
  constructor(
    public cartService: CartService,
    private auth: AuthService,
    private router: Router
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
      alert('Tu carrito está vacío.');
      return;
    }

    if (this.addresses.length === 0 || this.selectedAddressIndex === null) {
      alert('Selecciona o agrega una dirección antes de comprar.');
      return;
    }

    if (!this.selectedPaymentMethod) {
      alert('Selecciona un método de pago.');
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
      cvv: ''
    };
  }

  procesarPagoTarjeta() {
  
    if (!this.cardData.number || !this.cardData.holder || !this.cardData.expiry || !this.cardData.cvv) {
      alert('Por favor completa todos los datos de la tarjeta.');
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
      alert('Por favor selecciona una billetera digital.');
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
      acceptTerms: false
    };
  }

  confirmarContraentrega() {
    if (!this.cashData.phone || !this.cashData.dni) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (!this.cashData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones.');
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

    alert('Compra realizada. ¡Gracias por tu pedido!');
    this.cartService.clear();
    this.selectedPaymentMethod = '';
  }
}

