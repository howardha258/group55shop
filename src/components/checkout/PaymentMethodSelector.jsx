import React from 'react';
import { CreditCard } from 'lucide-react';

const methods = [
  { id: 'visa', label: 'Visa', icon: '💳', color: 'from-blue-600 to-blue-800' },
  { id: 'mastercard', label: 'Mastercard', icon: '💳', color: 'from-orange-500 to-red-600' },
  { id: 'alipay_plus', label: 'Alipay+', icon: '🅰️', color: 'from-sky-400 to-blue-600' },
];

export default function PaymentMethodSelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground">Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
              selected === method.id
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-border hover:border-muted-foreground/30 bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-sm">{method.label}</span>
            </div>
            {selected === method.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}