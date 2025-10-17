export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE'
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: ProductType;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  type: ProductType;
}

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}