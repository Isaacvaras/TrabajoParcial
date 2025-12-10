import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Alerts } from '../../utils/alerts';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.services';
import { LogService } from '../../services/log.service';
import { FormsModule} from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, DecimalPipe, FormsModule],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css'],
})
export class Catalog implements OnInit {
  selectedCategory: string = 'Todas';
  categories: string[] = [];
  searchText: string = '';
  products: Product[] = [];
  isAdmin: boolean = false;
  showAddForm: boolean = false;
  editingGame: Product | null = null;
  
  newGame = {
    name: '',
    price: 0,
    category: '',
    image: '',
    stock: 10
  };

  categoryOptions = ['Estrategia', 'Familiar', 'Party', 'Misterio', 'Palabras', 'Aventura', 'Cooperativo'];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService,
    private logService: LogService,
    private router: Router
  ) {
    this.products = this.productService.getProducts();
    this.categories = ['Todas', ...new Set(this.products.map((p) => p.category))];
  }

  ngOnInit(): void {
    this.checkAdminRole();
  }

  private checkAdminRole(): void {
    const currentUser = this.authService.currentUserData();
    this.isAdmin = currentUser?.correo === 'admin@gmail.com';
  }

  addToCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const currentQtyInCart =
      this.cartService.getItems().find((i) => i.id === product.id)?.quantity ?? 0;

    const stockDisponible = product.stock;

    if (currentQtyInCart >= stockDisponible) {
      Alerts.warning('No hay más stock disponible de este producto.');
      return;
    }

    this.cartService.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  }
get filteredProducts() {
  let result = this.products;

  if (this.selectedCategory !== 'Todas') {
    result = result.filter(
      p => p.category === this.selectedCategory
    );
  }

  if (this.searchText.trim()) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  return result;
}

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.editingGame = null;
      this.resetNewGame();
    }
  }

  resetNewGame(): void {
    this.newGame = {
      name: '',
      price: 0,
      category: '',
      image: '',
      stock: 10
    };
  }

  addGame(): void {
    if (!this.isAdmin || !this.newGame.name || !this.newGame.category || this.newGame.price <= 0) {
      Alerts.warning('Por favor completa todos los campos correctamente');
      return;
    }

    const game = this.productService.addProduct(this.newGame);
    
    this.logService.addLog(
      'ADD',
      game.id,
      game.name,
      `Nuevo juego añadido: ${game.name} - ${game.category} - S/ ${game.price}`
    );

    this.products = this.productService.getProducts();
    this.resetNewGame();
    this.showAddForm = false;
  }

  startEditing(game: Product): void {
    if (!this.isAdmin) return;
    this.editingGame = { ...game };
    this.showAddForm = false;
  }

  cancelEditing(): void {
    this.editingGame = null;
  }

  saveGame(): void {
    if (!this.editingGame || !this.isAdmin) return;

    if (!this.editingGame.name || !this.editingGame.category || this.editingGame.price <= 0) {
      Alerts.warning('Por favor completa todos los campos correctamente');
      return;
    }

    const oldGame = this.productService.getProductById(this.editingGame.id);
    
    this.productService.updateProduct(this.editingGame.id, {
      name: this.editingGame.name,
      price: this.editingGame.price,
      category: this.editingGame.category,
      image: this.editingGame.image,
      stock: this.editingGame.stock
    });

    this.logService.addLog(
      'UPDATE',
      this.editingGame.id,
      this.editingGame.name,
      `Juego actualizado de [${oldGame?.name} - ${oldGame?.category} - S/ ${oldGame?.price}] a [${this.editingGame.name} - ${this.editingGame.category} - S/ ${this.editingGame.price}]`
    );

    this.products = this.productService.getProducts();
    this.cancelEditing();
  }

  deleteGame(game: Product): void {
    if (!this.isAdmin) return;
    
    if (confirm(`¿Estás seguro de eliminar "${game.name}" del catálogo?`)) {
      const success = this.productService.deleteProduct(game.id);
      if (success) {
        this.logService.addLog(
          'DELETE',
          game.id,
          game.name,
          `Juego eliminado del catálogo: ${game.name} - ${game.category} - S/ ${game.price}`
        );
        
        this.products = this.productService.getProducts();
        
        if (this.editingGame?.id === game.id) {
          this.cancelEditing();
        }
      }
    }
  }

  navigateToHistory(): void {
    this.router.navigate(['/catalog/history']);
  }

  navigateToReviews(): void {
    this.router.navigate(['/reviews']);
  }

}
