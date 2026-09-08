const INDIA_TIME_ZONE = 'Asia/Kolkata';
const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export type DateRange = { from: Date; to: Date; fromDate: string; toDate: string; };

export const indiaDate = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: INDIA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

const startOfIndiaDay = (value: string): Date => {
  if (!datePattern.test(value)) throw new Error('Dates must use YYYY-MM-DD format');
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day) - INDIA_OFFSET_MS;
  const date = new Date(timestamp);
  if (date.getTime() !== timestamp || indiaDate(date) !== value) throw new Error('Invalid date');
  return date;
};

export const resolveIndiaDateRange = (from?: string, to?: string): DateRange => {
  if ((from && !to) || (!from && to)) throw new Error('Both from and to dates are required');
  const fromDate = from ?? indiaDate(new Date());
  const toDate = to ?? fromDate;
  const start = startOfIndiaDay(fromDate);
  const endStart = startOfIndiaDay(toDate);
  if (endStart < start) throw new Error('To date must be on or after from date');
  if ((endStart.getTime() - start.getTime()) / (24 * 60 * 60 * 1000) > 365) throw new Error('Date range cannot exceed 366 days');
  return { from: start, to: new Date(endStart.getTime() + 24 * 60 * 60 * 1000), fromDate, toDate };
};

export const indiaDateLabels = (range: DateRange): string[] => {
  const labels: string[] = [];
  for (let cursor = range.from.getTime(); cursor < range.to.getTime(); cursor += 24 * 60 * 60 * 1000) labels.push(indiaDate(new Date(cursor)));
  return labels;
};
