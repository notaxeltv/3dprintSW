import { z } from "zod";

export const productVariantSchema = z.object({
  label: z.string().trim().optional().nullable(),
  height: z.coerce.number().min(0, "Non può essere negativa"),
  width: z.coerce.number().min(0, "Non può essere negativa"),
  depth: z.coerce.number().min(0, "Non può essere negativa"),
  price: z.coerce.number().min(0, "Non può essere negativo"),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio"),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  subcategory: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  material: z.string().trim().optional().nullable(),
  printHours: z.coerce.number().min(0).optional().nullable(),
  costPerUnit: z.coerce.number().min(0, "Il costo non può essere negativo"),
  price: z.coerce.number().min(0, "Il prezzo non può essere negativo"),
  minStock: z.coerce.number().int().min(0).optional(),
  variants: z.array(productVariantSchema).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const settingsSchema = z.object({
  companyName: z.string().trim().min(1, "Il nome dell'azienda è obbligatorio"),
  logoUrl: z.string().trim().optional().nullable(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const printLogSchema = z.object({
  productId: z.string().min(1, "Seleziona un modello"),
  quantity: z.coerce.number().int().positive("La quantità deve essere maggiore di 0"),
  unitCost: z.coerce.number().min(0).optional(),
  printedAt: z.string().optional(),
  notes: z.string().trim().optional().nullable(),
});

export type PrintLogInput = z.infer<typeof printLogSchema>;

export const saleLogSchema = z.object({
  productId: z.string().min(1, "Seleziona un modello"),
  quantity: z.coerce.number().int().positive("La quantità deve essere maggiore di 0"),
  unitPrice: z.coerce.number().min(0).optional(),
  soldAt: z.string().optional(),
  buyer: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type SaleLogInput = z.infer<typeof saleLogSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username obbligatorio"),
  password: z.string().min(1, "Password obbligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const shopCreateSchema = z.object({
  name: z.string().trim().min(1, "Il nome del negozio è obbligatorio"),
  username: z.string().trim().min(3, "Username di almeno 3 caratteri"),
  password: z.string().min(6, "Password di almeno 6 caratteri"),
});

export type ShopCreateInput = z.infer<typeof shopCreateSchema>;

export const shopUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  username: z.string().trim().min(3).optional(),
  password: z.string().min(6).optional(),
  active: z.boolean().optional(),
});

export type ShopUpdateInput = z.infer<typeof shopUpdateSchema>;

export const shopMarkupSchema = z.object({
  productId: z.string().min(1),
  markupPercent: z.coerce.number().min(0, "Il ricarico non può essere negativo"),
});

export type ShopMarkupInput = z.infer<typeof shopMarkupSchema>;
