import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface QuoteItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  notes?: string;
}

interface QuoteCartContextType {
  items: QuoteItem[];
  addItem: (item: Omit<QuoteItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined);

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);

  const addItem = (item: Omit<QuoteItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const updateNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, notes } : i
    ));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <QuoteCartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      updateNotes,
      clearCart,
      itemCount
    }}>
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const context = useContext(QuoteCartContext);
  if (!context) {
    throw new Error('useQuoteCart must be used within QuoteCartProvider');
  }
  return context;
}
