// src/app/domain/models/Kit.ts

export interface KitProduct {
    quantity: number;
    productId: string;
}
  
export interface KitPrice {
    price: number;
}
  
export interface Kit {
    id: string;
    name: string;
    status: boolean;
    description: string;
    createdAt: string;       // o Date si así lo manejas
    updatedAt: string;       // o Date si así lo manejas
    image: string | null;
    ProductKit: KitProduct[];
    KitPrice: KitPrice[];
}
