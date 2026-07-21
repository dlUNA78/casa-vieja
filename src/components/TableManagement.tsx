import React, { useState } from 'react';
import { Table, TakeoutOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  UtensilsCrossed,
  Filter,
  X
} from 'lucide-react';

interface TableManagementProps {
  tables: Table[];
  takeoutOrders: TakeoutOrder[];
  onSelectTable: (table: Table) => void;
  onCleanTable: (tableId: string) => void;
  onFreeTable?: (tableId: string) => void;
  onStartTakeout: (customerName: string) => void;
  onSelectTakeoutOrder: (orderId: string) => void;
  onFreeTakeout?: (orderId: string) => void;
  onAssignTable: (tableId: string, waiter: string) => void;
}

export default function TableManagement({
  tables,
  takeoutOrders,
  onSelectTable,
  onCleanTable,
  onFreeTable,
  onStartTakeout,
  onSelectTakeoutOrder,
  onFreeTakeout,
  onAssignTable
}: TableManagementProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'dirty'>('all');
  const [selectedAssignTable, setSelectedAssignTable] = useState<Table | null>(null);
  const [assignWaiter, setAssignWaiter] = useState('Juan P.');
  const [showTakeoutModal, setShowTakeoutModal] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const waiters = ['Juan P.', 'María L.', 'Carlos M.', 'Sofía T.'];

  // Filter logic
  const filteredTables = tables.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const countByStatus = (status: 'available' | 'occupied' | 'dirty') => {
    return tables.filter(t => t.status === status).length;
  };

  const availableTables = filteredTables.filter(t => t.status === 'available');
  const dirtyTables = filteredTables.filter(t => t.status === 'dirty');
  const occupiedTables = filteredTables.filter(t => t.status === 'occupied');

  const pendingTakeoutOrders = takeoutOrders.filter(t => t.status === 'pending');

  const handleOpenAssign = (table: Table) => {
    setSelectedAssignTable(table);
  };

  const handleConfirmAssign = () => {
    if (selectedAssignTable) {
      onAssignTable(selectedAssignTable.id, assignWaiter);
      setSelectedAssignTable(null);
    }
  };

  const handleConfirmTakeout = () => {
    if (customerName.trim()) {
      onStartTakeout(customerName.trim());
      setShowTakeoutModal(false);
      setCustomerName('');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide space-y-8" id="table-mgmt-view">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-stone-border pb-6">
        <div>
          <h2 className="text-3xl font-serif text-on-surface font-semibold tracking-tight">Gestión de Pedidos</h2>
          <p className="text-sm text-on-surface-variant font-sans mt-1">
            Seleccione una mesa para tomar orden o gestionar ocupación, y gestione pedidos para llevar.
          </p>
        </div>
        <button 
          onClick={() => setShowTakeoutModal(true)}
          className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-highest text-primary font-sans text-sm font-bold px-5 py-3 rounded-lg transition-all shadow-sm active:scale-95 uppercase"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>PARA LLEVAR</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 pb-4 border-b border-stone-border/60">
        <button 
          onClick={() => setFilter('all')}
          className={`px-5 py-1.5 rounded-full text-xs font-bold font-sans tracking-wide transition-all ${
            filter === 'all' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-surface-dim hover:bg-stone-border/40 text-on-surface-variant border border-transparent'
          }`}
        >
          Todas ({tables.length})
        </button>
        <button 
          onClick={() => setFilter('available')}
          className={`px-5 py-1.5 rounded-full text-xs font-bold font-sans tracking-wide transition-all ${
            filter === 'available' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-surface-dim hover:bg-stone-border/40 text-on-surface-variant border border-transparent'
          }`}
        >
          Disponibles ({countByStatus('available') + countByStatus('dirty')})
        </button>
        <button 
          onClick={() => setFilter('occupied')}
          className={`px-5 py-1.5 rounded-full text-xs font-bold font-sans tracking-wide transition-all ${
            filter === 'occupied' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-surface-dim hover:bg-stone-border/40 text-on-surface-variant border border-transparent'
          }`}
        >
          Ocupadas ({countByStatus('occupied')})
        </button>
      </div>

      {/* Sections of Tables */}
      <div className="space-y-12 pb-12">
        {/* Available & Dirty section */}
        {(availableTables.length > 0 || dirtyTables.length > 0) && (
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-on-surface font-semibold border-l-[3px] border-primary pl-3 flex items-center gap-2">
              <span>Mesas disponibles</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {tables.filter(t => t.status === 'available' || t.status === 'dirty').map(table => {
                const isDirty = table.status === 'dirty';
                return (
                  <motion.div
                    key={table.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => isDirty ? onCleanTable(table.id) : handleOpenAssign(table)}
                    className={`rounded-lg p-5 border flex flex-col justify-between h-40 relative cursor-pointer shadow-sm transition-colors group ${
                      isDirty ? 'bg-red-50/50 hover:bg-red-50 border-red-200' : 'bg-surface-container-lowest hover:bg-surface-container border-stone-border'
                    }`}
                  >
                    <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full shadow-sm ${
                      isDirty ? 'bg-red-500' : 'bg-secondary'
                    }`}></div>
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-4xl ${isDirty ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>
                        table_restaurant
                      </span>
                      <h4 className="font-serif text-lg font-semibold text-on-surface">Mesa {table.number}</h4>
                    </div>
                    {isDirty ? (
                      <div className="mt-auto flex items-center justify-center gap-1.5 py-1.5 bg-white rounded border border-red-200 text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-sm">cleaning_services</span>
                        <span className="text-xs font-bold font-sans">Limpiar</span>
                      </div>
                    ) : (
                      <div className="mt-auto flex items-center justify-center py-1.5 bg-white rounded border border-stone-border transition-colors">
                        <span className="text-xs font-bold text-on-surface-variant font-sans">Disponible</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Occupied section */}
        {occupiedTables.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-on-surface font-semibold border-l-[3px] border-primary pl-3 flex items-center gap-2">
              <span>Mesas Ocupadas</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {occupiedTables.map(table => {
                const isEmpty = table.currentOrder.length === 0;
                return (
                  <motion.div
                    key={table.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectTable(table)}
                    className="bg-surface-dim rounded-lg p-5 border border-stone-border flex flex-col justify-between h-40 relative cursor-pointer shadow-sm group hover:border-primary/40"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {isEmpty && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFreeTable) onFreeTable(table.id);
                          }}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors shadow-sm"
                          title="Liberar Mesa Vacía"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/80">table_restaurant</span>
                        <h4 className="font-serif text-lg font-semibold text-on-surface">Mesa {table.number}</h4>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded border border-stone-border text-xs text-primary font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{table.waiter || 'Mesero'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded border border-stone-border text-xs text-primary font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{table.minutes || 0} min</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pending Takeout section */}
        {pendingTakeoutOrders.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-on-surface font-semibold border-l-[3px] border-primary pl-3 flex items-center gap-2">
              <span>Pedidos Pendientes o Para Llevar</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {pendingTakeoutOrders.map(order => {
                const itemTotalCount = order.currentOrder.reduce((sum, item) => sum + item.quantity, 0);
                const isEmpty = itemTotalCount === 0;
                return (
                  <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectTakeoutOrder(order.id)}
                    className="bg-surface-dim rounded-lg p-5 border border-stone-border flex flex-col justify-between h-40 relative cursor-pointer shadow-sm group hover:border-primary/40"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {isEmpty && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onFreeTakeout) onFreeTakeout(order.id);
                          }}
                          className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors shadow-sm"
                          title="Eliminar Pedido Vacío"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/80">shopping_bag</span>
                        <h4 className="font-serif text-lg font-semibold text-on-surface truncate pr-2">{order.customerName}</h4>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded border border-stone-border text-xs text-primary font-bold">
                        <span>{itemTotalCount} platillos</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded border border-stone-border text-xs text-primary font-bold">
                        <span className="truncate">Para llevar</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state if all filter returns nothing */}
        {filteredTables.length === 0 && pendingTakeoutOrders.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-card flex items-center justify-center mx-auto border border-stone-border">
              <Filter className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant font-sans text-sm">No se encontraron mesas o pedidos.</p>
          </div>
        )}
      </div>

      {/* Assign Table Dialog/Modal */}
      <AnimatePresence>
        {selectedAssignTable && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-xl space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-on-surface font-semibold flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  <span>Mesa {selectedAssignTable.number}</span>
                </h3>
                <p className="text-xs text-on-surface-variant font-sans">
                  Asigne un mesero para comenzar a tomar la comanda.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">Mesero Responsable</label>
                <div className="grid grid-cols-2 gap-2">
                  {waiters.map(waiter => (
                    <button
                      key={waiter}
                      type="button"
                      onClick={() => setAssignWaiter(waiter)}
                      className={`p-3 rounded-xl border text-xs font-semibold font-sans tracking-wide text-center transition-all ${
                        assignWaiter === waiter 
                          ? 'border-primary bg-primary-fixed text-primary' 
                          : 'border-stone-border hover:bg-stone-card text-on-surface-variant'
                      }`}
                    >
                      {waiter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedAssignTable(null)}
                  className="flex-1 py-3 border border-stone-border rounded-xl text-xs font-semibold font-sans uppercase tracking-wider hover:bg-stone-card transition-colors text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="flex-1 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold font-sans uppercase tracking-wider transition-colors shadow-md"
                >
                  Iniciar Orden
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Takeout Name Dialog/Modal */}
      <AnimatePresence>
        {showTakeoutModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-xl space-y-6 relative"
            >
              <button 
                onClick={() => { setShowTakeoutModal(false); setCustomerName(''); }}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-on-surface font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span>Pedido Para Llevar</span>
                </h3>
                <p className="text-xs text-on-surface-variant font-sans">
                  Ingrese el nombre del cliente para este pedido.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">Nombre del Cliente</label>
                <input
                  type="text"
                  autoFocus
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmTakeout();
                  }}
                  className="w-full px-4 py-3 bg-white border border-stone-border rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowTakeoutModal(false); setCustomerName(''); }}
                  className="flex-1 py-3 border border-stone-border rounded-xl text-xs font-semibold font-sans uppercase tracking-wider hover:bg-stone-card transition-colors text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmTakeout}
                  disabled={!customerName.trim()}
                  className="flex-1 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold font-sans uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
