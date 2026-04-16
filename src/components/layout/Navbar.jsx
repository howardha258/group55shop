import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Store, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Navbar({ cartCount = 0 }) {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Shop', icon: ShoppingBag },
    { path: '/sell', label: 'Sell', icon: Store },
    { path: '/my-listings', label: 'My Listings', icon: Package },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Marché</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {links.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button
                variant={location.pathname === path ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5 text-xs whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}