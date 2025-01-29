export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  mainImage?: string;
  images?: string[];
  supplierId: number;
}
