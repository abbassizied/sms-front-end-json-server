import { Routes } from '@angular/router';
import { SupplierListComponent } from './supplier-list/supplier-list.component';
import { SupplierDetailComponent } from './supplier-detail/supplier-detail.component'; 
import { SupplierFormComponent } from './supplier-form/supplier-form.component';

export const SUPPLIERS_ROUTES: Routes = [
  { path: '', component: SupplierListComponent }, // List suppliers
  { path: 'new', component: SupplierFormComponent }, // Create supplier
  { path: 'edit/:id', component: SupplierFormComponent }, // Edit supplier
  { path: 'view/:id', component: SupplierDetailComponent } // View supplier details
];