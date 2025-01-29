import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductFormComponent } from './product-form/product-form.component';

export const PRODUCTS_ROUTES: Routes = [
  { path: '', component: ProductListComponent }, // List suppliers
  { path: 'new', component: ProductFormComponent }, // Create supplier
  { path: 'edit/:id', component: ProductFormComponent }, // Edit supplier
  { path: 'view/:id', component: ProductDetailComponent }, // View supplier details
];
