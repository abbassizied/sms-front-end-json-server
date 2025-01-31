import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink  } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../../../_models/product';
import { ProductService } from '../../../_services/product.service';
import { ProductFormData } from '../../../_models/product-form-data';
import { SupplierService } from '../../../_services/supplier.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly supplierService = inject(SupplierService);

  // Convert the observable to a signal
  suppliers = toSignal(this.supplierService.getSuppliers(), {
    initialValue: [],
  });

  isEditMode = signal(false);
  productId = signal<number | null>(null);
  existingProduct = signal<Product | null>(null);
  mainImagePreview = signal<string | null>(null);
  imagePreviews = signal<string[]>([]);

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    supplierId: [0, [Validators.required, Validators.min(1)]],
    mainImage: null as File | null,
    images: null as File[] | null,
  });

  constructor() {
    // You can access suppliers as a signal now
    console.log('Initial suppliers:', this.suppliers());
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.productId.set(+id);
      this.isEditMode.set(true);
      this.loadProduct(this.productId()!);
    }
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.existingProduct.set(product);
        this.mainImagePreview.set(product.mainImageUrl ?? null);
        this.imagePreviews.set(product.imagesUrl || []);
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          supplierId: product.supplierId,
        });
      },
      error: () => {
        // Handle navigation promise properly
        this.router.navigate(['/products']).catch(err => 
          console.error('Navigation failed:', err)
        );
      }
    });
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

  private generateMainPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.mainImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  private generateAdditionalPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviews.update((previews) => [
        ...previews,
        reader.result as string,
      ]);
    };
    reader.readAsDataURL(file);
  }

  // Update the calls in event handlers:
  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.productForm.patchValue({ mainImage: file });
      this.generateMainPreview(file); // Changed to specific method
    }
  }

  private generatePreviews(files: File[]): void {
    this.imagePreviews.set([]);
    files.forEach((file) => {
      this.generateAdditionalPreview(file); // Changed to specific method
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const formData = this.createFormData();
    const operation = this.isEditMode()
      ? this.productService.updateProduct(this.productId()!, formData)
      : this.productService.createProduct(formData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/products']).catch(err => 
          console.error('Navigation failed:', err)
        );
      },
      error: (err) => console.error('Error saving product:', err)
    });
  }

  private createFormData(): ProductFormData {
    const formValue = this.productForm.getRawValue();
    return {
      id: this.productId() ?? undefined,
      name: formValue.name!,
      description: formValue.description!,
      price: formValue.price!,
      quantity: formValue.quantity!,
      supplierId: formValue.supplierId!,
      mainImageUrl: formValue.mainImage!,
      imagesUrl: formValue.images ?? [],
    };
  }
}
