import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../_services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../_models/product';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductFormData } from '../../../_models/product-form-data';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  isEditMode = signal(false);
  productId?: number;
  existingProduct = signal<Product | null>(null);
  mainImagePreview = signal<string | null>(null);
  imagePreviews = signal<string[]>([]);

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    supplierId: [0, Validators.required],
    mainImage: null as File | null,
    images: null as File[] | null
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.existingProduct.set(product);
        this.mainImagePreview.set(product.mainImage);
        this.imagePreviews.set(product.images || []);
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          supplierId: product.supplierId,
        });
      },
      error: (err) => console.error('Error loading product:', err),
    });
  }

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.productForm.patchValue({ mainImage: file });
      this.generatePreview(file, true);
    }
  }

  // Update onImagesChange handler
onImagesChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (files) {
    this.productForm.patchValue({ images: Array.from(files) });
    this.generatePreviews(Array.from(files));
  }
}

  private generatePreview(file: File, isMainImage: boolean): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (isMainImage) {
        this.mainImagePreview.set(reader.result as string);
      } else {
        this.imagePreviews.update((previews) => [
          ...previews,
          reader.result as string,
        ]);
      }
    };
    reader.readAsDataURL(file);
  }

  private generatePreviews(files: File[]): void {
    this.imagePreviews.set([]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.update((previews) => [
          ...previews,
          reader.result as string,
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const formData: ProductFormData = {
      ...this.productForm.value,
      id: this.productId,
      mainImage: this.productForm.value.mainImage!,
      images: this.productForm.value.images || [] // Ensure array type
    };

    const operation = this.isEditMode()
      ? this.productService.updateProduct(this.productId!, formData)
      : this.productService.createProduct(formData);

    operation.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => console.error('Error saving product:', err),
    });
  }
}
