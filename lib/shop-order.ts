export const SHOP_ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type ShopOrderStatus = (typeof SHOP_ORDER_STATUSES)[number];

export const SHOP_ORDER_STATUS_LABELS: Record<ShopOrderStatus, string> = {
  PENDING: "In attesa",
  CONFIRMED: "Confermato",
  COMPLETED: "Completato",
  CANCELLED: "Annullato",
};

export function orderTotal(items: { quantity: number; unitWholesalePrice: number }[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitWholesalePrice, 0);
}
