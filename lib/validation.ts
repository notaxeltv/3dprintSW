import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio"),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  material: z.string().trim().optional().nullable(),
  printHours: z.coerce.number().min(0).optional().nullable(),
  costPerUnit: z.coerce.number().min(0, "Il costo non può essere negativo"),
  price: z.coerce.number().min(0, "Il prezzo non può essere negativo"),
  minStock: z.coerce.number().int().min(0).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

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
