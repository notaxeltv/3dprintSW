import { NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireShop();
  if (!session?.shopId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const sales = await prisma.shopSaleLog.findMany({
    where: { shopId: session.shopId },
    include: {
      product: { select: { id: true, name: true, category: true, imageUrl: true } },
    },
  });

  let totalSold = 0;
  let totalRevenue = 0;
  let totalPurchases = 0;

  const productMap = new Map<
    string,
    {
      id: string;
      name: string;
      category: string | null;
      imageUrl: string | null;
      sold: number;
      revenue: number;
      purchases: number;
      margin: number;
    }
  >();

  for (const sale of sales) {
    const revenue = sale.quantity * sale.unitRetailPrice;
    const purchases = sale.quantity * sale.unitWholesalePrice;
    const margin = revenue - purchases;

    totalSold += sale.quantity;
    totalRevenue += revenue;
    totalPurchases += purchases;

    const existing = productMap.get(sale.product.id);
    if (existing) {
      existing.sold += sale.quantity;
      existing.revenue += revenue;
      existing.purchases += purchases;
      existing.margin += margin;
    } else {
      productMap.set(sale.product.id, {
        id: sale.product.id,
        name: sale.product.name,
        category: sale.product.category,
        imageUrl: sale.product.imageUrl,
        sold: sale.quantity,
        revenue,
        purchases,
        margin,
      });
    }
  }

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const monthly = Object.fromEntries(
    months.map((m) => [m, { month: m, revenue: 0, purchases: 0, margin: 0, sold: 0 }])
  );

  for (const sale of sales) {
    const key = monthKey(new Date(sale.soldAt));
    if (!monthly[key]) continue;
    const revenue = sale.quantity * sale.unitRetailPrice;
    const purchases = sale.quantity * sale.unitWholesalePrice;
    monthly[key].revenue += revenue;
    monthly[key].purchases += purchases;
    monthly[key].margin += revenue - purchases;
    monthly[key].sold += sale.quantity;
  }

  const topSold = [...productMap.values()].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return NextResponse.json({
    totals: {
      sold: totalSold,
      revenue: totalRevenue,
      purchases: totalPurchases,
      margin: totalRevenue - totalPurchases,
    },
    monthly: months.map((m) => monthly[m]),
    topSold,
  });
}
