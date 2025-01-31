export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  mainImageUrl?: string;
  imagesUrl?: string[];
  supplierId: number;
}
