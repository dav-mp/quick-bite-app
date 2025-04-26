// src/app/application/adapters/ProductAdapter.ts

import { Product, ProductPrice } from "../../domain/models/product/Product";

/**
 * Adaptador para un solo precio
 */
function productPriceAdapter(rawPrice: any): ProductPrice {
  return {
    id: rawPrice.id,
    price: rawPrice.price,
    productId: rawPrice.productId,
    status: rawPrice.status,
    createdAt: rawPrice.createdAt,
    updatedAt: rawPrice.updatedAt,
  };
}

/**
 * Adaptador para un arreglo de precios
 */
function productPriceListAdapter(rawArray: any[]): ProductPrice[] {
  return rawArray.map((item) => productPriceAdapter(item));
}

/**
 * Adaptador principal para un producto
 */
export function productAdapter(rawData: any): Product {
  return {
    id: rawData.id,
    name: rawData.name,
    categoryId: rawData.categoryId,
    description: rawData.description,
    status: rawData.status,
    createdAt: rawData.createdAt,
    updatedAt: rawData.updatedAt,
    image: rawData.image,
    // Mapeo de los precios (si vienen en la respuesta)
    productPrices: rawData.ProductPrice
      ? productPriceListAdapter(rawData.ProductPrice)
      : [],
  };
}

/**
 * Adaptador para un arreglo de productos
 */
export function productListAdapter(rawArray: any[]): Product[] {
  return rawArray.map((item) => productAdapter(item));
}
