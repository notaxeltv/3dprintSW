export interface ProductStats {
  printed: number;
  sold: number;
  stock: number;
  revenue: number;
  cost: number;
  cogs: number;
  profit: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  material: string | null;
  printHours: number | null;
  costPerUnit: number;
  price: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
  stats: ProductStats;
}

export interface PrintLog {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  printedAt: string;
  notes: string | null;
  product: { id: string; name: string; imageUrl: string | null };
}

export interface SaleLog {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  soldAt: string;
  buyer: string | null;
  notes: string | null;
  product: { id: string; name: string; imageUrl: string | null };
}

export interface DashboardStats {
  totals: {
    products: number;
    printed: number;
    sold: number;
    stock: number;
    revenue: number;
    cost: number;
    cogs: number;
    profit: number;
    stockValue: number;
  };
  monthly: { month: string; revenue: number; cost: number; profit: number }[];
  topProfitable: {
    id: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
    printed: number;
    sold: number;
    stock: number;
    revenue: number;
    cost: number;
    profit: number;
  }[];
  lowStock: {
    id: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
    printed: number;
    sold: number;
    stock: number;
    revenue: number;
    cost: number;
    profit: number;
  }[];
}
