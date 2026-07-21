import React, { useState } from 'react';
import { Table, TakeoutOrder, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, XCircle, Search, Clock, Utensils, X } from 'lucide-react';

interface ComandasViewProps {
  tables: Table[];
  takeoutOrders: TakeoutOrder[];
  onCancelOrder: (id: string, isTakeout: boolean) => void;
  onCancelItem: (orderId: string, isTakeout: boolean, itemIndex: number) => void;
}

export default function ComandasView({ tables, takeoutOrders, onCancelOrder, onCancelItem }: ComandasViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [printData, setPrintData] = useState<{ id: string, identifier: string, items: OrderItem[], isCancellation: boolean } | null>(null);

  const activeTables = tables.filter(t => t.status === 'occupied' && t.currentOrder.length > 0);
  const activeTakeouts = takeoutOrders.filter(t => t.status === 'pending' && t.currentOrder.length > 0);

  const allActiveOrders = [
    ...activeTables.map(t => ({ ...t, isTakeout: false, identifier: `Mesa ${t.number}` })),
    ...activeTakeouts.map(t => ({ ...t, isTakeout: true, identifier: `Para Llevar: ${t.customerName}` }))
  ].filter(o => o.identifier.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePrint = (order: any, isCancellation = false) => {
    setPrintData({
      id: order.id,
      identifier: order.identifier,
      items: order.currentOrder,
      isCancellation
    });
    // In a real app, this would trigger a silent raw print to the thermal printer
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCancelOrder = (order: any) => {
    handlePrint(order, true);
    setTimeout(() => {
      onCancelOrder(order.id, order.isTakeout);
      setPrintData(null);
    }, 500);
  };

  const handleCancelItem = (order: any, index: number) => {
    // Generate cancellation ticket for just one item
    setPrintData({
      id: order.id,
      identifier: order.identifier,
      items: [order.currentOrder[index]],
      isCancellation: true
    });
    setTimeout(() => {
      window.print();
      onCancelItem(order.id, order.isTakeout, index);
      setPrintData(null);
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="p-6 md:p-8 bg-surface-dim border-b border-stone-border/40 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-primary">Comandas Activas</h2>
            <p className="text-sm font-sans text-on-surface-variant mt-1">Monitor de órdenes en cocina</p>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar mesa o cliente..." 
              className="pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-stone-border focus:ring-2 focus:ring-primary text-sm font-sans w-full sm:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface-container-lowest">
        {allActiveOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-70">
            <Utensils className="w-16 h-16 mb-4" />
            <p className="font-serif text-xl font-bold">No hay órdenes activas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {allActiveOrders.map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-lowest rounded-2xl border border-stone-border shadow-sm overflow-hidden flex flex-col"
              >
                <div className={`p-4 border-b border-stone-border/50 flex justify-between items-start ${order.isTakeout ? 'bg-primary-fixed/20' : 'bg-secondary-container/20'}`}>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-on-surface">{order.identifier}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-sans text-on-surface-variant mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hace {(order as any).minutes || 1} min</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.isTakeout ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {order.isTakeout ? 'Para Llevar' : 'Comedor'}
                  </span>
                </div>

                <div className="p-0 flex-1 overflow-y-auto bg-surface-container-lowest">
                  <ul className="divide-y divide-stone-border/30">
                    {order.currentOrder.map((item, idx) => (
                      <li key={idx} className="p-4 flex gap-3 hover:bg-surface-container-highest transition-colors group">
                        <div className="font-bold text-lg text-primary w-6 text-center">{item.quantity}</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-on-surface leading-tight">{item.menuItem.name}</p>
                          
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className="text-xs text-on-surface-variant mt-1">
                              {item.selectedOptions.map(o => o.optionName).join(', ')}
                            </p>
                          )}
                          
                          {item.notes && (
                            <p className="text-xs text-red-700 font-medium mt-1 bg-red-50 p-1.5 rounded inline-block">
                              Nota: {item.notes}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleCancelItem(order, idx)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all self-start shrink-0"
                          title="Cancelar este platillo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-surface-container-lowest border-t border-stone-border/50 flex gap-3">
                  <button 
                    onClick={() => handlePrint(order)}
                    className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-colors text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Reimprimir</span>
                  </button>
                  <button 
                    onClick={() => handleCancelOrder(order)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-colors text-sm border border-red-200"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Anular Orden</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Print Area - Only visible during print */}
      {printData && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] text-black font-mono">
          <div className="w-[80mm] max-w-full mx-auto p-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1">CASA VIEJA</h1>
              <p className="text-sm border-b-2 border-black pb-4 border-dashed">
                {printData.isCancellation ? '*** TICKET DE CANCELACIÓN ***' : '*** TICKET DE COCINA ***'}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-xl font-bold">{printData.identifier}</p>
              <p className="text-sm mt-1">{new Date().toLocaleString()}</p>
            </div>

            <div className="border-t-2 border-black border-dashed pt-4 mb-4">
              {printData.items.map((item, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex gap-2">
                    <span className="font-bold text-lg">{item.quantity}x</span>
                    <span className="font-bold text-lg">{item.menuItem.name}</span>
                  </div>
                  
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="pl-8 text-sm mt-1">
                      {item.selectedOptions.map(o => o.optionName).join(', ')}
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="pl-8 text-sm font-bold uppercase mt-1">
                      ** NOTA: {item.notes} **
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center border-t-2 border-black border-dashed pt-4 mt-6">
              <p className="font-bold">FIN DE TICKET</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
