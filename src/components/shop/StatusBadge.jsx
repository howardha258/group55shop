import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  available: { label: 'Available', className: 'bg-green-100 text-green-700 border-green-200' },
  nearly_sold_out: { label: 'Almost Gone', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  sold_out: { label: 'Sold Out', className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.available;
  return (
    <Badge className={`${config.className} border text-xs`}>
      {config.label}
    </Badge>
  );
}