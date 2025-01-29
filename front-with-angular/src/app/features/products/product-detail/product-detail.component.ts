import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../../_services/product.service';
import { Product } from '../../../_models/product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  product = signal<Product | undefined>(undefined);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data) => this.product.set(data),
        error: (err) => console.error('Error loading product:', err),
      });
    }
  }
}
