/**
 * Currency utilities for TND (Tunisian Dinar) formatting and calculations
 */

export const CURRENCY = {
  code: 'TND',
  symbol: 'DT',
  locale: 'fr-TN',
  defaultTaxRate: 19, // TVA standard en Tunisie
};

/**
 * Format a number as TND currency
 */
export function formatTND(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '0,000 DT';
  
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'decimal',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value) + ' DT';
}

/**
 * Format a number as TND currency without symbol
 */
export function formatNumber(amount: number | string, decimals: number = 3): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '0';
  
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse a formatted TND string to a number
 */
export function parseTND(formattedAmount: string): number {
  const cleaned = formattedAmount.replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return Number((amount * taxRate / 100).toFixed(3));
}

/**
 * Calculate amount with tax
 */
export function calculateWithTax(amount: number, taxRate: number): number {
  return Number((amount + calculateTax(amount, taxRate)).toFixed(3));
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(amount: number, discountPercent: number): number {
  return Number((amount * discountPercent / 100).toFixed(3));
}

/**
 * Calculate line total with discount
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0
): number {
  const subtotal = quantity * unitPrice;
  const discountAmount = calculateDiscount(subtotal, discountPercent);
  return Number((subtotal - discountAmount).toFixed(3));
}

/**
 * Calculate invoice totals
 */
export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export function calculateInvoiceTotals(
  items: Array<{
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountPercent?: number;
  }>,
  globalDiscountPercent: number = 0
): InvoiceTotals {
  let subtotal = 0;
  let taxAmount = 0;

  items.forEach(item => {
    const lineTotal = calculateLineTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercent || 0
    );
    subtotal += lineTotal;
    taxAmount += calculateTax(lineTotal, item.taxRate);
  });

  const discountAmount = calculateDiscount(subtotal, globalDiscountPercent);
  const discountedSubtotal = subtotal - discountAmount;
  const adjustedTaxAmount = calculateTax(discountedSubtotal, taxAmount > 0 ? (taxAmount / subtotal * 100) : 0);
  const total = discountedSubtotal + adjustedTaxAmount;

  return {
    subtotal: Number(subtotal.toFixed(3)),
    discountAmount: Number(discountAmount.toFixed(3)),
    taxAmount: Number(adjustedTaxAmount.toFixed(3)),
    total: Number(total.toFixed(3)),
  };
}
