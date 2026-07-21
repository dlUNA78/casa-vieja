import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';

interface CashoutFlowProps {
  expectedCash: number;
  transactions?: Transaction[];
  onConfirmPrint: (declaredTotal: number) => void;
}

const DENOMINATIONS = [
  { value: 1000, label: '$1000', type: 'billete' },
  { value: 500, label: '$500', type: 'billete' },
  { value: 200, label: '$200', type: 'billete' },
  { value: 100, label: '$100', type: 'billete' },
  { value: 50, label: '$50', type: 'billete' },
  { value: 20, label: '$20', type: 'billete' },
  { value: 20, label: '$20', type: 'moneda' },
  { value: 10, label: '$10', type: 'moneda' },
  { value: 5, label: '$5', type: 'moneda' },
  { value: 2, label: '$2', type: 'moneda' },
  { value: 1, label: '$1', type: 'moneda' },
  { value: 0.5, label: '50¢', type: 'moneda' }
];

const FONDO_CAJA = 1000;

export default function CashoutFlow({ expectedCash, transactions = [], onConfirmPrint }: CashoutFlowProps) {
  const [step, setStep] = useState(1);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [isPrinting, setIsPrinting] = useState(false);

  const handleCountChange = (value: number, amount: string) => {
    const count = amount === '' ? 0 : parseInt(amount, 10);
    if (isNaN(count)) return;
    setCounts(prev => ({ ...prev, [value]: count }));
  };

  const declaredTotal = useMemo(() => {
    return Object.entries(counts).reduce((acc, [val, count]) => acc + (parseFloat(val) * (count as number)), 0);
  }, [counts]);

  const expectedPhysicalCash = expectedCash + FONDO_CAJA;
  const difference = declaredTotal - expectedPhysicalCash;
  const isMatch = Math.abs(difference) < 0.01;

  const handlePrintAndConfirm = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false);
        onConfirmPrint(declaredTotal);
      }, 500);
    }, 100);
  };

  const totalCard = transactions.filter(t => t.method === 'Tarjeta').reduce((sum, t) => sum + t.total, 0);
  const totalSales = expectedCash + totalCard;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full relative">
      <h2 className="text-3xl font-serif font-bold text-primary mb-2">Cierre de Caja</h2>
      <p className="text-on-surface-variant font-sans mb-8">
        {step === 1 ? 'Paso 1: Arqueo de Caja - Ingrese la cantidad física.' : 'Paso 2: Validación Visual - Revise diferencias e imprima el ticket.'}
      </p>

      <div className="flex gap-2 mb-8">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-surface-container-lowest rounded-2xl shadow-sm border border-stone-border p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg font-serif mb-4 text-on-surface border-b border-stone-border/50 pb-2">Billetes</h3>
                <div className="space-y-3">
                  {DENOMINATIONS.filter(d => d.type === 'billete').map((denom, idx) => (
                    <div key={`billete-${denom.value}-${idx}`} className="flex items-center gap-4">
                      <span className="w-16 font-bold text-on-surface">{denom.label}</span>
                      <span className="text-on-surface-variant">x</span>
                      <input
                        type="number"
                        min="0"
                        value={counts[denom.value] || ''}
                        onChange={(e) => handleCountChange(denom.value, e.target.value)}
                        className="w-20 p-2 border border-stone-border rounded-lg bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0"
                      />
                      <span className="font-bold text-primary ml-auto">
                        ${((counts[denom.value] || 0) * denom.value).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif mb-4 text-on-surface border-b border-stone-border/50 pb-2">Monedas</h3>
                <div className="space-y-3">
                  {DENOMINATIONS.filter(d => d.type === 'moneda').map((denom, idx) => (
                    <div key={`moneda-${denom.value}-${idx}`} className="flex items-center gap-4">
                      <span className="w-16 font-bold text-on-surface">{denom.label}</span>
                      <span className="text-on-surface-variant">x</span>
                      <input
                        type="number"
                        min="0"
                        value={counts[denom.value] || ''}
                        onChange={(e) => handleCountChange(denom.value, e.target.value)}
                        className="w-20 p-2 border border-stone-border rounded-lg bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0"
                      />
                      <span className="font-bold text-primary ml-auto">
                        ${((counts[denom.value] || 0) * denom.value).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-border flex justify-between items-center">
              <div>
                <span className="text-on-surface-variant text-sm font-bold uppercase tracking-wider block">Total Físico Declarado</span>
                <span className="text-3xl font-bold text-primary">${declaredTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setStep(2)}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
              >
                <span>Continuar a Validación</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-stone-border shadow-sm">
              <h3 className="text-lg font-bold font-serif mb-4 border-b border-stone-border pb-2">Resumen del Turno</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-surface-container-high rounded-lg">
                  <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Ventas Efectivo</span>
                  <span className="font-bold text-lg">${expectedCash.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-surface-container-high rounded-lg">
                  <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Ventas Tarjeta</span>
                  <span className="font-bold text-lg">${totalCard.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-primary-fixed/50 rounded-lg">
                  <span className="text-xs text-primary uppercase font-bold block mb-1">Total Ventas</span>
                  <span className="font-bold text-lg text-primary">${totalSales.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-secondary-fixed/50 rounded-lg">
                  <span className="text-xs text-secondary uppercase font-bold block mb-1">Fondo Fijo</span>
                  <span className="font-bold text-lg text-secondary">${FONDO_CAJA.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-stone-border shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-on-surface-variant font-bold text-sm uppercase tracking-wider mb-2">Efectivo Esperado</span>
                <span className="text-3xl font-bold text-on-surface">${expectedPhysicalCash.toFixed(2)}</span>
                <span className="text-xs text-on-surface-variant mt-2">(Ventas + Fondo)</span>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-stone-border shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-on-surface-variant font-bold text-sm uppercase tracking-wider mb-2">Total Declarado</span>
                <span className="text-3xl font-bold text-primary">${declaredTotal.toFixed(2)}</span>
                <span className="text-xs text-on-surface-variant mt-2">Arqueo físico</span>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center ${isMatch ? 'bg-[#e8f5e9] border-[#a5d6a7]' : difference > 0 ? 'bg-[#e3f2fd] border-[#90caf9]' : 'bg-[#ffebee] border-[#ef9a9a]'}`}>
                <span className={`font-bold text-sm uppercase tracking-wider mb-2 ${isMatch ? 'text-[#2e7d32]' : difference > 0 ? 'text-[#1565c0]' : 'text-[#c62828]'}`}>Diferencia</span>
                <span className={`text-4xl font-bold ${isMatch ? 'text-[#2e7d32]' : difference > 0 ? 'text-[#1565c0]' : 'text-[#c62828]'}`}>
                  {difference > 0 ? '+' : ''}{difference.toFixed(2)}
                </span>
                <span className={`text-xs font-bold mt-2 flex items-center gap-1 ${isMatch ? 'text-[#2e7d32]' : difference > 0 ? 'text-[#1565c0]' : 'text-[#c62828]'}`}>
                  {isMatch ? (
                    <><CheckCircle className="w-4 h-4"/> Cuadre Perfecto</>
                  ) : difference > 0 ? (
                    <><AlertTriangle className="w-4 h-4"/> Sobrante</>
                  ) : (
                    <><AlertTriangle className="w-4 h-4"/> Faltante</>
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 bg-surface-container-lowest p-6 rounded-2xl border border-stone-border shadow-sm">
              <button
                onClick={() => setStep(1)}
                className="text-on-surface hover:bg-surface-container-high py-2.5 px-5 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al Arqueo</span>
              </button>
              <button
                onClick={handlePrintAndConfirm}
                className="bg-secondary hover:bg-[#434b18] text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors shadow-md"
              >
                <Printer className="w-5 h-5" />
                <span>Cerrar Turno e Imprimir Ticket</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Print Area */}
      {isPrinting && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] text-black font-mono">
          <div className="w-[80mm] max-w-full mx-auto p-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1">CASA VIEJA</h1>
              <p className="text-sm border-b-2 border-black pb-4 border-dashed">
                *** REPORTE CORTE DE CAJA ***
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm">FECHA: {new Date().toLocaleDateString()}</p>
              <p className="text-sm">HORA: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="border-t-2 border-black border-dashed pt-4 mb-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>FONDO DE CAJA:</span>
                <span>${FONDO_CAJA.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VENTAS EFECTIVO:</span>
                <span>${expectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VENTAS TARJETA:</span>
                <span>${totalCard.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-black/20">
                <span>TOTAL VENTAS:</span>
                <span>${totalSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t-2 border-black border-dashed pt-4 mb-4 space-y-1 text-sm">
              <div className="flex justify-between font-bold">
                <span>EFECTIVO ESPERADO:</span>
                <span>${expectedPhysicalCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>TOTAL DECLARADO:</span>
                <span>${declaredTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>DIFERENCIA:</span>
                <span>{difference > 0 ? '+' : ''}{difference.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center border-t-2 border-black border-dashed pt-4 mt-6">
              <p className="font-bold">FIRMA CAJERO/GERENTE</p>
              <br/><br/>
              <p>___________________________</p>
              <p className="mt-4 text-xs">FIN DE REPORTE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
