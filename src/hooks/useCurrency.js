import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const RATES = {
  USD: 1,
  HKD: 7.78,
  EUR: 0.92,
  GBP: 0.79,
  CNY: 7.24,
  JPY: 154.5,
  KRW: 1350,
  AUD: 1.54,
  CAD: 1.36,
  SGD: 1.34,
};

const SYMBOLS = {
  USD: '$', HKD: 'HK$', EUR: '€', GBP: '£',
  CNY: '¥', JPY: '¥', KRW: '₩', AUD: 'A$', CAD: 'C$', SGD: 'S$',
};

export function useCurrency() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const currency = user?.region || 'USD';
  const rate = RATES[currency] || 1;
  const symbol = SYMBOLS[currency] || '$';

  const format = (usdPrice) => {
    const converted = usdPrice * rate;
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  return { format, currency, symbol };
}