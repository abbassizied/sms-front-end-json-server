// product-detail.component.ts
import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../_services/product.service';
import { Product } from '../../../_models/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  product = signal<Product | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.route.snapshot.params['id'];
      if (!id) {
        this.handleNavigationError();
        return;
      }

      this.isLoading.set(true);
      this.productService.getProductById(+id).subscribe({
        next: (product) => {
          this.product.set(product);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.isLoading.set(false);
          this.handleNavigationError();
        },
      });
    });
  }

  private handleNavigationError(): void {
    this.router
      .navigate(['/products'])
      .catch((err) => console.error('Navigation failed:', err));
  }
}
