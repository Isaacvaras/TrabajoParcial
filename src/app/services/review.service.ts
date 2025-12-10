import { Injectable } from '@angular/core';

export interface Review {
  id: string;
  gameId: number;
  gameName: string;
  userId: string;
  userName: string;
  rating: number; 
  comment: string;
  timestamp: Date;
  adminResponse?: {
    message: string;
    timestamp: Date;
    adminName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly STORAGE_KEY = 'game_reviews';

  constructor() {}

  private loadReviews(): Review[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const reviews = JSON.parse(stored);
      return reviews.map((review: any) => ({
        ...review,
        timestamp: new Date(review.timestamp),
        adminResponse: review.adminResponse ? {
          ...review.adminResponse,
          timestamp: new Date(review.adminResponse.timestamp)
        } : undefined
      }));
    }
    return [];
  }

  private saveReviews(reviews: Review[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
  }

  addReview(gameId: number, gameName: string, userId: string, userName: string, rating: number, comment: string): Review {
    const reviews = this.loadReviews();
    
    const newReview: Review = {
      id: this.generateId(),
      gameId,
      gameName,
      userId,
      userName,
      rating,
      comment,
      timestamp: new Date()
    };

    reviews.unshift(newReview);
    this.saveReviews(reviews);
    
    return newReview;
  }

  addAdminResponse(reviewId: string, message: string, adminName: string): boolean {
    const reviews = this.loadReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) return false;
    
    review.adminResponse = {
      message,
      timestamp: new Date(),
      adminName
    };

    this.saveReviews(reviews);
    return true;
  }

  getReviewsByGame(gameId: number): Review[] {
    return this.loadReviews().filter(r => r.gameId === gameId);
  }

  getAllReviews(): Review[] {
    return this.loadReviews();
  }

  getReviewById(id: string): Review | undefined {
    return this.loadReviews().find(r => r.id === id);
  }

  getAverageRating(gameId: number): number {
    const reviews = this.getReviewsByGame(gameId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }

  getPendingReviews(): Review[] {
    return this.loadReviews().filter(r => !r.adminResponse);
  }

  deleteReview(reviewId: string): boolean {
    const reviews = this.loadReviews();
    const filteredReviews = reviews.filter(r => r.id !== reviewId);
    
    if (filteredReviews.length === reviews.length) return false;
    
    this.saveReviews(filteredReviews);
    return true;
  }

  private generateId(): string {
    return `REV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
