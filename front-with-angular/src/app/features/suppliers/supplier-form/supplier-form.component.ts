import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SupplierService } from '../../../_services/supplier.service'; 
import { SupplierFormData } from '../../../_models/supplier-form-data';
import { map } from 'rxjs';

@Component({
  selector: 'app-supplier-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supplierService = inject(SupplierService);

  supplierId = toSignal(this.route.params.pipe(map(params => params['id'] ? +params['id'] : null)));
  isEditMode = computed(() => !!this.supplierId());
  existingLogoUrl = signal<string | undefined>(undefined);

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: [''],
    logoUrl: [null as File | null]
  });

  ngOnInit() {
    if (this.isEditMode() && this.supplierId()) {
      this.supplierService.getSupplier(this.supplierId()!).subscribe(supplier => {
        this.existingLogoUrl.set(supplier.logoUrl);
        this.supplierForm.patchValue({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address
        });
      });
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.supplierForm.patchValue({ logoUrl: file || null });
  }

  onSubmit() {
    if (this.supplierForm.valid) {
      const formValue = this.supplierForm.value;
      const formData: SupplierFormData = {
        id: this.isEditMode() ? this.supplierId()! : undefined,
        name: formValue.name!,
        email: formValue.email!,
        phone: formValue.phone!,
        address: formValue.address || undefined,
        logoUrl: formValue.logoUrl || undefined
      };

      this.supplierService.save(formData).subscribe({
        next: () => this.router.navigate(['/suppliers']),
        error: (err) => console.error('Error saving supplier:', err)
      });
    }
  }
}
