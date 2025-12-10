import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Game {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly STORAGE_KEY = 'catalog_games';
  
  private initialGames: Game[] = [
    { id: 1, name: 'Catan', price: 129.90, category: 'Estrategia', image: "assets/juegocatan.jpg" },
    { id: 2, name: 'Dixit', price: 99.90, category: 'Familiar', image: 'assets/dixit.webp' },
    { id: 3, name: 'Código Secreto', price: 89.90, category: 'Party', image: 'assets/codigosecreto.webp' },
    { id: 4, name: 'Clue', price: 119.90, category: 'Misterio', image: 'assets/clue.jpg' },
    { id: 5, name: 'Life', price: 109.90, category: 'Familiar', image: 'assets/life.jpg' },
    { id: 6, name: 'Monopoly', price: 139.90, category: 'Estrategia', image: 'assets/monopoly.webp' },
    { id: 7, name: 'Risk', price: 149.90, category: 'Estrategia', image: 'assets/risk.jpg' },
    { id: 8, name: 'Scrabble', price: 99.90, category: 'Palabras', image: 'assets/scrabble.jpg' }
  ];

  private gamesSubject: BehaviorSubject<Game[]>;
  public games$: Observable<Game[]>;

  constructor() {
    const storedGames = this.loadGames();
    this.gamesSubject = new BehaviorSubject<Game[]>(storedGames);
    this.games$ = this.gamesSubject.asObservable();
  }

  private loadGames(): Game[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [...this.initialGames];
  }

  private saveGames(games: Game[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
    this.gamesSubject.next(games);
  }

  getGames(): Game[] {
    return this.gamesSubject.value;
  }

  addGame(game: Omit<Game, 'id'>): Game {
    const games = this.getGames();
    const newId = games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1;
    const newGame: Game = { ...game, id: newId };
    
    const updatedGames = [...games, newGame];
    this.saveGames(updatedGames);
    
    return newGame;
  }

  updateGame(id: number, updates: Partial<Game>): boolean {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === id);
    
    if (index === -1) return false;
    
    const updatedGames = [...games];
    updatedGames[index] = { ...updatedGames[index], ...updates };
    this.saveGames(updatedGames);
    
    return true;
  }

  deleteGame(id: number): boolean {
    const games = this.getGames();
    const filteredGames = games.filter(g => g.id !== id);
    
    if (filteredGames.length === games.length) return false;
    
    this.saveGames(filteredGames);
    return true;
  }

  getGameById(id: number): Game | undefined {
    return this.getGames().find(g => g.id === id);
  }
}
