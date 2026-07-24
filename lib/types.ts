export interface ProductStats {
  printed: number;
  sold: number;
  stock: number;
  revenue: number;
  cost: number;
  cogs: number;
  profit: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  label: string | null;
  height: number;
  width: number;
  depth: number;
  price: number;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  imageUrl: string | null;
  material: string | null;
  printHours: number | null;
  costPerUnit: number;
  price: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
  stats: ProductStats;
  variants?: ProductVariant[];
}

export interface Settings {
  companyName: string;
  logoUrl: string | null;
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

export interface ShopDashboardStats {
  totals: {
    sold: number;
    revenue: number;
    purchases: number;
    margin: number;
  };
  monthly: { month: string; revenue: number; purchases: number; margin: number; sold: number }[];
  topSold: {
    id: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
    sold: number;
    revenue: number;
    purchases: number;
    margin: number;
  }[];
}

export interface ShopSaleLog {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitWholesalePrice: number;
  unitRetailPrice: number;
  soldAt: string;
  buyer: string | null;
  notes: string | null;
  product: { id: string; name: string; imageUrl: string | null };
  variant: { id: string; label: string | null } | null;
}

export interface ShopOrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitWholesalePrice: number;
}

export interface ShopOrder {
  id: string;
  shopId: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  total: number;
  items: ShopOrderItem[];
  shop?: { id: string; name: string };
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
