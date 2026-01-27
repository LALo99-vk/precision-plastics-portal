import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Thermometer, Zap, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status?: 'draft' | 'published' | 'hidden' | 'discontinued' | 'out_of_stock';
  properties?: {
    thermal?: boolean;
    electrical?: boolean;
    chemical?: boolean;
  };
}

export default function ProductCard({ 
  id, 
  name, 
  category, 
  description, 
  image,
  status,
  properties 
}: ProductCardProps) {
  const { addItem, items } = useQuoteCart();
  
  // Check if this product is already in the cart
  const isInCart = items.some(item => item.id === id);
  const cartItem = items.find(item => item.id === id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const existingItem = items.find(i => i.id === id);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    
    addItem({ id, name, category });
    
    // Show success notification
    toast.success('Product added to cart!', {
      description: `${name} (Quantity: ${newQuantity})`,
      duration: 2000,
    });
  };

  const getStatusBadge = () => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-gray-500 hover:bg-gray-600' },
      published: { label: 'Published', className: 'bg-green-500 hover:bg-green-600' },
      hidden: { label: 'Hidden', className: 'bg-yellow-500 hover:bg-yellow-600' },
      discontinued: { label: 'Discontinued', className: 'bg-red-500 hover:bg-red-600' },
      out_of_stock: { label: 'Out of Stock', className: 'bg-orange-500 hover:bg-orange-600' },
    };

    const currentStatus = status || 'published';
    const config = statusConfig[currentStatus];
    
    // Debug: Log status for troubleshooting
    if (!config) {
      console.warn('Unknown status:', currentStatus, 'for product:', name);
    }

    // Always show status badge for visibility
    return (
      <div className="absolute top-2 left-2 z-10">
        <Badge className={config?.className || 'bg-gray-500'}>
          {config?.label || currentStatus}
        </Badge>
      </div>
    );
  };

  const isOutOfStock = status === 'out_of_stock';
  const isUnavailable = status === 'out_of_stock' || status === 'discontinued';

  return (
    <Link 
      to={`/products/${category.toLowerCase().replace(/\s+/g, '-')}/${id}`}
      className={`industrial-card group relative block ${isUnavailable ? 'opacity-75' : ''}`}
    >
      {/* Blur overlay for out of stock */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-lg z-20 pointer-events-none" />
      )}
      
      {/* Product Image */}
      <div className={`aspect-square bg-secondary mb-4 flex items-center justify-center overflow-hidden relative ${isOutOfStock ? 'grayscale' : ''}`}>
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className={`w-full h-full object-cover transition-all ${isOutOfStock ? 'opacity-40 blur-[1px]' : ''}`} 
          />
        ) : (
          <div className="w-16 h-16 bg-muted-foreground/20 rounded" />
        )}
        {getStatusBadge()}
      </div>

      {/* Product Info */}
      <div className={`space-y-3 ${isOutOfStock ? 'opacity-60' : ''}`}>
        <div>
          <h3 className={`font-semibold transition-colors ${isOutOfStock ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
            {name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        {/* Property Icons */}
        {properties && (
          <div className="flex gap-2">
            {properties.thermal && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="High thermal resistance">
                <Thermometer className="w-3.5 h-3.5" />
              </div>
            )}
            {properties.electrical && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Electrical properties">
                <Zap className="w-3.5 h-3.5" />
              </div>
            )}
            {properties.chemical && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Chemical resistance">
                <Shield className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={isInCart ? "default" : "outline"}
            size="sm"
            className={`flex-1 transition-all ${isInCart ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
            onClick={handleAddToQuote}
            disabled={isUnavailable}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Added {quantity > 1 ? `(${quantity})` : ''}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                {isOutOfStock ? 'Not Available' : 'Add to Quote'}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            disabled={isUnavailable}
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/products/${category.toLowerCase().replace(/\s+/g, '-')}/${id}`} className={isUnavailable ? 'pointer-events-none opacity-50' : ''}>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Link>
  );
}
