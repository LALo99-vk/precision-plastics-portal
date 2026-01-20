import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Thermometer, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteCart } from '@/contexts/QuoteCartContext';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
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
  properties 
}: ProductCardProps) {
  const { addItem } = useQuoteCart();

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, category });
  };

  return (
    <div className="industrial-card group">
      {/* Product Image */}
      <div className="aspect-square bg-secondary mb-4 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 bg-muted-foreground/20 rounded" />
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-primary font-medium uppercase tracking-wide">{category}</p>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
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
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleAddToQuote}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add to Quote
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to={`/products/${category.toLowerCase().replace(/\s+/g, '-')}/${id}`}>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
