import { formatUnitPrice, PRICE_DECIMALS } from "./format";

export interface CostParams {
  printHours: number;
  weightGrams: number;
  electricityCostPerHour: number;
  spoolPrice: number;
  spoolWeightGrams: number;
  labelPrice?: number;
  keychainPrice?: number;
}

export interface CostBreakdown {
  electricityCost: number;
  filamentCost: number;
  labelCost: number;
  keychainCost: number;
  total: number;
}

export function costPerGram(spoolPrice: number, spoolWeightGrams: number): number {
  if (spoolWeightGrams <= 0) return 0;
  return spoolPrice / spoolWeightGrams;
}

export function calculateProductCost(params: CostParams): CostBreakdown {
  const hours = Math.max(0, params.printHours);
  const grams = Math.max(0, params.weightGrams);
  const pricePerGram = costPerGram(params.spoolPrice, params.spoolWeightGrams);

  const electricityCost = hours * Math.max(0, params.electricityCostPerHour);
  const filamentCost = grams * pricePerGram;
  const labelCost = params.labelPrice != null ? Math.max(0, params.labelPrice) : 0;
  const keychainCost = params.keychainPrice != null ? Math.max(0, params.keychainPrice) : 0;

  return {
    electricityCost,
    filamentCost,
    labelCost,
    keychainCost,
    total: electricityCost + filamentCost + labelCost + keychainCost,
  };
}

export function formatPriceValue(value: number): string {
  const fixed = value.toFixed(PRICE_DECIMALS);
  return fixed.replace(/\.?0+$/, "") || "0";
}

export function formatEuro(value: number): string {
  return formatUnitPrice(value);
}

export { PRICE_DECIMALS };
