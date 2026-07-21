import React, { useState } from 'react';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Filter, 
  Receipt,
  FileSpreadsheet,
  Check,
  Smartphone
} from 'lucide-react';

interface FinancialSummaryProps {
  transactions: Transaction[];
  onPrintShiftClosure: () => void;
}

export default function FinancialSummary({
  transactions,
  onPrintShiftClosure
}: FinancialSummaryProps) {
  const [filterMethod, setFilterMethod] = useState<'all' | 'Tarjeta' | 'Efectivo'>('all');
  const [showPrintSuccessModal, setShowPrintSuccessModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Totals calculations
  const totalSales = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const cashSales = transactions
    .filter(tx => tx.method === 'Efectivo')
    .reduce((sum, tx) => sum + tx.total, 0);
  const cardSales = transactions
    .filter(tx => tx.method === 'Tarjeta')
    .reduce((sum, tx) => sum + tx.total, 0);

  const cashPercent = totalSales > 0 ? (cashSales / totalSales) * 100 : 0;
  const cardPercent = totalSales > 0 ? (cardSales / totalSales) * 100 : 0;

  const filteredTransactions = transactions.filter(tx => {
    if (filterMethod === 'all') return true;
    return tx.method === filterMethod;
  });

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setShowPrintSuccessModal(true);
      onPrintShiftClosure();
    }, 1500);
  };

  return (
    <div className="flex-grow p-6 md:p-8 overflow-y-auto scrollbar-hide space-y-8" id="financial-summary-view">
      
      {/* Header section */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-border pb-6">
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest font-sans">Resumen Financiero</p>
          <h1 className="text-3xl font-serif font-semibold text-on-surface mt-1">Corte de Caja - Turno Matutino</h1>
        </div>
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="bg-surface-container-lowest hover:bg-surface-container text-primary border border-primary/20 font-sans text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {isPrinting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Imprimiendo...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Imprimir Cierre</span>
            </>
          )}
        </button>
      </section>

      {/* Summary Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Sales totals */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-stone-border flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-7xl text-primary">point_of_sale</span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-sans">Ventas Totales</h3>
          <div className="mt-6">
            <p className="text-4xl md:text-5xl font-serif text-primary font-bold">
              ${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-secondary mt-2 flex items-center gap-1 font-sans">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">+12% vs ayer</span>
            </p>
          </div>
        </div>

        {/* Card 2: Cash in safe */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-stone-border flex flex-col justify-between min-h-[160px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-sans flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-secondary" />
            <span>Efectivo en Caja</span>
          </h3>
          <div className="mt-6">
            <p className="text-3xl font-serif text-on-surface font-semibold">
              ${cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="w-full bg-stone-border/50 h-1.5 mt-4 rounded-full overflow-hidden">
              <div 
                className="bg-secondary h-full rounded-full transition-all duration-500" 
                style={{ width: `${cashPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-on-surface-variant font-sans mt-1.5 font-medium">
              {cashPercent.toFixed(0)}% del total general
            </p>
          </div>
        </div>

        {/* Card 3: Card Sales */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-stone-border flex flex-col justify-between min-h-[160px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-sans flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>Pagos con Terminal (Tarjeta)</span>
          </h3>
          <div className="mt-6">
            <p className="text-3xl font-serif text-on-surface font-semibold">
              ${cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="w-full bg-stone-border/50 h-1.5 mt-4 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${cardPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-on-surface-variant font-sans mt-1.5 font-medium">
              {cardPercent.toFixed(0)}% del total general
            </p>
          </div>
        </div>
      </section>

      {/* Recent Transactions Table */}
      <section className="bg-surface-container-lowest rounded-2xl border border-stone-border overflow-hidden">
        <div className="p-5 border-b border-stone-border bg-surface-container flex justify-between items-center">
          <h2 className="font-serif text-lg font-semibold text-on-surface flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span>Transacciones Recientes</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-on-surface-variant hidden sm:inline">Filtrar método:</span>
            <div className="flex bg-stone-card rounded-lg p-0.5 border border-stone-border">
              <button 
                onClick={() => setFilterMethod('all')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  filterMethod === 'all' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterMethod('Tarjeta')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  filterMethod === 'Tarjeta' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Tarjeta
              </button>
              <button 
                onClick={() => setFilterMethod('Efectivo')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  filterMethod === 'Efectivo' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Efectivo
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-border bg-white/45">
                <th className="py-4 px-6 text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant">Hora</th>
                <th className="py-4 px-6 text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant">Folio</th>
                <th className="py-4 px-6 text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant">Origen / Tipo</th>
                <th className="py-4 px-6 text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant">Método</th>
                <th className="py-4 px-6 text-xs font-bold font-sans uppercase tracking-wider text-on-surface-variant text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border/30 text-sm font-sans">
              {filteredTransactions.map((tx, idx) => {
                const isTakeout = tx.type === 'Para Llevar';
                const isBar = tx.type === 'Barra';
                
                return (
                  <tr key={tx.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-on-surface">{tx.timestamp}</td>
                    <td className="py-4 px-6 text-on-surface-variant font-mono text-xs">{tx.folio}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        isTakeout 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : isBar
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-secondary-container text-on-secondary-container border border-secondary/20'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {isTakeout ? 'local_mall' : 'deck'}
                        </span>
                        <span>{tx.type}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                        {tx.method === 'Tarjeta' ? (
                          <Smartphone className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Banknote className="w-3.5 h-3.5 text-secondary" />
                        )}
                        <span>{tx.method}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-on-surface">
                      ${tx.total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant/60 font-sans">
                    No hay transacciones registradas con este método.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-border bg-white flex justify-center">
          <button className="text-secondary hover:text-primary text-xs font-bold uppercase tracking-wider font-sans transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer">
            <span>Ver transacciones anteriores</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Printing Receipt Animation Dialog */}
      <AnimatePresence>
        {showPrintSuccessModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-xl space-y-6 text-center"
            >
              <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto border border-secondary/20">
                <Check className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-on-surface font-bold">Cierre de Turno Impreso</h3>
                <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                  El reporte financiero del turno matutino con folio <span className="font-mono text-primary font-bold">#CR-00134</span> se ha enviado correctamente a la ticketera principal de caja.
                </p>
              </div>

              <div className="border-t border-stone-border/60 pt-4">
                <button
                  onClick={() => setShowPrintSuccessModal(false)}
                  className="w-full py-3 bg-secondary hover:bg-tertiary text-white rounded-xl text-xs font-semibold font-sans uppercase tracking-wider transition-colors shadow-md"
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
