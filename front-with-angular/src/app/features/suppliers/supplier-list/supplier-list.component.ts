import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Supplier } from '../../../_models/supplier';
import { SupplierService } from '../../../_services/supplier.service';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-list.component.html',
})
export class SupplierListComponent {
  
  private readonly supplierService = inject(SupplierService);
  
  // Reactive state with signals
  suppliers = signal<Supplier[]>([]);

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => this.suppliers.set(data),
      error: (err) => console.error('Failed to load suppliers:', err)
    });
  }

  deleteSupplier(id: number) {
    if(confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => this.loadSuppliers(),
        error: (err) => console.error('Failed to delete supplier:', err)
      });
    }
  }
}