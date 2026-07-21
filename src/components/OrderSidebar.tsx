import React, { useState } from 'react';
import { Table, OrderItem, MenuItem } from '../types';
import SplitBillModal from './SplitBillModal';
import { motion, AnimatePresence } from 'motion/react';
import type { Socket } from 'socket.io-client';
import { 
  Trash2, 
  Printer, 
  Send, 
  Save, 
  CreditCard, 
  Coins, 
  CheckCircle,
  HelpCircle,
  Clock,
  User,
  PlusCircle,
  X
} from 'lucide-react';

interface OrderSidebarProps {
  activeTable: Table | null;
  isTakeout: boolean;
  takeoutCustomerName: string;
  takeoutOrder: OrderItem[];
  takeoutNotes: string;
  takeoutAddress?: string;
  onUpdateTakeoutAddress: (address: string) => void;
  onUpdateTakeoutNotes: (notes: string) => void;
  onUpdateTableNotes: (tableId: string, notes: string) => void;
  onClearOrder: () => void;
  onUpdateQuantity: (menuItemId: string, change: number) => void;
  onComandaSent: () => void;
  onSaveOrder: () => void;
  onCheckoutOrder: (paymentMethod: 'Tarjeta' | 'Efectivo', total: number) => void;
  onPartialCheckoutOrder: (paymentMethod: 'Tarjeta' | 'Efectivo', total: number, itemsPaid: OrderItem[]) => void;
  menuItems: MenuItem[];
  onAddToOrderDirect: (item: MenuItem, quantity: number, notes: string) => void;
  onFreeTable: (tableId: string) => void;
  onCloseMobile?: () => void;
  /** Instancia del socket para emitir eventos en tiempo real */
  socket: Socket;
}

export default function OrderSidebar({
  activeTable,
  isTakeout,
  takeoutCustomerName,
  takeoutOrder,
  takeoutNotes,
  takeoutAddress,
  onUpdateTakeoutAddress,
  onUpdateTakeoutNotes,
  onUpdateTableNotes,
  onClearOrder,
  onUpdateQuantity,
  onComandaSent,
  onSaveOrder,
  onCheckoutOrder,
  onPartialCheckoutOrder,
  menuItems,
  onAddToOrderDirect,
  onFreeTable,
  onCloseMobile,
  socket,
}: OrderSidebarProps) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta' | 'Efectivo'>('Tarjeta');
  const [cashAmountPaid, setCashAmountPaid] = useState('');
  const [showComandaAlert, setShowComandaAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState<OrderItem | null>(null);

  // Active items list
  const orderItems = isTakeout ? takeoutOrder : (activeTable?.currentOrder || []);
  const currentNotes = isTakeout ? takeoutNotes : (activeTable?.orderNotes || '');

  // Totals calculations
  const subtotal = orderItems.reduce((sum, item) => {
    const optionsTotal = item.selectedOptions?.reduce((oSum, opt) => oSum + opt.priceDelta, 0) || 0;
    return sum + ((item.menuItem.price + optionsTotal) * item.quantity);
  }, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Handle Notes update
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (isTakeout) {
      onUpdateTakeoutNotes(val);
    } else if (activeTable) {
      onUpdateTableNotes(activeTable.id, val);
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Está seguro de que desea limpiar todos los elementos de la orden?')) {
      onClearOrder();
    }
  };

  const handleSendComanda = () => {
    if (orderItems.length === 0) return;

    // ─── Sincronizar orden con el servidor (todos los dispositivos) ───────
    if (!isTakeout && activeTable) {
      socket.emit('enviar_orden', {
        tableId:     activeTable.id,
        tableNumber: activeTable.number,
        items:       orderItems,
        orderNotes:  currentNotes,   // incluir notas al cocinero
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    onComandaSent();
    setShowComandaAlert(true);
    setTimeout(() => setShowComandaAlert(false), 2000);
  };

  const handleSave = () => {
    if (orderItems.length === 0) return;
    onSaveOrder();
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 2000);
  };

  const handleOpenCheckout = () => {
    if (orderItems.length === 0) return;
    setShowCheckoutModal(true);
    setCashAmountPaid('');
  };

  const handleConfirmCheckout = () => {
    onCheckoutOrder(paymentMethod, total);
    setShowCheckoutModal(false);
  };

  const handleOpenExtras = (item: OrderItem) => {
    setShowExtrasModal(item);
  };

  const handleAddExtra = (extraName: string, extraPrice: number) => {
    if (showExtrasModal) {
      const extraItem: MenuItem = {
        id: `extra_${Date.now()}`,
        name: `Extra: ${extraName}`,
        price: extraPrice,
        description: `Adición para ${showExtrasModal.menuItem.name}`,
        category: 'Especiales'
      };
      onAddToOrderDirect(extraItem, 1, `Acompaña a ${showExtrasModal.menuItem.name}`);
      setShowExtrasModal(null);
    }
  };

  // Cash change logic
  const paidNum = parseFloat(cashAmountPaid) || 0;
  const changeDue = Math.max(0, paidNum - total);

  return (
    <aside className="w-full lg:w-96 bg-surface-bright border-t lg:border-t-0 lg:border-l border-stone-border flex flex-col h-full shadow-lg relative z-20 shrink-0">
      
      {/* Bill Header */}
      <div className="p-5 border-b border-stone-border bg-surface-container-lowest">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-wider mb-2 uppercase border border-secondary/20">
              {isTakeout ? 'Orden para Llevar' : 'Orden Activa'}
            </span>
            <h2 className="font-serif text-2xl text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {isTakeout ? 'takeout_dining' : 'table_restaurant'}
              </span>
              <span>{isTakeout ? (takeoutCustomerName ? takeoutCustomerName : 'Para Llevar') : `Mesa ${activeTable?.number || '?'}`}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClear}
              disabled={orderItems.length === 0}
              className="text-on-surface-variant hover:text-red-700 transition-colors p-1.5 hover:bg-stone-card rounded-lg disabled:opacity-45"
              title="Borrar pedido"
            >
              <span className="material-symbols-outlined text-xl">delete_sweep</span>
            </button>
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1.5 hover:bg-stone-card rounded-lg"
                title="Minimizar panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-on-surface-variant font-sans mt-2 pt-2 border-t border-stone-border/30">
          <p className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-secondary" />
            <span>Mesero: {isTakeout ? 'Caja Principal' : (activeTable?.waiter || 'Juan P.')}</span>
          </p>
          <p className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{isTakeout ? 'Instantáneo' : `${activeTable?.minutes || 10} min`}</span>
          </p>
        </div>
      </div>

      {/* Bill Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {orderItems.map((item, index) => {
          const optionsTotal = item.selectedOptions?.reduce((sum, opt) => sum + opt.priceDelta, 0) || 0;
          const unitPrice = item.menuItem.price + optionsTotal;
          
          return (
            <div 
              key={`${item.menuItem.id}-${index}`} 
              className="p-4 rounded-xl bg-surface-container-lowest border border-stone-border flex flex-col gap-3 shadow-xs hover:border-stone-border-dark transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h4 className="font-sans text-sm font-bold text-on-surface">{item.menuItem.name}</h4>
                  
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
                      {item.selectedOptions.map((opt, optIdx) => (
                        <span key={optIdx} className="text-[10px] font-sans font-medium text-on-surface-variant bg-stone-card px-2 py-0.5 rounded-md border border-stone-border/40">
                          {opt.optionName} {opt.priceDelta > 0 && <span className="text-primary font-bold">(+${opt.priceDelta})</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs text-on-surface-variant italic font-sans mt-1 bg-stone-card/50 px-2 py-0.5 rounded-md inline-block">
                      {item.notes}
                    </p>
                  )}
                </div>
                <span className="font-sans font-semibold text-primary text-sm">${unitPrice.toFixed(2)}</span>
              </div>

              {/* Quantity adjusters */}
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-stone-border/40">
                <div className="flex items-center bg-stone-card rounded-lg p-0.5 border border-stone-border/50">
                  <button 
                    onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                    className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-stone-border transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">remove</span>
                  </button>
                  <span className="w-8 text-center font-sans font-bold text-xs text-on-surface">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                    className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-stone-border transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                  </button>
                </div>
                <span className="font-sans font-bold text-sm text-on-surface">
                  ${(unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}

        {orderItems.length === 0 && (
          <div className="py-16 text-center text-on-surface-variant/55 font-sans space-y-3">
            <span className="material-symbols-outlined text-5xl text-stone-border">restaurant_menu</span>
            <p className="text-xs font-semibold">Orden vacía.</p>
            <p className="text-[11px] px-6">Selecciona platillos en el catálogo de la izquierda para agregarlos a la comanda.</p>
          </div>
        )}

        {/* Cook Comments */}
        {orderItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-border/60">
            <label className="block text-[11px] font-bold text-on-surface mb-2 uppercase tracking-wider font-sans">
              Comentarios para el cocinero
            </label>
            <textarea
              value={currentNotes}
              onChange={handleNotesChange}
              placeholder="Ej. Término medio, sin cebolla, salsa aparte..."
              className="w-full p-3 rounded-xl bg-stone-card border border-stone-border focus:border-primary focus:ring-0 text-xs font-sans text-on-surface-variant placeholder:text-stone-border-dark/30 h-20 resize-none transition-all mb-4"
            />
            {isTakeout && (
              <>
                <label className="block text-[11px] font-bold text-on-surface mb-2 uppercase tracking-wider font-sans">
                  Domicilio / Referencia (Opcional)
                </label>
                <textarea
                  value={takeoutAddress || ''}
                  onChange={(e) => onUpdateTakeoutAddress(e.target.value)}
                  placeholder="Ej. Calle Primavera 123, casa azul..."
                  className="w-full p-3 rounded-xl bg-stone-card border border-stone-border focus:border-primary focus:ring-0 text-xs font-sans text-on-surface-variant placeholder:text-stone-border-dark/30 h-16 resize-none transition-all"
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Bill Totals & Actions Panel */}
      <div className="p-5 bg-surface-container-low border-t border-stone-border">
        {/* Alerts for visual feedback */}
        <AnimatePresence>
          {showComandaAlert && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-secondary text-white text-xs font-sans font-bold py-2.5 px-3 rounded-lg text-center mb-3 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4 animate-bounce" />
              <span>¡Comanda enviada a Cocina!</span>
            </motion.div>
          )}

          {showSaveAlert && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-blue-600 text-white text-xs font-sans font-bold py-2.5 px-3 rounded-lg text-center mb-3 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>¡Cambios de la Orden guardados!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs text-on-surface-variant font-sans">
            <span>Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant font-sans">
            <span>IVA (16%)</span>
            <span className="font-semibold">${iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-3 mt-2 border-t border-stone-border/60">
            <span className="font-serif text-lg text-on-surface font-bold">Total</span>
            <span className="font-serif text-2xl text-primary font-bold">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Buttons layout */}
        <div className="grid grid-cols-2 gap-2.5">
          {orderItems.length === 0 && (
            <button
              onClick={() => isTakeout ? onFreeTable('takeout') : onFreeTable(activeTable!.id)}
              className="col-span-2 py-3 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isTakeout ? 'Cancelar Pedido' : 'Liberar Mesa'}</span>
            </button>
          )}

          <button 
            onClick={handleSendComanda}
            disabled={orderItems.length === 0}
            className={`py-3 px-3 rounded-xl bg-primary hover:bg-primary-container text-white font-sans text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${orderItems.length === 0 ? 'hidden' : ''}`}
          >
            <Send className="w-4 h-4" />
            <span>Comanda</span>
          </button>

          {orderItems.length > 0 && (
            <button 
              onClick={handleSave}
              className="py-3 px-3 rounded-xl border border-primary/40 hover:bg-primary-fixed text-primary font-sans text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Orden</span>
            </button>
          )}

          <button 
            onClick={handleOpenCheckout}
            disabled={orderItems.length === 0}
            className="col-span-2 py-4 rounded-xl bg-secondary hover:bg-tertiary text-white font-sans text-sm font-bold transition-all shadow-md mt-1 flex items-center justify-center gap-2 disabled:opacity-45"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobrar Orden</span>
          </button>

          <button 
            onClick={() => setShowSplitBill(true)}
            disabled={orderItems.length < 2}
            className="col-span-2 py-3 rounded-xl border border-secondary/40 text-secondary hover:bg-secondary/10 font-sans text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-45"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/></svg>
            <span>Dividir Cuenta</span>
          </button>
        </div>
      </div>

      {showSplitBill && (
        <SplitBillModal 
          orderItems={orderItems} 
          title={isTakeout ? 'Para Llevar' : `Mesa ${activeTable?.number}`}
          onClose={() => setShowSplitBill(false)} 
          onPartialCheckout={(method, total, itemsPaid) => {
            onPartialCheckoutOrder(method, total, itemsPaid);
          }}
        />
      )}

      {/* Checkout Dialog Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-xl space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-2xl font-serif text-on-surface font-bold">Cobrar Cuenta</h3>
                <p className="text-xs text-on-surface-variant font-sans">
                  {isTakeout ? 'Para Llevar' : `Mesa ${activeTable?.number}`} • Selecciona método de pago.
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-stone-card p-4 rounded-xl border border-stone-border/80 space-y-4">
                <div className="max-h-32 overflow-y-auto pr-1 space-y-2">
                  {orderItems.map((item, index) => {
                    const optionsTotal = item.selectedOptions?.reduce((sum, opt) => sum + opt.priceDelta, 0) || 0;
                    const unitPrice = item.menuItem.price + optionsTotal;
                    
                    return (
                      <div key={index} className="flex justify-between items-start text-xs font-sans">
                        <div className="flex gap-2">
                          <span className="font-bold text-primary">{item.quantity}x</span>
                          <span className="text-on-surface">{item.menuItem.name}</span>
                        </div>
                        <span className="font-bold text-on-surface-variant">${(unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="pt-3 border-t border-stone-border/60 flex justify-between items-center">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total a pagar</span>
                  <span className="font-serif text-2xl text-primary font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Tarjeta')}
                    className={`p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'Tarjeta' 
                        ? 'border-primary bg-primary-fixed text-primary shadow-sm' 
                        : 'border-stone-border hover:bg-stone-card text-on-surface-variant'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`p-3 rounded-xl border text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'Efectivo' 
                        ? 'border-primary bg-primary-fixed text-primary shadow-sm' 
                        : 'border-stone-border hover:bg-stone-card text-on-surface-variant'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>
                </div>
              </div>

              {/* If Cash, display Change Calculator */}
              {paymentMethod === 'Efectivo' && (
                <div className="space-y-3 animate-fade-in">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">Efectivo Recibido</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input
                      type="number"
                      value={cashAmountPaid}
                      onChange={(e) => setCashAmountPaid(e.target.value)}
                      placeholder="Monto pagado..."
                      className="w-full pl-7 pr-3 py-3 rounded-xl bg-stone-card border border-stone-border focus:border-primary focus:ring-0 text-sm font-sans text-on-surface font-semibold"
                    />
                  </div>

                  {paidNum > 0 && (
                    <div className="flex justify-between items-center px-2 py-1 bg-secondary/10 border border-secondary/20 rounded-lg text-xs font-sans text-secondary">
                      <span className="font-semibold">Cambio a entregar:</span>
                      <span className="font-bold text-sm">${changeDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 border border-stone-border rounded-xl text-xs font-semibold font-sans uppercase tracking-wider hover:bg-stone-card transition-colors text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmCheckout}
                  disabled={paymentMethod === 'Efectivo' && paidNum < total}
                  className="flex-1 py-3 bg-secondary hover:bg-tertiary text-white rounded-xl text-xs font-semibold font-sans uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-45"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Extras Selection Popover */}
      <AnimatePresence>
        {showExtrasModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 border border-stone-border shadow-xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-lg font-bold text-on-surface">Ingredientes Extras</h3>
                  <p className="text-xs text-on-surface-variant">Añadir adicionales para {showExtrasModal.menuItem.name}</p>
                </div>
                <button 
                  onClick={() => setShowExtrasModal(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleAddExtra('Queso Extra', 25)}
                  className="w-full text-left p-3 rounded-xl border border-stone-border hover:bg-stone-card transition-colors text-xs font-sans flex justify-between items-center"
                >
                  <span className="font-semibold">+ Queso Artesanal</span>
                  <span className="font-bold text-primary">+$25.00</span>
                </button>
                <button
                  onClick={() => handleAddExtra('Huevo Adicional', 20)}
                  className="w-full text-left p-3 rounded-xl border border-stone-border hover:bg-stone-card transition-colors text-xs font-sans flex justify-between items-center"
                >
                  <span className="font-semibold">+ Huevo Adicional</span>
                  <span className="font-bold text-primary">+$20.00</span>
                </button>
                <button
                  onClick={() => handleAddExtra('Pollo Deshebrado', 35)}
                  className="w-full text-left p-3 rounded-xl border border-stone-border hover:bg-stone-card transition-colors text-xs font-sans flex justify-between items-center"
                >
                  <span className="font-semibold">+ Pollo Adicional</span>
                  <span className="font-bold text-primary">+$35.00</span>
                </button>
                <button
                  onClick={() => handleAddExtra('Aguacate', 30)}
                  className="w-full text-left p-3 rounded-xl border border-stone-border hover:bg-stone-card transition-colors text-xs font-sans flex justify-between items-center"
                >
                  <span className="font-semibold">+ Aguacate Fresco</span>
                  <span className="font-bold text-primary">+$30.00</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
