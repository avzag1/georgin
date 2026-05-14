import type { Product } from "@prisma/client"

interface ProductWithOrders {
  id: number;
  image: string;
  title: string;
  description: string;
  price: number;
  actionPrice: number;
  category: string;
  quantityInStore: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Описываем структуру вложенного массива, приходящего из API
  orderProducts: {
    id: number;
    productId: number;
    orderId: number;
    quantityInOrder: number;
    createdAt: string | Date;
    updatedAt: string | Date;
  }[];
}

export interface NewProduct {
  title: string
  description: string
  image: string
  price: number
  actionPrice: number
  category: string
  quantityInStore: number
}

export async function fetchProducts(): Promise<ProductWithOrders[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
  if (!res.ok) {
    throw new Error("404")
  }

  return await res.json()
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
  if (!res.ok) {
    throw new Error("404")
  }

  return await res.json()
}

export async function fetchSearchProducts(query: string = "") {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/search?query=${query}`)
  if (!res.ok) {
    throw new Error("404")
  }

  return await res.json()
}

export async function addNewProduct(newProduct: NewProduct) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct),
  })

  if (!response.ok) {
    throw new Error("Не удалось добавить товар")
  }

  const newProductResponse: NewProduct = await response.json()
  return newProductResponse
}
