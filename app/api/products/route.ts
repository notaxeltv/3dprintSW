import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      prints: true,
      sales: true,
    },
  });

  const data = products.map((product) => {
    const printed = product.prints.reduce((sum, p) => sum + p.quantity, 0);
    const sold = product.sales.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = product.sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
    const cost = product.prints.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
    const stock = printed - sold;
    // Costo medio unitario ricavato dalle stampe registrate; se non ci sono
    // ancora stampe registrate, si usa il costo di listino del modello.
    const avgUnitCost = printed > 0 ? cost / printed : product.costPerUnit;
    const cogs = avgUnitCost * sold;
    const profit = revenue - cogs;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      material: product.material,
      printHours: product.printHours,
      costPerUnit: product.costPerUnit,
      price: product.price,
      minStock: product.minStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      stats: {
        printed,
        sold,
        stock,
        revenue,
        cost,
        cogs,
        profit,
      },
    };
  });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category || null,
      imageUrl: parsed.data.imageUrl || null,
      material: parsed.data.material || null,
      printHours: parsed.data.printHours ?? null,
      costPerUnit: parsed.data.costPerUnit,
      price: parsed.data.price,
      minStock: parsed.data.minStock ?? 0,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
