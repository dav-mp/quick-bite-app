// src/app/domain/models/Product.ts

export interface Product {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    image: string | null;
}
  