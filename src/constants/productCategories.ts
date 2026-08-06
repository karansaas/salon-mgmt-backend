export const PRODUCT_CATEGORIES = ['Shampoo', 'Conditioner', 'Hair Oil', 'Hair Color', 'Skin Care', 'Facial Kit', 'Makeup', 'Wax', 'Nail Care', 'Spa Products', 'Accessories', 'Other'] as const;
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
