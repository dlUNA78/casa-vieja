import React, { useState } from 'react';
import { Transaction } from '../types';
import { motion } from 'motion/react';
import { 
  History, 
  Search, 
  Trash2, 
  Printer, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface HistoryLogProps {
  transactions: Transaction[];
  onVoidTransaction: (id: string) => void;
}

export default function HistoryLog({
  transactions,
  onVoidTransaction
}: HistoryLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [voidFeedbackId, setVoidFeedbackId] = useState<string | null>(null);

  const filtered = transactions.filter(tx => {
    const q = searchQuery.toLowerCase().trim();
    return tx.folio.toLowerCase().includes(q) || 
           tx.type.toLowerCase().includes(q) || 
           tx.method.toLowerCase().includes(q) ||
           tx.total.toString().includes(q);
  });

  const handleVoid = (id: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar/anular esta transacción? Se descontará del balance diario.')) {
      onVoidTransaction(id);
      setVoidFeedbackId(id);
      setTimeout(() => setVoidFeedbackId(null), 1500);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide space-y-6" id="history-log-view">
      
      {/* Page Header */}
      <div className="border-b border-stone-border pb-6">
        <h2 className="text-3xl font-serif text-[#4a3f35] font-semibold tracking-tight">Historial de Ventas</h2>
        <p className="text-sm text-on-surface-variant font-sans mt-1">
          Consulte, reimprima o anule las transacciones realizadas durante la jornada activa.
        </p>
      </div>

      {/* Action Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por folio o mesa..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-card border border-stone-border/60 focus:border-primary focus:ring-0 text-sm font-sans"
          />
        </div>
        <span className="text-xs font-sans text-on-surface-variant font-medium self-end sm:self-auto bg-stone-card px-3 py-1.5 rounded-lg border border-stone-border/40">
          Total registradas: <strong className="text-on-surface">{transactions.length}</strong>
        </span>
      </div>

      {/* Transactions Grid */}
      <div className="space-y-3">
        {filtered.map(tx => (
          <div 
            key={tx.id}
            className="bg-[#f7f3e9] rounded-xl p-4 border border-stone-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary border border-stone-border/50 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{tx.folio}</span>
                  <span className="text-[10px] font-sans font-bold bg-secondary-container text-[#5f6732] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {tx.type}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant font-sans flex items-center gap-2">
                  <span>{tx.timestamp}</span>
                  <span>•</span>
                  <span>Pago: {tx.method}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-border/40">
              <div className="text-right">
                <p className="text-xs text-on-surface-variant font-sans">Monto cobrado</p>
                <p className="text-lg font-serif font-bold text-[#4a3f35]">${tx.total.toFixed(2)}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Reimprimiendo ticket de folio ${tx.folio}...`)}
                  className="p-2.5 rounded-xl border border-stone-border/80 hover:bg-white transition-colors"
                  title="Reimprimir ticket"
                >
                  <Printer className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button
                  onClick={() => handleVoid(tx.id)}
                  className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 transition-colors"
                  title="Anular venta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-card flex items-center justify-center mx-auto border border-stone-border">
              <History className="w-6 h-6 text-on-surface-variant" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-on-surface">Sin registros</h4>
            <p className="text-on-surface-variant font-sans text-xs">No se encontraron ventas completadas.</p>
          </div>
        )}
      </div>

    </div>
  );
}
