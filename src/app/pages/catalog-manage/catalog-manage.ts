import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CatalogService, Game } from '../../services/catalog.service';
import { LogService } from '../../services/log.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-catalog-manage',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './catalog-manage.html',
  styleUrls: ['./catalog-manage.css']
})
export class CatalogManage implements OnInit {
  games: Game[] = [];
  editingGame: Game | null = null;
  isAdding: boolean = false;
  
  newGame = {
    name: '',
    price: 0,
    category: '',
    image: ''
  };

  categories = ['Estrategia', 'Familiar', 'Party', 'Misterio', 'Palabras', 'Aventura', 'Cooperativo'];

  constructor(
    private catalogService: CatalogService,
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

    this.loadGames();
  }

  private loadGames(): void {
    this.catalogService.games$.subscribe(games => {
      this.games = games;
    });
  }

  startAdding(): void {
    this.isAdding = true;
    this.editingGame = null;
    this.newGame = {
      name: '',
      price: 0,
      category: '',
      image: ''
    };
  }

  cancelAdding(): void {
    this.isAdding = false;
    this.newGame = {
      name: '',
      price: 0,
      category: '',
      image: ''
    };
  }

  addGame(): void {
    if (!this.newGame.name || !this.newGame.category || this.newGame.price <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const game = this.catalogService.addGame(this.newGame);
    
    this.logService.addLog(
      'ADD',
      game.id,
      game.name,
      `Nuevo juego añadido: ${game.name} - ${game.category} - S/ ${game.price}`
    );

    this.cancelAdding();
  }

  startEditing(game: Game): void {
    this.editingGame = { ...game };
    this.isAdding = false;
  }

  cancelEditing(): void {
    this.editingGame = null;
  }

  saveGame(): void {
    if (!this.editingGame) return;

    if (!this.editingGame.name || !this.editingGame.category || this.editingGame.price <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const oldGame = this.catalogService.getGameById(this.editingGame.id);
    
    this.catalogService.updateGame(this.editingGame.id, {
      name: this.editingGame.name,
      price: this.editingGame.price,
      category: this.editingGame.category,
      image: this.editingGame.image
    });

    this.logService.addLog(
      'UPDATE',
      this.editingGame.id,
      this.editingGame.name,
      `Juego actualizado de [${oldGame?.name} - ${oldGame?.category} - S/ ${oldGame?.price}] a [${this.editingGame.name} - ${this.editingGame.category} - S/ ${this.editingGame.price}]`
    );

    this.cancelEditing();
  }

  deleteGame(game: Game): void {
    if (confirm(`¿Estás seguro de eliminar "${game.name}" del catálogo?`)) {
      const success = this.catalogService.deleteGame(game.id);
      if (success) {
        this.logService.addLog(
          'DELETE',
          game.id,
          game.name,
          `Juego eliminado: ${game.name} - ${game.category} - S/ ${game.price}`
        );
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
