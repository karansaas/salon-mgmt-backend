export const SERVICE_CATEGORIES = ['Haircut', 'Hair Color', 'Hair Treatment', 'Facial', 'Makeup', 'Waxing', 'Threading', 'Manicure', 'Pedicure', 'Spa', 'Massage', 'Other'] as const;
export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
