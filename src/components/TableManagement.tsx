import React, { useState } from 'react';
import { Table } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  UtensilsCrossed,
  Filter
} from 'lucide-react';

interface TableManagementProps {
  tables: Table[];
  onSelectTable: (table: Table) => void;
  onCleanTable: (tableId: string) => void;
  onStartTakeout: () => void;
  onAssignTable: (tableId: string, waiter: string) => void;
}

export default function TableManagement({
  tables,
  onSelectTable,
  onCleanTable,
  onStartTakeout,
  onAssignTable
}: TableManagementProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'dirty'>('all');
  const [selectedAssignTable, setSelectedAssignTable] = useState<Table | null>(null);
  const [assignWaiter, setAssignWaiter] = useState('Juan P.');

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

  const handleOpenAssign = (table: Table) => {
    setSelectedAssignTable(table);
  };

  const handleConfirmAssign = () => {
    if (selectedAssignTable) {
      onAssignTable(selectedAssignTable.id, assignWaiter);
      setSelectedAssignTable(null);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide space-y-8" id="table-mgmt-view">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-stone-border pb-6">
        <div>
          <h2 className="text-3xl font-serif text-[#4a3f35] font-semibold tracking-tight">Gestión de Mesas</h2>
          <p className="text-sm text-on-surface-variant font-sans mt-1">
            Seleccione una mesa para tomar orden, gestionar ocupación o limpiar.
          </p>
        </div>
        <button 
          onClick={onStartTakeout}
          className="flex items-center gap-2 bg-stone-card hover:bg-[#e9e4d5] text-primary border border-primary/20 font-sans text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>PARA LLEVAR</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-stone-border/60">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold font-sans tracking-wide transition-all ${
            filter === 'all' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-stone-card hover:bg-stone-border/40 text-on-surface-variant border border-stone-border/50'
          }`}
        >
          Todas ({tables.length})
        </button>
        <button 
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-full text-xs font-semibold font-sans tracking-wide transition-all ${
            filter === 'available' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-stone-card hover:bg-stone-border/40 text-on-surface-variant border border-stone-border/50'
          }`}
        >
          Disponibles ({countByStatus('available')})
        </button>
        <button 
          onClick={() => setFilter('occupied')}
          className={`px-4 py-2 rounded-full text-xs font-semibold font-sans tracking-wide transition-all ${
            filter === 'occupied' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-stone-card hover:bg-stone-border/40 text-on-surface-variant border border-stone-border/50'
          }`}
        >
          Ocupadas ({countByStatus('occupied')})
        </button>
        <button 
          onClick={() => setFilter('dirty')}
          className={`px-4 py-2 rounded-full text-xs font-semibold font-sans tracking-wide transition-all ${
            filter === 'dirty' 
              ? 'bg-secondary text-white shadow-sm' 
              : 'bg-stone-card hover:bg-stone-border/40 text-on-surface-variant border border-stone-border/50'
          }`}
        >
          Sucias ({countByStatus('dirty')})
        </button>
      </div>

      {/* Sections of Tables */}
      <div className="space-y-12 pb-12">
        {/* Available section */}
        {availableTables.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-[#4a3f35] font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
              <span>Mesas Disponibles</span>
              <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary text-xs flex items-center justify-center font-bold">
                {availableTables.length}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {availableTables.map(table => (
                <motion.div
                  key={table.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenAssign(table)}
                  className="bg-[#fdfcf0] hover:bg-[#faf6e9] rounded-2xl p-5 border border-secondary/20 flex flex-col justify-between h-40 relative cursor-pointer shadow-sm transition-colors group"
                >
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(90,99,46,0.5)]"></div>
                  <div className="flex items-center gap-3 opacity-80">
                    <span className="material-symbols-outlined text-4xl text-secondary">table_restaurant</span>
                    <h4 className="font-serif text-xl font-semibold text-on-surface">Mesa {table.number}</h4>
                  </div>
                  <div className="mt-auto flex items-center justify-center py-2 bg-stone-card rounded-xl border border-stone-border/30 group-hover:border-secondary/40 transition-colors">
                    <span className="text-xs font-semibold text-secondary font-sans tracking-wider uppercase">Disponible</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Dirty section */}
        {dirtyTables.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-[#4a3f35] font-semibold border-l-4 border-amber-600 pl-3 flex items-center gap-2">
              <span>En Espera de Limpieza</span>
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
                {dirtyTables.length}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {dirtyTables.map(table => (
                <div
                  key={table.id}
                  className="bg-red-50/10 rounded-2xl p-5 border border-red-200/50 flex flex-col justify-between h-40 relative shadow-sm"
                >
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse"></div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-red-700/60">table_restaurant</span>
                    <h4 className="font-serif text-xl font-semibold text-on-surface">Mesa {table.number}</h4>
                  </div>
                  <button
                    onClick={() => onCleanTable(table.id)}
                    className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold font-sans tracking-wider uppercase transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">cleaning_services</span>
                    <span>Limpiar</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Occupied section */}
        {occupiedTables.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-serif text-[#4a3f35] font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
              <span>Mesas Ocupadas</span>
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                {occupiedTables.length}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {occupiedTables.map(table => {
                const itemTotalCount = table.currentOrder.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <motion.div
                    key={table.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectTable(table)}
                    className="bg-stone-card rounded-2xl p-5 border border-stone-border flex flex-col justify-between h-44 relative cursor-pointer shadow-sm group hover:border-primary/40"
                  >
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(141,75,0,0.5)]"></div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary/80">table_restaurant</span>
                        <h4 className="font-serif text-xl font-semibold text-on-surface">Mesa {table.number}</h4>
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-sans mt-1 bg-white/50 px-2 py-0.5 rounded-md inline-block">
                        {itemTotalCount} platillo{itemTotalCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg border border-stone-border/40 text-[11px] text-on-surface-variant">
                        <Users className="w-3.5 h-3.5 text-secondary" />
                        <span className="font-semibold">{table.waiter || 'Mesero'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg border border-stone-border/40 text-[11px] text-on-surface-variant">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium">{table.minutes || 0} min activo</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state if all filter returns nothing */}
        {filteredTables.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-card flex items-center justify-center mx-auto border border-stone-border">
              <Filter className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant font-sans text-sm">No se encontraron mesas con el filtro seleccionado.</p>
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
              className="bg-[#fdfcf0] rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-xl space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#4a3f35] font-semibold flex items-center gap-2">
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
    </div>
  );
}
