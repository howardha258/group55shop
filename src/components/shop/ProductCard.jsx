import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';

const statusConfig = {
  available: { label: 'Available', className: 'bg-green-100 text-green-700 border-green-200' },
  nearly_sold_out: { label: 'Almost Gone', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  sold_out: { label: 'Sold Out', className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function ProductCard({ product, index = 0 }) {
  const status = statusConfig[product.status] || statusConfig.available;
  const { format } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
          <div className="aspect-square overflow-hidden bg-muted relative">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <Badge className={`absolute top-3 left-3 ${status.className} border text-xs`}>
              {status.label}
            </Badge>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
            <p className="mt-3 text-lg font-bold font-display text-foreground">
              {format(product.price || 0)}
            </p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}