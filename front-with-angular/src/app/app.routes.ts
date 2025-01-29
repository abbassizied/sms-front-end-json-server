import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/suppliers', pathMatch: 'full' },
    { path: 'suppliers', loadChildren: () => import('./features/suppliers/suppliers.routes').then(m => m.SUPPLIERS_ROUTES) }, 
    { path: 'products', loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES) },   
    { path: '', redirectTo: '/suppliers', pathMatch: 'full' } // Default route  
];
