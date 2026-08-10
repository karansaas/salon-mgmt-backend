export type CalculationLine = { unitPrice: number; quantity: number; total: number };
export type BillingCalculation = { serviceSubtotal: number; productSubtotal: number; subtotal: number; discountAmount: number; taxableAmount: number; taxAmount: number; grandTotal: number };
const money = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
export const calculateBillTotals = (services: CalculationLine[], products: CalculationLine[], discountType: 'FIXED' | 'PERCENTAGE', discountValue: number, taxRate: number): BillingCalculation => {
  const sum = (items: CalculationLine[]) => money(items.reduce((total, item) => total + item.total, 0));
  const serviceSubtotal = sum(services); const productSubtotal = sum(products); const subtotal = money(serviceSubtotal + productSubtotal);
  const rawDiscount = discountType === 'PERCENTAGE' ? subtotal * discountValue / 100 : discountValue;
  const discountAmount = money(Math.min(rawDiscount, subtotal)); const taxableAmount = money(subtotal - discountAmount); const taxAmount = money(taxableAmount * taxRate / 100);
  return { serviceSubtotal, productSubtotal, subtotal, discountAmount, taxableAmount, taxAmount, grandTotal: money(taxableAmount + taxAmount) };
};
