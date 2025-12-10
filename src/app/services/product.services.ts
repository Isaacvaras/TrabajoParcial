import { Injectable } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private STORAGE_KEY = 'products';
  private products: Product[] = [];

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.products = JSON.parse(saved);
    } else {
this.products = [
  {
    id: 1,
    name: 'Catan',
    price: 150,
    stock: 5,
    category: 'Estrategia',
    image: 'assets/juegocatan.jpg',
  },
  {
    id: 2,
    name: 'Dixit',
    price: 100,
    stock: 6,
    category: 'Familiar',
    image: 'assets/dixit.webp',
  },
  {
    id: 3,
    name: 'Código Secreto',
    price: 90,
    stock: 1,
    category: 'Party',
    image: 'assets/codigosecreto.webp',
  },
  {
    id: 4,
    name: 'Clue',
    price: 80,
    stock: 5,
    category: 'Misterio',
    image: 'assets/clue.jpg',
  },
  {
    id: 5,
    name: 'Life',
    price: 100,
    stock: 5,
    category: 'Familiar',
    image: 'assets/life.jpg',
  },
  {
    id: 6,
    name: 'Monopoly',
    price: 80,
    stock: 2,
    category: 'Estrategia',
    image: 'assets/monopoly.webp',
  },
  {
    id: 7,
    name: 'Risk',
    price: 150,
    stock: 1,
    category: 'Estrategia',
    image: 'assets/risk.jpg',
  },
  {
    id: 8,
    name: 'Scrabble',
    price: 100,
    stock: 2,
    category: 'Palabras',
    image: 'assets/scrabble.jpg',
  },
];

      this.save();
    }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  decreaseStockForItems(items: { id: number; quantity: number }[]) {
    for (const item of items) {
      const product = this.getProductById(item.id);
      if (product) {
        product.stock = Math.max(product.stock - item.quantity, 0);
      }
    }
    this.save();
  }
  updateStock(productId: number, newStock: number) {
  const product = this.getProductById(productId);
  if (product) {
    product.stock = Math.max(0, newStock);
    this.save();
  }
}
addProduct(product: Omit<Product, 'id'>): Product {
    const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { ...product, id: newId };
    
    this.products.push(newProduct);
    this.save();
    
    return newProduct;
  }
  updateProduct(id: number, updates: Partial<Product>): boolean {
    const index = this.products.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    this.products[index] = { ...this.products[index], ...updates };
    this.save();
    
    return true;
  }
  deleteProduct(id: number): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    
    if (this.products.length === initialLength) return false;
    
    this.save();
    return true;
  }

}
