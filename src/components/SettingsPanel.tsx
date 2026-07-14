import React, { useState } from 'react';
import { MenuItem, Table } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Check, 
  UtensilsCrossed, 
  Layout, 
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

interface SettingsPanelProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onRemoveMenuItem: (id: string) => void;
  tables: Table[];
  onAddTable: (table: Table) => void;
  onRemoveTable: (id: string) => void;
  onResetAll: () => void;
}

export default function SettingsPanel({
  menuItems,
  onAddMenuItem,
  onRemoveMenuItem,
  tables,
  onAddTable,
  onRemoveTable,
  onResetAll
}: SettingsPanelProps) {
  // New Dish state
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState<'Desayunos' | 'Antojitos' | 'Bebidas' | 'Postres' | 'Especiales'>('Desayunos');
  const [dishDesc, setDishDesc] = useState('');
  
  // New Table state
  const [tableNum, setTableNum] = useState('');

  // Feedbacks
  const [showDishSuccess, setShowDishSuccess] = useState(false);
  const [showTableSuccess, setShowTableSuccess] = useState(false);

  const categories: ('Desayunos' | 'Antojitos' | 'Bebidas' | 'Postres' | 'Especiales')[] = [
    'Desayunos', 'Antojitos', 'Bebidas', 'Postres', 'Especiales'
  ];

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice) return;

    const newItem: MenuItem = {
      id: `custom_${Date.now()}`,
      name: dishName,
      price: parseFloat(dishPrice),
      category: dishCategory,
      description: dishDesc || 'Sin descripción.',
      icon: 'restaurant_menu'
    };

    onAddMenuItem(newItem);
    setDishName('');
    setDishPrice('');
    setDishDesc('');
    
    setShowDishSuccess(true);
    setTimeout(() => setShowDishSuccess(false), 2000);
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNum) return;

    const num = parseInt(tableNum);
    if (isNaN(num)) return;

    // Check if table number already exists
    if (tables.some(t => t.number === num)) {
      alert(`La mesa número ${num} ya existe.`);
      return;
    }

    const newTable: Table = {
      id: `table_custom_${Date.now()}`,
      number: num,
      status: 'available',
      currentOrder: []
    };

    onAddTable(newTable);
    setTableNum('');

    setShowTableSuccess(true);
    setTimeout(() => setShowTableSuccess(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de que desea restablecer todo el punto de venta a sus valores predeterminados? Se borrarán las comandas activas y el historial.')) {
      onResetAll();
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide space-y-10" id="settings-view">
      
      {/* Header */}
      <div className="border-b border-stone-border pb-6">
        <h2 className="text-3xl font-serif text-[#4a3f35] font-semibold tracking-tight">Panel de Configuración</h2>
        <p className="text-sm text-on-surface-variant font-sans mt-1">
          Administre el catálogo de platillos del restaurante, la disposición de mesas del salón y las configuraciones del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Add Dish */}
        <section className="bg-[#f7f3e9] p-6 rounded-2xl border border-stone-border space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif text-on-surface font-semibold flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <span>Agregar Nuevo Platillo</span>
            </h3>
            <p className="text-xs text-on-surface-variant font-sans">Incorpore opciones de menú con asignación de categoría y precio.</p>
          </div>

          <form onSubmit={handleCreateDish} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-on-surface font-sans uppercase tracking-wide">Nombre del Platillo *</label>
                <input 
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="Ej. Enmoladas"
                  className="w-full p-3 rounded-xl bg-white border border-stone-border/80 focus:border-primary focus:ring-0 text-sm font-sans text-on-surface"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-on-surface font-sans uppercase tracking-wide">Precio ($ MXN) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="Ej. 135"
                    className="w-full pl-8 pr-3 p-3 rounded-xl bg-white border border-stone-border/80 focus:border-primary focus:ring-0 text-sm font-sans text-on-surface font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-on-surface font-sans uppercase tracking-wide">Categoría</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDishCategory(cat)}
                    className={`p-2 rounded-lg border text-xs font-semibold font-sans tracking-wide text-center transition-all ${
                      dishCategory === cat 
                        ? 'border-primary bg-primary-fixed text-primary' 
                        : 'border-stone-border/50 bg-white hover:bg-stone-card text-on-surface-variant'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-on-surface font-sans uppercase tracking-wide">Descripción Corta</label>
              <textarea 
                value={dishDesc}
                onChange={(e) => setDishDesc(e.target.value)}
                placeholder="Ej. Tres tortillas rellenas de pollo deshebrado, bañadas en mole poblano casero..."
                className="w-full p-3 rounded-xl bg-white border border-stone-border/80 focus:border-primary focus:ring-0 text-xs font-sans text-on-surface h-20 resize-none"
              />
            </div>

            <div className="flex gap-4 items-center pt-2">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-white text-xs font-bold font-sans uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Menú</span>
              </button>

              <AnimatePresence>
                {showDishSuccess && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-sans font-semibold text-secondary flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>¡Platillo registrado con éxito!</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </section>

        {/* Section 2: Manage Tables */}
        <section className="bg-[#f7f3e9] p-6 rounded-2xl border border-stone-border space-y-6 flex flex-col justify-between">
          <div>
            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-serif text-on-surface font-semibold flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                <span>Habilitar Nueva Mesa</span>
              </h3>
              <p className="text-xs text-on-surface-variant font-sans">Agregue mesas al plano activo del comedor.</p>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-on-surface font-sans uppercase tracking-wide">Número de Mesa</label>
                <div className="flex gap-3">
                  <input 
                    type="number"
                    required
                    value={tableNum}
                    onChange={(e) => setTableNum(e.target.value)}
                    placeholder="Ej. 14"
                    className="w-24 p-3 rounded-xl bg-white border border-stone-border/80 focus:border-primary focus:ring-0 text-sm font-sans text-on-surface font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-secondary hover:bg-[#434b18] text-white text-xs font-bold font-sans uppercase tracking-wider px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Habilitar Mesa</span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showTableSuccess && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-sans font-semibold text-secondary flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>¡Mesa habilitada correctamente!</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="border-t border-stone-border/60 pt-6 mt-6 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-serif font-bold text-[#4a3f35] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Acciones del Sistema</span>
              </h4>
              <p className="text-[11px] text-on-surface-variant font-sans">Mantenimiento y depuración rápida de los datos del terminal POS.</p>
            </div>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto bg-stone-card hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-on-surface-variant border border-stone-border/80 font-sans text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restablecer POS de Casa Vieja</span>
            </button>
          </div>
        </section>

      </div>

      {/* Catalog listing removal overview */}
      <section className="bg-stone-card/30 p-6 rounded-2xl border border-stone-border/60 space-y-4">
        <h3 className="text-lg font-serif text-[#4a3f35] font-semibold">Resumen de Platillos ({menuItems.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto scrollbar-hide">
          {menuItems.map(item => (
            <div 
              key={item.id}
              className="p-3 bg-white rounded-xl border border-stone-border/40 flex items-center justify-between text-xs font-sans font-medium hover:border-primary/30 transition-colors"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-on-surface truncate max-w-[120px]">{item.name}</p>
                <p className="text-[10px] text-primary font-bold">${item.price}</p>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`¿Seguro de remover ${item.name}?`)) {
                    onRemoveMenuItem(item.id);
                  }
                }}
                className="text-on-surface-variant hover:text-red-700 p-1 rounded-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
