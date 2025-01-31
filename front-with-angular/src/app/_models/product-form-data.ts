export interface ProductFormData {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  supplierId: number;
  mainImageUrl: File;
  imagesUrl?: File[];
}
