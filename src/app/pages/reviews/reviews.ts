import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.css']
})
export class Reviews implements OnInit {
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  isAdmin: boolean = false;
  filterStatus: string = 'ALL'; 
  
  replyingToReview: Review | null = null;
  replyMessage: string = '';

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminRole();
    this.loadReviews();
  }

  private checkAdminRole(): void {
    const currentUser = this.authService.currentUserData();
    this.isAdmin = currentUser?.correo === 'admin@gmail.com';
  }

  private loadReviews(): void {
    this.reviews = this.reviewService.getAllReviews();
    this.applyFilter();
  }

  applyFilter(): void {
    switch(this.filterStatus) {
      case 'PENDING':
        this.filteredReviews = this.reviews.filter(r => !r.adminResponse);
        break;
      case 'ANSWERED':
        this.filteredReviews = this.reviews.filter(r => r.adminResponse);
        break;
      default:
        this.filteredReviews = this.reviews;
    }
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  startReply(review: Review): void {
    this.replyingToReview = review;
    this.replyMessage = '';
  }

  cancelReply(): void {
    this.replyingToReview = null;
    this.replyMessage = '';
  }

  submitReply(): void {
    if (!this.replyingToReview || !this.replyMessage.trim()) {
      alert('Por favor escribe una respuesta.');
      return;
    }

    const success = this.reviewService.addAdminResponse(
      this.replyingToReview.id,
      this.replyMessage,
      'Administrador de Almacen'
    );

    if (success) {
      this.loadReviews();
      this.cancelReply();
    }
  }

  deleteReview(review: Review): void {
    if (confirm(`¿Estás seguro de eliminar la reseña de ${review.userName}?`)) {
      const success = this.reviewService.deleteReview(review.id);
      if (success) {
        this.loadReviews();
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }

  getPendingCount(): number {
    return this.reviews.filter(r => !r.adminResponse).length;
  }

  getAnsweredCount(): number {
    return this.reviews.filter(r => r.adminResponse).length;
  }
}
