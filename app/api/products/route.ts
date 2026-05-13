import prisma from "../../lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const products = await prisma.product.findMany({
    include: { orderProducts: true },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const { title, description, image, price, actionPrice, category, quantityInStore } = await req.json()

  try {
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        image,
        price, 
        actionPrice, 
        category, 
        quantityInStore
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Не удалось добавить новый продукт" }, { status: 500 })
  }
}
