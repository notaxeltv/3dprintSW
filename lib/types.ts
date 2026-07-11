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

export interface Spool {
  id: string;
  name: string;
  material: string | null;
  price: number;
  weightGrams: number;
  createdAt: string;
}

export interface LabelOption {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface Keychain {
  id: string;
  name: string;
  price: number;
  createdAt: string;
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
  weightGrams: number | null;
  spoolId: string | null;
  spool?: Spool | null;
  labelOptionId: string | null;
  labelOption?: LabelOption | null;
  keychainId: string | null;
  keychain?: Keychain | null;
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
  electricityCostPerHour: number;
  spools?: Spool[];
  labelOptions?: LabelOption[];
  keychains?: Keychain[];
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
