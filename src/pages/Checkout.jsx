import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../components/layout/AppLayout';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Lock, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!cart.length && !success) {
    return (
      <div className="text-center py-20">
        <p className="text-lg">Your cart is empty</p>
        <Link to="/">
          <Button className="mt-4">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email for your receipt');
      return;
    }

    setProcessing(true);

    // Create orders for each cart item
    for (const item of cart) {
      await base44.entities.Order.create({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        total_amount: item.product.price * item.quantity,
        payment_method: paymentMethod,
        buyer_email: email,
        status: 'paid',
        receipt_sent: true,
      });
    }

    // Send receipt email
    const itemsList = cart.map(item =>
      `• ${item.product.name} x${item.quantity} — $${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const paymentLabel = { visa: 'Visa', mastercard: 'Mastercard', alipay_plus: 'Alipay+' }[paymentMethod];

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Your Marché Order Receipt',
      body: `Thank you for your purchase!\n\nOrder Summary:\n${itemsList}\n\nTotal: $${cartTotal.toFixed(2)}\nPayment: ${paymentLabel}\n\nYour order has been confirmed. Thank you for shopping with Marché!`,
    });

    clearCart();
    setProcessing(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-3">
          A receipt has been sent to <span className="font-medium text-foreground">{email}</span>
        </p>
        <Link to="/">
          <Button className="mt-8 gap-2">Continue Shopping</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to cart
      </Link>

      <h1 className="font-display text-3xl font-bold">Checkout</h1>

      {/* Order Summary */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-sm">Order Summary</h2>
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {item.product.name} × {item.quantity}
            </span>
            <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="font-display text-xl font-bold">${cartTotal.toFixed(2)}</span>
        </div>
      </Card>

      {/* Email for receipt */}
      <Card className="p-5 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email for Receipt
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">We'll send your order receipt to this email</p>
        </div>
      </Card>

      {/* Payment */}
      <Card className="p-5">
        <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
      </Card>

      {/* Place Order */}
      <Button
        onClick={handleCheckout}
        disabled={processing}
        className="w-full h-14 text-base gap-2 bg-primary hover:bg-primary/90"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
        ) : (
          <><Lock className="w-5 h-5" /> Pay ${cartTotal.toFixed(2)}</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Lock className="w-3 h-3 inline mr-1" />
        Your payment information is secure and encrypted
      </p>
    </div>
  );
}