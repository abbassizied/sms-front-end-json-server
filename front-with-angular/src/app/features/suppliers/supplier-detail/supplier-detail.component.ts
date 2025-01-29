import { Component, inject, signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SupplierService } from '../../../_services/supplier.service';
import type { Supplier } from '../../../_models/supplier'; 

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-detail.component.html',
  styleUrl: './supplier-detail.component.css'
})
export class SupplierDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly supplierService = inject(SupplierService);

  // Reactive state with signals
  supplier = signal<Supplier | undefined>(undefined);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Get route params as signal
  private readonly params = toSignal(this.route.params);
  
  // Compute ID from route params
  private readonly idSignal = computed(() => {
    const params = this.params();
    return params ? Number(params['id']) : null;
  });

  constructor() {
    // Reactive data loading effect
    effect((onCleanup) => {
      const id = this.idSignal();
      if (!id) return;

      this.isLoading.set(true);
      this.error.set(null);

      const sub = this.supplierService.getSupplier(id).subscribe({
        next: (data) => {
          this.supplier.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Supplier not found!');
          this.isLoading.set(false);
        }
      });

      onCleanup(() => sub.unsubscribe());
    });
  }
}
