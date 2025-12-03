import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NgFor } from '@angular/common';

interface Game {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgFor, RouterModule],
  templateUrl: './catalog.html'
})
export class Catalog {
   games: Game[] = [
    { id: 1, name: 'Catan', price: 129.90, category: 'Estrategia', image: "assets/juegocatan.jpg" },
    { id: 2, name: 'Dixit', price: 99.90, category: 'Familiar', image: 'assets/dixit.webp' },
    { id: 3, name: 'Código Secreto', price: 89.90, category: 'Party', image: 'assets/codigosecreto.webp' },
    { id: 4, name: 'Clue', price: 119.90, category: 'Misterio', image: 'assets/clue.jpg' },
    { id: 5, name: 'Life', price: 109.90, category: 'Familiar', image: 'assets/life.jpg' },
    { id: 6, name: 'Monopoly', price: 139.90, category: 'Estrategia', image: 'assets/monopoly.webp' },
    { id: 7, name: 'Risk', price: 149.90, category: 'Estrategia', image: 'assets/risk.jpg' },
    { id: 8, name: 'Scrabble', price: 99.90, category: 'Palabras', image: 'assets/scrabble.jpg' }
  ];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  addToCart(game: Game) {
    if (!this.authService.isLoggedIn()) {
    
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addItem({
      id: game.id,
      name: game.name,
      price: game.price
    });
  }
}

