import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { prints: true, sales: true },
  });

  let totalPrinted = 0;
  let totalSold = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  let totalCogs = 0;
  let totalStockValue = 0;

  const productBreakdown = products.map((product) => {
    const printed = product.prints.reduce((sum, p) => sum + p.quantity, 0);
    const sold = product.sales.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = product.sales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
    const cost = product.prints.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
    const stock = printed - sold;
    const avgUnitCost = printed > 0 ? cost / printed : product.costPerUnit;
    const cogs = avgUnitCost * sold;
    const profit = revenue - cogs;

    totalPrinted += printed;
    totalSold += sold;
    totalRevenue += revenue;
    totalCost += cost;
    totalCogs += cogs;
    totalStockValue += stock * avgUnitCost;

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      printed,
      sold,
      stock,
      revenue,
      cost,
      profit,
    };
  });

  const printLogs = await prisma.printLog.findMany({ select: { quantity: true, unitCost: true, printedAt: true } });
  const saleLogs = await prisma.saleLog.findMany({ select: { quantity: true, unitPrice: true, soldAt: true } });

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const monthly = Object.fromEntries(
    months.map((m) => [m, { month: m, revenue: 0, cost: 0, profit: 0 }])
  );

  for (const p of printLogs) {
    const key = monthKey(new Date(p.printedAt));
    if (monthly[key]) {
      monthly[key].cost += p.quantity * p.unitCost;
    }
  }

  for (const s of saleLogs) {
    const key = monthKey(new Date(s.soldAt));
    if (monthly[key]) {
      monthly[key].revenue += s.quantity * s.unitPrice;
    }
  }

  for (const key of months) {
    monthly[key].profit = monthly[key].revenue - monthly[key].cost;
  }

  const topProfitable = [...productBreakdown].sort((a, b) => b.profit - a.profit).slice(0, 5);
  const lowStock = productBreakdown
    .filter((p) => p.stock <= (products.find((pr) => pr.id === p.id)?.minStock ?? 0))
    .sort((a, b) => a.stock - b.stock);

  return NextResponse.json({
    totals: {
      products: products.length,
      printed: totalPrinted,
      sold: totalSold,
      stock: totalPrinted - totalSold,
      revenue: totalRevenue,
      cost: totalCost,
      cogs: totalCogs,
      profit: totalRevenue - totalCogs,
      stockValue: totalStockValue,
    },
    monthly: months.map((m) => monthly[m]),
    topProfitable,
    lowStock,
  });
}
