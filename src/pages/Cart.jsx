import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!cart.length) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30" />
        <h2 className="font-display text-2xl font-bold mt-4">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2">Start shopping to add items</p>
        <Link to="/">
          <Button className="mt-6 gap-2">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>
      <p className="text-muted-foreground">{cart.length} item{cart.length > 1 ? 's' : ''} in your cart</p>

      <div className="space-y-3">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <Card className="p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {item.product.images?.[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">${item.product.price?.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <p className="font-bold w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>

                  <Button
                    variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center text-lg">
          <span className="font-medium">Total</span>
          <span className="font-display text-2xl font-bold">${cartTotal.toFixed(2)}</span>
        </div>
        <Link to="/checkout" className="block">
          <Button className="w-full h-12 text-base gap-2 bg-primary hover:bg-primary/90">
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}