import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, CreditCard, Coins, CheckCircle, ArrowRight } from 'lucide-react';
import { OrderItem, MenuItem, OrderOption } from '../types';

interface SplitItem {
  id: string;
  originalIndex: number;
  menuItem: MenuItem;
  notes: string;
  selectedOptions?: OrderOption[];
  price: number;
}

interface SubAccount {
  id: string;
  name: string;
  items: SplitItem[];
}

interface SplitBillModalProps {
  orderItems: OrderItem[];
  title: string;
  onClose: () => void;
  onPartialCheckout: (method: 'Tarjeta' | 'Efectivo', total: number, itemsPaid: OrderItem[]) => void;
}

export default function SplitBillModal({ orderItems, title, onClose, onPartialCheckout }: SplitBillModalProps) {
  const [originalList, setOriginalList] = useState<SplitItem[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  
  // Checkout state for sub accounts
  const [checkoutSubAccountId, setCheckoutSubAccountId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Efectivo'>('Tarjeta');
  const [cashAmountPaid, setCashAmountPaid] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [activeMoveMenu, setActiveMoveMenu] = useState<string | null>(null);

  useEffect(() => {
    // Unroll order items into singular split items
    const initialItems: SplitItem[] = [];
    orderItems.forEach((item, index) => {
      const optionsTotal = item.selectedOptions?.reduce((sum, opt) => sum + opt.priceDelta, 0) || 0;
      const unitPrice = item.menuItem.price + optionsTotal;
      for (let i = 0; i < item.quantity; i++) {
        initialItems.push({
          id: `item-${index}-${i}`,
          originalIndex: index,
          menuItem: item.menuItem,
          notes: item.notes,
          selectedOptions: item.selectedOptions,
          price: unitPrice
        });
      }
    });
    setOriginalList(initialItems);
    
    // Auto-create one sub-account initially
    setSubAccounts([{ id: 'sub-0', name: 'Subcuenta A', items: [] }]);
  }, [orderItems]);

  const handleDragStart = (e: React.DragEvent, id: string, sourceId: string) => {
    e.dataTransfer.setData('itemId', id);
    e.dataTransfer.setData('sourceId', sourceId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    const sourceId = e.dataTransfer.getData('sourceId');
    
    if (sourceId === targetId) return;

    let item: SplitItem | undefined;
    if (sourceId === 'original') {
      item = originalList.find(i => i.id === itemId);
    } else {
      const sub = subAccounts.find(s => s.id === sourceId);
      item = sub?.items.find(i => i.id === itemId);
    }
    
    if (!item) return;

    // Remove from source
    if (sourceId === 'original') {
      setOriginalList(prev => prev.filter(i => i.id !== itemId));
    } else {
      setSubAccounts(prev => prev.map(s => s.id === sourceId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s));
    }
    
    // Add to target
    if (targetId === 'original') {
      setOriginalList(prev => [...prev, item!]);
    } else {
      setSubAccounts(prev => prev.map(s => s.id === targetId ? { ...s, items: [...s.items, item!] } : s));
    }
  };

  const moveItem = (itemId: string, sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    let item: SplitItem | undefined;
    if (sourceId === 'original') {
      item = originalList.find(i => i.id === itemId);
    } else {
      const sub = subAccounts.find(s => s.id === sourceId);
      item = sub?.items.find(i => i.id === itemId);
    }
    
    if (!item) return;

    if (sourceId === 'original') {
      setOriginalList(prev => prev.filter(i => i.id !== itemId));
    } else {
      setSubAccounts(prev => prev.map(s => s.id === sourceId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s));
    }
    
    if (targetId === 'original') {
      setOriginalList(prev => [...prev, item!]);
    } else {
      setSubAccounts(prev => prev.map(s => s.id === targetId ? { ...s, items: [...s.items, item!] } : s));
    }
    setActiveMoveMenu(null);
  };

  const addSubAccount = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextName = `Subcuenta ${letters[subAccounts.length % 26]}`;
    setSubAccounts(prev => [...prev, { id: `sub-${Date.now()}`, name: nextName, items: [] }]);
  };
  
  const removeSubAccount = (id: string) => {
    const sub = subAccounts.find(s => s.id === id);
    if (sub && sub.items.length > 0) {
      // return items to original
      setOriginalList(prev => [...prev, ...sub.items]);
    }
    setSubAccounts(prev => prev.filter(s => s.id !== id));
  };

  const calculateSubtotal = (items: SplitItem[]) => items.reduce((sum, item) => sum + item.price, 0);
  const calculateTotal = (items: SplitItem[]) => {
    const sub = calculateSubtotal(items);
    return sub + (sub * 0.16); // 16% IVA
  };

  const handleChargeSubAccount = (subAccountId: string) => {
    setPaymentMethod('Tarjeta');
    setCashAmountPaid('');
    setCheckoutSuccess(false);
    setCheckoutSubAccountId(subAccountId);
  };
  
  const processSubAccountPayment = () => {
    if (!checkoutSubAccountId) return;
    const sub = subAccounts.find(s => s.id === checkoutSubAccountId);
    if (!sub || sub.items.length === 0) return;

    const total = calculateTotal(sub.items);
    
    // Re-roll split items into OrderItems
    const paidOrderItems: OrderItem[] = [];
    const isSameItem = (a: OrderItem, b: SplitItem) => {
      return a.menuItem.id === b.menuItem.id && a.notes === b.notes && JSON.stringify(a.selectedOptions || []) === JSON.stringify(b.selectedOptions || []);
    };
    
    sub.items.forEach(paid => {
      const existing = paidOrderItems.find(o => isSameItem(o, paid));
      if (existing) {
        existing.quantity += 1;
      } else {
        paidOrderItems.push({ menuItem: paid.menuItem, notes: paid.notes, selectedOptions: paid.selectedOptions, quantity: 1 });
      }
    });

    // Notify parent
    onPartialCheckout(paymentMethod, total, paidOrderItems);
    
    // Show success momentarily
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCheckoutSubAccountId(null);
      // Remove sub account completely since it's paid
      setSubAccounts(prev => prev.filter(s => s.id !== checkoutSubAccountId));
      
      // If originalList is empty and no other subAccounts have items, we should close modal
      // But parent will re-render and maybe close table.
    }, 1500);
  };

  const renderDraggableItem = (item: SplitItem, sourceId: string) => (
    <div key={item.id} className="relative">
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item.id, sourceId)}
        onClick={() => setActiveMoveMenu(activeMoveMenu === item.id ? null : item.id)}
        className="p-3 mb-2 bg-surface-container-lowest border border-stone-border rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors flex justify-between items-start"
      >
        <div className="flex gap-2">
          <div className="mt-0.5 text-stone-border">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-medium text-sm text-on-surface">{item.menuItem.name}</span>
            {(item.notes || (item.selectedOptions && item.selectedOptions.length > 0)) && (
              <span className="text-[10px] text-on-surface-variant line-clamp-2">
                {item.notes} {item.selectedOptions?.map(o => o.optionName).join(', ')}
              </span>
            )}
          </div>
        </div>
        <span className="font-sans font-bold text-sm text-primary">${item.price.toFixed(2)}</span>
      </div>

      {activeMoveMenu === item.id && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface-container-lowest border border-stone-border rounded-xl shadow-lg z-20 py-1 overflow-hidden">
          <div className="px-3 py-1 text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-low">Mover a...</div>
          {sourceId !== 'original' && (
            <button onClick={() => moveItem(item.id, sourceId, 'original')} className="w-full text-left px-3 py-2 text-sm font-sans hover:bg-primary/10 transition-colors text-on-surface">Cuenta Original</button>
          )}
          {subAccounts.map(sub => sub.id !== sourceId && (
             <button key={sub.id} onClick={() => moveItem(item.id, sourceId, sub.id)} className="w-full text-left px-3 py-2 text-sm font-sans hover:bg-primary/10 transition-colors text-on-surface">{sub.name}</button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex bg-surface-container-lowest">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 border-b border-stone-border/50 bg-surface-container-lowest flex items-center justify-between px-6 z-10">
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary">División de Cuenta - {title}</h2>
          <p className="text-sm font-sans text-on-surface-variant">Arrastre los artículos a nuevas subcuentas para dividir el cobro.</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-border/30 transition-colors">
          <X className="w-6 h-6 text-on-surface" />
        </button>
      </div>

      {/* Main Drag & Drop Area */}
      <div className="flex-1 mt-16 p-6 flex overflow-x-auto gap-6 items-start h-[calc(100vh-64px)]">
        
        {/* Original Account Column */}
        <div 
          className="w-80 shrink-0 bg-surface-container-low rounded-2xl border border-stone-border/60 flex flex-col h-full max-h-[800px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'original')}
        >
          <div className="p-4 border-b border-stone-border/50 flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-primary">Cuenta Original</h3>
            <span className="text-xs font-sans font-bold bg-primary text-white px-2 py-0.5 rounded-full">
              {originalList.length} artículos
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {originalList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 text-sm border-2 border-dashed border-stone-border/40 rounded-xl">
                <span>Vacío</span>
              </div>
            ) : (
              originalList.map(item => renderDraggableItem(item, 'original'))
            )}
          </div>
        </div>

        {/* Sub Accounts Columns */}
        {subAccounts.map(sub => {
          const total = calculateTotal(sub.items);
          return (
            <div 
              key={sub.id}
              className="w-72 shrink-0 bg-surface-container-lowest rounded-2xl border border-stone-border/60 flex flex-col h-full max-h-[800px] shadow-sm relative group"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, sub.id)}
            >
              <div className="p-4 border-b border-stone-border/50 flex justify-between items-center bg-surface-container-low/50 rounded-t-2xl">
                <h3 className="font-serif text-lg font-bold text-on-surface">{sub.name}</h3>
                <button onClick={() => removeSubAccount(sub.id)} className="p-1 hover:bg-stone-border/50 rounded-full text-on-surface-variant transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto bg-surface-container">
                {sub.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 text-sm border-2 border-dashed border-stone-border/50 rounded-xl bg-surface-container-lowest/50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Arrastre artículos aquí</span>
                  </div>
                ) : (
                  sub.items.map(item => renderDraggableItem(item, sub.id))
                )}
              </div>

              <div className="p-4 border-t border-stone-border/50 bg-surface-container-low/30 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-sans font-bold text-sm text-on-surface-variant">Total c/IVA</span>
                  <span className="font-sans font-bold text-lg text-on-surface">${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleChargeSubAccount(sub.id)}
                  disabled={sub.items.length === 0}
                  className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20"
                >
                  Cobrar {sub.name}
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Sub Account Button */}
        <button 
          onClick={addSubAccount}
          className="w-72 shrink-0 h-[400px] border-2 border-dashed border-stone-border hover:border-primary hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all group"
        >
          <div className="w-12 h-12 bg-surface-container-highest group-hover:bg-primary/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-serif font-bold text-lg">Añadir Subcuenta</span>
          <span className="font-sans text-sm mt-1 opacity-80">Crear nueva división</span>
        </button>

      </div>

      {/* Checkout Modal specifically for sub accounts */}
      <AnimatePresence>
        {checkoutSubAccountId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-dark/40 backdrop-blur-sm"
              onClick={() => !checkoutSuccess && setCheckoutSubAccountId(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 border border-stone-border/40"
            >
              {!checkoutSuccess ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl font-bold text-primary">Cobrar Subcuenta</h3>
                    <button 
                      onClick={() => setCheckoutSubAccountId(null)}
                      className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-surface-container-highest/30 rounded-2xl p-6 flex flex-col items-center justify-center mb-6">
                    <span className="text-on-surface-variant font-sans text-sm mb-1 uppercase tracking-wider font-semibold">Total a Cobrar</span>
                    <span className="font-serif text-5xl font-bold text-primary">
                      ${calculateTotal(subAccounts.find(s => s.id === checkoutSubAccountId)?.items || []).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setPaymentMethod('Tarjeta')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'Tarjeta' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-stone-border/50 bg-transparent text-on-surface hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="w-8 h-8 mb-2" />
                      <span className="font-sans font-bold">Tarjeta</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('Efectivo')}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === 'Efectivo' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-stone-border/50 bg-transparent text-on-surface hover:border-primary/50'
                      }`}
                    >
                      <Coins className="w-8 h-8 mb-2" />
                      <span className="font-sans font-bold">Efectivo</span>
                    </button>
                  </div>

                  {paymentMethod === 'Efectivo' && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-sans font-bold text-on-surface mb-2">
                        Efectivo Recibido
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                        <input
                          type="number"
                          value={cashAmountPaid}
                          onChange={(e) => setCashAmountPaid(e.target.value)}
                          className="w-full bg-surface-container-low border border-stone-border/80 rounded-xl py-3 pl-8 pr-4 text-lg font-sans font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      
                      {parseFloat(cashAmountPaid) >= calculateTotal(subAccounts.find(s => s.id === checkoutSubAccountId)?.items || []) && (
                        <div className="mt-3 bg-secondary-container/50 text-green-700 p-3 rounded-xl flex items-center justify-between">
                          <span className="font-sans font-bold text-sm">Cambio a entregar:</span>
                          <span className="font-serif font-bold text-lg">
                            ${(parseFloat(cashAmountPaid) - calculateTotal(subAccounts.find(s => s.id === checkoutSubAccountId)?.items || [])).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={processSubAccountPayment}
                    disabled={paymentMethod === 'Efectivo' && (
                      !cashAmountPaid || 
                      parseFloat(cashAmountPaid) < calculateTotal(subAccounts.find(s => s.id === checkoutSubAccountId)?.items || [])
                    )}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-sans font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <span>Completar Pago</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-secondary-container/50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-700" />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-on-surface mb-2">¡Pago Exitoso!</h3>
                  <p className="font-sans text-on-surface-variant">La subcuenta ha sido procesada.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
