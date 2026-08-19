import { Bill } from '../models/Bill.js';
import { Product } from '../models/Product.js';
import { DateRange, indiaDateLabels, resolveIndiaDateRange } from '../utils/dateRange.js';

const asDateMatch = (range: DateRange) => ({ createdAt: { $gte: range.from, $lt: range.to } });
const number = (value: unknown) => Number(value ?? 0);
const employeeDisplayName = (value: unknown) => String(value ?? '').split(/\s+/).filter((part) => part && part.toLowerCase() !== 'undefined').join(' ');

export const getDashboardOverview = async (from?: string, to?: string) => {
  const selectedRange = resolveIndiaDateRange(from, to);
  const todayRange = resolveIndiaDateRange();
  const summaryGroup = { _id: null, revenue: { $sum: '$grandTotal' }, bills: { $sum: 1 }, customers: { $addToSet: '$customerKey' }, serviceUnits: { $sum: '$serviceUnits' }, serviceRevenue: { $sum: '$serviceRevenue' }, productUnits: { $sum: '$productUnits' }, productRevenue: { $sum: '$productRevenue' } };
  const [analytics, lowStock] = await Promise.all([
    Bill.aggregate([
      { $addFields: {
        customerKey: { $cond: [{ $ne: ['$client', null] }, { $concat: ['client:', { $toString: '$client' }] }, { $cond: [{ $ne: [{ $ifNull: ['$customerMobile', ''] }, ''] }, { $concat: ['mobile:', '$customerMobile'] }, { $concat: ['walk-in:', { $toString: '$_id' }] }] }] },
        serviceUnits: { $sum: { $map: { input: '$services', as: 'line', in: '$$line.quantity' } } },
        serviceRevenue: { $sum: { $map: { input: '$services', as: 'line', in: '$$line.total' } } },
        productUnits: { $sum: { $map: { input: '$products', as: 'line', in: '$$line.quantity' } } },
        productRevenue: { $sum: { $map: { input: '$products', as: 'line', in: '$$line.total' } } },
      } },
      { $facet: {
        today: [{ $match: asDateMatch(todayRange) }, { $group: summaryGroup }, { $project: { _id: 0, revenue: 1, bills: 1, customers: { $size: '$customers' }, serviceUnits: 1, serviceRevenue: 1, productUnits: 1, productRevenue: 1 } }],
        selected: [{ $match: asDateMatch(selectedRange) }, { $group: summaryGroup }, { $project: { _id: 0, revenue: 1, bills: 1, averageBillValue: { $cond: [{ $gt: ['$bills', 0] }, { $divide: ['$revenue', '$bills'] }, 0] } } }],
        trend: [{ $match: asDateMatch(selectedRange) }, { $group: { _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$grandTotal' }, bills: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, date: '$_id', revenue: 1, bills: 1 } }],
        payments: [{ $match: asDateMatch(selectedRange) }, { $set: { paymentCount: { $size: '$payments' } } }, { $unwind: '$payments' }, { $group: { _id: { $cond: [{ $gt: ['$paymentCount', 1] }, 'MIXED', '$payments.method'] }, amount: { $sum: '$payments.amount' } } }, { $project: { _id: 0, method: '$_id', amount: 1 } }],
        topServices: [{ $match: asDateMatch(selectedRange) }, { $unwind: '$services' }, { $group: { _id: '$services.serviceId', name: { $first: '$services.serviceName' }, quantity: { $sum: '$services.quantity' }, revenue: { $sum: '$services.total' } } }, { $sort: { revenue: -1, quantity: -1 } }, { $limit: 5 }, { $project: { _id: 0, id: { $toString: '$_id' }, name: 1, quantity: 1, revenue: 1 } }],
        topProducts: [{ $match: asDateMatch(selectedRange) }, { $unwind: '$products' }, { $group: { _id: '$products.productId', name: { $first: '$products.productName' }, quantity: { $sum: '$products.quantity' }, revenue: { $sum: '$products.total' } } }, { $sort: { revenue: -1, quantity: -1 } }, { $limit: 5 }, { $project: { _id: 0, id: { $toString: '$_id' }, name: 1, quantity: 1, revenue: 1 } }],
        employees: [{ $match: asDateMatch(selectedRange) }, { $unwind: '$services' }, { $group: { _id: '$services.employeeId', name: { $first: '$services.employeeName' }, servicesPerformed: { $sum: '$services.quantity' }, revenue: { $sum: '$services.total' }, customers: { $addToSet: '$customerKey' } } }, { $sort: { revenue: -1, servicesPerformed: -1 } }, { $limit: 5 }, { $project: { _id: 0, id: { $toString: '$_id' }, name: 1, servicesPerformed: 1, revenue: 1, customersServed: { $size: '$customers' } } }],
        recentBills: [{ $sort: { createdAt: -1 } }, { $limit: 8 }, { $project: { _id: 0, id: { $toString: '$_id' }, invoiceNumber: 1, customerName: 1, customerMobile: 1, grandTotal: 1, paymentStatus: 1, paymentMethods: 1, createdAt: 1 } }],
      } },
    ]),
    Product.find({ isActive: true, $expr: { $lte: ['$currentStock', '$minimumStockLevel'] } }).sort({ currentStock: 1, name: 1 }).limit(5).select('name currentStock minimumStockLevel'),
  ]);
  const data = analytics[0] ?? {};
  const today = data.today?.[0] ?? {};
  const selected = data.selected?.[0] ?? {};
  const paymentByMethod = new Map<string, number>((data.payments ?? []).map((item: any): [string, number] => [item.method, number(item.amount)]));
  const totalCollected = [...paymentByMethod.values()].reduce((sum: number, amount: number) => sum + amount, 0);
  const trendByDate = new Map<string, { date: string; revenue: number; bills: number }>((data.trend ?? []).map((item: any) => [item.date, { date: item.date, revenue: number(item.revenue), bills: number(item.bills) }]));
  return {
    range: { from: selectedRange.fromDate, to: selectedRange.toDate },
    today: { revenue: number(today.revenue), bills: number(today.bills), customersServed: number(today.customers), servicesPerformed: number(today.serviceUnits), serviceRevenue: number(today.serviceRevenue), productsSold: number(today.productUnits), productRevenue: number(today.productRevenue) },
    revenueSummary: { revenue: number(selected.revenue), bills: number(selected.bills), averageBillValue: number(selected.averageBillValue) },
    revenueTrend: indiaDateLabels(selectedRange).map((label) => trendByDate.get(label) ?? { date: label, revenue: 0, bills: 0 }),
    paymentMethods: ['CASH', 'UPI', 'CARD', 'MIXED'].map((method) => { const amount = paymentByMethod.get(method) ?? 0; return { method, amount, percentage: totalCollected ? Math.round((amount / totalCollected) * 10000) / 100 : 0 }; }),
    topServices: data.topServices ?? [], topProducts: data.topProducts ?? [], employeePerformance: (data.employees ?? []).map((employee: { name?: unknown }) => ({ ...employee, name: employeeDisplayName(employee.name) })), recentBills: data.recentBills ?? [],
    lowStock: { count: await Product.countDocuments({ isActive: true, $expr: { $lte: ['$currentStock', '$minimumStockLevel'] } }), products: lowStock.map((product) => ({ id: product.id, name: product.name, currentStock: product.currentStock, minimumStockLevel: product.minimumStockLevel })) },
  };
};
