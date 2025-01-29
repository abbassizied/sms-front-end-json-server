export interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  mainImage?: File;
  images?: File[];
  supplierId: number;
}
