import React, { useState } from 'react';
import { MenuItem, OrderItem, OrderOption } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, MessageSquare, Coffee, Check, Eye, X } from 'lucide-react';

interface MenuCatalogProps {
  menuItems: MenuItem[];
  onAddToOrder: (item: MenuItem, quantity: number, notes: string, options?: OrderOption[]) => void;
  activeSearchQuery: string;
}

export default function MenuCatalog({
  menuItems,
  onAddToOrder,
  activeSearchQuery
}: MenuCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Desayunos' | 'Comidas' | 'Antojitos' | 'Bebidas' | 'Postres' | 'Especiales'>('Todos');
  const [localSearch, setLocalSearch] = useState('');
  
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [customNotes, setCustomNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  
  const [addedItemFeedbackId, setAddedItemFeedbackId] = useState<string | null>(null);

  const categories: ('Todos' | 'Desayunos' | 'Comidas' | 'Antojitos' | 'Bebidas' | 'Postres' | 'Especiales')[] = [
    'Todos', 'Desayunos', 'Comidas', 'Antojitos', 'Bebidas', 'Postres', 'Especiales'
  ];

  // Filters logic combining Category tabs and Topbar / Local Search query
  const query = (activeSearchQuery || localSearch).toLowerCase().trim();
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(query) || 
                          item.description.toLowerCase().includes(query) ||
                          item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemForModal(item);
    setCustomNotes('');
    setItemQuantity(1);
    
    // Pre-select first option for required single-select groups
    const initialOptions: Record<string, string[]> = {};
    if (item.optionGroups) {
      item.optionGroups.forEach(group => {
        if (group.required && !group.multiSelect && group.options.length > 0) {
          initialOptions[group.name] = [group.options[0].name];
        } else {
          initialOptions[group.name] = [];
        }
      });
    }
    setSelectedOptions(initialOptions);
  };

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenAddModal(item, e);
  };

  const handleOptionToggle = (groupName: string, optionName: string, multiSelect: boolean = false) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[groupName] || [];
      if (multiSelect) {
        if (currentSelections.includes(optionName)) {
          return { ...prev, [groupName]: currentSelections.filter(n => n !== optionName) };
        } else {
          return { ...prev, [groupName]: [...currentSelections, optionName] };
        }
      } else {
        return { ...prev, [groupName]: [optionName] };
      }
    });
  };

  const handleConfirmAddModal = () => {
    if (selectedItemForModal) {
      // Validate required groups
      if (selectedItemForModal.optionGroups) {
        for (const group of selectedItemForModal.optionGroups) {
          if (group.required && (!selectedOptions[group.name] || selectedOptions[group.name].length === 0)) {
            alert(`Por favor selecciona una opción para: ${group.name}`);
            return;
          }
        }
      }
      
      const parsedOptions: OrderOption[] = [];
      if (selectedItemForModal.optionGroups) {
        selectedItemForModal.optionGroups.forEach(group => {
          const selected = selectedOptions[group.name] || [];
          selected.forEach(optName => {
            const opt = group.options.find(o => o.name === optName);
            if (opt) {
              parsedOptions.push({
                groupName: group.name,
                optionName: opt.name,
                priceDelta: opt.priceDelta
              });
            }
          });
        });
      }
      
      onAddToOrder(selectedItemForModal, itemQuantity, customNotes, parsedOptions);
      
      const addedId = selectedItemForModal.id;
      setSelectedItemForModal(null);
      setAddedItemFeedbackId(addedId);
      setTimeout(() => {
        setAddedItemFeedbackId(null);
      }, 1200);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide flex flex-col space-y-6" id="menu-catalog-view">
      
      {/* Category Tabs list */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide shrink-0" id="category-scroller">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wide whitespace-nowrap transition-all border ${
              selectedCategory === cat 
                ? 'bg-secondary-container text-on-secondary-container border-secondary font-bold shadow-sm' 
                : 'bg-stone-card hover:bg-[#e9e4d5] text-on-surface-variant border-stone-border/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Standalone search bar on mobile/small view if needed */}
      <div className="relative md:hidden shrink-0">
        <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
        <input 
          type="text" 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Buscar platillo..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-card border border-stone-border/60 focus:border-primary focus:ring-0 text-sm font-sans placeholder-on-surface-variant/50"
        />
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const hasImg = !!item.image;
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4, shadow: '0 8px 30px rgba(144, 77, 0, 0.08)' }}
                className="bg-[#f7f3e9] rounded-2xl border border-stone-border overflow-hidden cursor-pointer hover:shadow-md transition-all group relative flex flex-col justify-between"
                onClick={(e) => handleQuickAdd(item, e)}
              >
                {/* Visual Section */}
                {hasImg ? (
                  <div className="h-40 w-full bg-surface-container-highest relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <span className="absolute bottom-3 right-3 text-[#fbfaee] font-serif text-xl font-bold bg-primary/80 px-3 py-1 rounded-lg backdrop-blur-xs">
                      ${item.price}
                    </span>
                    <span className="absolute top-3 left-3 text-[10px] text-white/90 bg-secondary/85 font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                ) : (
                  <div className="p-5 flex flex-col justify-between flex-1 min-h-[140px] relative bg-gradient-to-br from-stone-card to-[#efeae0]">
                    <div className="absolute top-4 right-4 text-primary font-serif text-xl font-bold bg-primary-fixed/60 px-2.5 py-0.5 rounded-lg border border-primary/10">
                      ${item.price}
                    </div>
                    <div className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary mb-4 border border-stone-border/40">
                      <span className="material-symbols-outlined text-2xl">
                        {item.icon || 'restaurant_menu'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Description details */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-sans line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions Bar inside Card */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-border/50">
                    <button
                      onClick={(e) => handleOpenAddModal(item, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                      title={item.optionGroups && item.optionGroups.length > 0 ? "Seleccionar opciones y extras" : "Agregar notas de preparación"}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.optionGroups && item.optionGroups.length > 0 ? "Opciones" : "Agregar Nota"}</span>
                    </button>

                    <button
                      type="button"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        addedItemFeedbackId === item.id 
                          ? 'bg-secondary text-white scale-110' 
                          : 'bg-primary text-white hover:bg-primary-container hover:scale-105'
                      }`}
                    >
                      {addedItemFeedbackId === item.id ? (
                        <Check className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-card flex items-center justify-center mx-auto border border-stone-border">
              <Search className="w-6 h-6 text-on-surface-variant" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-on-surface">No se encontraron resultados</h4>
            <p className="text-on-surface-variant font-sans text-xs">Prueba con otra búsqueda o cambia de categoría.</p>
          </div>
        )}
      </div>

      {/* Add Item with options and notes Modal */}
      <AnimatePresence>
        {selectedItemForModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#fdfcf0] rounded-2xl max-w-lg w-full p-6 border border-stone-border shadow-xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start shrink-0 pb-4 border-b border-stone-border/60">
                <div className="space-y-1">
                  <span className="text-[10px] bg-secondary/20 text-secondary font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedItemForModal.category}
                  </span>
                  <h3 className="text-xl font-serif text-on-surface font-bold mt-1 pr-4">
                    {selectedItemForModal.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                    {selectedItemForModal.description}
                  </p>
                </div>
                <div className="text-primary font-serif text-xl font-bold bg-primary-fixed text-primary px-3 py-1 rounded-xl whitespace-nowrap">
                  ${selectedItemForModal.price}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto scrollbar-hide py-4 space-y-6 flex-1">
                
                {/* Options Groups */}
                {selectedItemForModal.optionGroups?.map(group => (
                  <div key={group.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface">
                        {group.name}
                      </label>
                      {group.required && !group.multiSelect && (
                        <span className="text-[10px] font-sans font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Requerido</span>
                      )}
                      {group.multiSelect && (
                        <span className="text-[10px] font-sans text-on-surface-variant">Selección Múltiple</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {group.options.map(opt => {
                        const isSelected = selectedOptions[group.name]?.includes(opt.name);
                        
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => handleOptionToggle(group.name, opt.name, group.multiSelect)}
                            className={`flex flex-col items-start justify-center p-3 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                : 'bg-stone-card border-stone-border/60 text-on-surface hover:border-primary/50'
                            }`}
                          >
                            <div className="flex justify-between w-full items-center">
                              <span className={`font-sans text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                {opt.name}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                            {opt.priceDelta > 0 && (
                              <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                                +${opt.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Prep Notes */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">Especificaciones o Notas (Opcional)</label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Ej. Sin cebolla, extra crema, salsa por separado, etc."
                    className="w-full p-3 rounded-xl bg-stone-card border border-stone-border focus:border-primary focus:ring-0 text-xs font-sans text-on-surface placeholder:text-on-surface-variant/40 h-20 resize-none transition-all"
                  />
                </div>
                
                {/* Quantity Selector */}
                <div className="space-y-2 pt-2 border-t border-stone-border/60">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">Cantidad</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-stone-card rounded-xl p-1 border border-stone-border/60">
                      <button 
                        type="button"
                        onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-stone-border/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-md">remove</span>
                      </button>
                      <span className="w-12 text-center font-sans font-bold text-on-surface text-lg">
                        {itemQuantity}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setItemQuantity(prev => prev + 1)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-stone-border/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-md">add</span>
                      </button>
                    </div>
                    <div className="text-sm font-sans text-on-surface-variant">
                      Total: <span className="font-bold text-on-surface text-md">
                        ${((selectedItemForModal.price + 
                           (selectedItemForModal.optionGroups?.flatMap(g => 
                              (selectedOptions[g.name] || []).map(optName => g.options.find(o => o.name === optName)?.priceDelta || 0)
                            ).reduce((sum, current) => sum + current, 0) || 0)
                          ) * itemQuantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-border/60 shrink-0">
                <button
                  onClick={() => setSelectedItemForModal(null)}
                  className="flex-1 py-3 border border-stone-border rounded-xl text-xs font-semibold font-sans uppercase tracking-wider hover:bg-stone-card transition-colors text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAddModal}
                  className="flex-1 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold font-sans uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Orden</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
