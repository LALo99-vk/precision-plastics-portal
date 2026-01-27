import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useProductImage(productId: string | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setImageUrl(null);
      return;
    }

    const fetchImage = async () => {
      try {
        // Fetch primary image first, then fallback to first image
        const { data } = await supabase
          .from('product_images')
          .select('image_path, is_primary')
          .eq('product_id', productId)
          .order('is_primary', { ascending: false })
          .order('display_order')
          .limit(1)
          .single();

        if (data) {
          setImageUrl(data.image_path);
        } else {
          // Fallback: check if product has legacy image field
          const { data: product } = await supabase
            .from('products')
            .select('image')
            .eq('id', productId)
            .single();

          if (product?.image) {
            setImageUrl(product.image);
          }
        }
      } catch (error) {
        // Silently fail - will show placeholder
        setImageUrl(null);
      }
    };

    fetchImage();
  }, [productId]);

  return imageUrl;
}
