import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ImageGallery from '../components/shop/ImageGallery';
import StatusBadge from '../components/shop/StatusBadge';
import { useCart } from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Minus, Plus, User, BadgeCheck } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => base44.entities.Product.filter({ id }),
  });

  const product = products[0];

  const { format } = useCurrency();

  const { data: sellerData = [] } = useQuery({
    queryKey: ['seller', product?.seller_email],
    queryFn: () => base44.entities.User.filter({ email: product.seller_email }),
    enabled: !!product?.seller_email,
  });

  const seller = sellerData[0];

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold">Product not found</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.status === 'sold_out') {
      toast.error('This product is sold out');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group"
        >
          <ImageGallery images={product.images} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <StatusBadge status={product.status} />
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-3">{product.name}</h1>
            <p className="text-3xl font-bold font-display text-accent mt-4">
              {format(product.price || 0)}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Seller Info */}
          {product.seller_email && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                {seller?.profile_picture ? (
                  <img src={seller.profile_picture} alt="Seller" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {(seller?.username || seller?.full_name || product.seller_email)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sold by</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium">{seller?.username || seller?.full_name || product.seller_email}</p>
                  {seller?.company_verified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {product.status !== 'sold_out' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-primary/90 h-12 text-base gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
            </div>
          )}

          {product.status === 'sold_out' && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              This product is currently sold out.
            </div>
          )}

          {product.category && (
            <p className="text-xs text-muted-foreground">
              Category: <span className="font-medium">{product.category}</span>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}