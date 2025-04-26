// src/app/domain/models/Product.ts

export interface ProductPrice {
    id: string;
    price: number;
    productId: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    image: string | null;
  
    // Nuevo campo para manejar precios relacionados al producto
    productPrices?: ProductPrice[]; 
  }
  