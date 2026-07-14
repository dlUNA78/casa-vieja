import React, { useState, useEffect } from 'react';
import { MenuItem, Table, Transaction, OrderItem } from './types';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_TRANSACTIONS 
} from './data';

import TableManagement from './components/TableManagement';
import MenuCatalog from './components/MenuCatalog';
import OrderSidebar from './components/OrderSidebar';
import FinancialSummary from './components/FinancialSummary';
import HistoryLog from './components/HistoryLog';
import SettingsPanel from './components/SettingsPanel';

import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  X, 
  Check, 
  HelpCircle,
  LogOut,
  Sparkles,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Global State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('cv_pos_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('cv_pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cv_pos_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<'Mesas' | 'Menú' | 'Historial' | 'Cartera' | 'Ajustes'>('Mesas');
  const [selectedTableId, setSelectedTableId] = useState<string | null>('table_12'); // defaults to Mesa 12 per screenshots
  const [isTakeout, setIsTakeout] = useState(false);
  const [takeoutOrder, setTakeoutOrder] = useState<OrderItem[]>([]);
  const [takeoutNotes, setTakeoutNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI States
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    'Mesa 3 solicita la cuenta',
    'Chilaquiles listos en Barra 1',
    'Corte de caja matutino iniciado'
  ]);

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('cv_pos_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('cv_pos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('cv_pos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Derived Active Table
  const activeTable = tables.find(t => t.id === selectedTableId) || null;

  // Active orders modifier helper
  const handleAddToOrderDirect = (extraItem: MenuItem, quantity: number, notes: string) => {
    handleAddToOrder(extraItem, quantity, notes);
  };

  // State actions
  const handleSelectTable = (table: Table) => {
    setSelectedTableId(table.id);
    setIsTakeout(false);
    setActiveTab('Menú');
    setMobileMenuOpen(false);
  };

  const handleCleanTable = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, status: 'available', currentOrder: [] };
      }
      return t;
    }));
    // Add real-time notification
    addNotification(`Mesa ${tables.find(t => t.id === tableId)?.number} se encuentra limpia y disponible`);
  };

  const handleStartTakeout = () => {
    setIsTakeout(true);
    setSelectedTableId(null);
    setTakeoutOrder([]);
    setTakeoutNotes('');
    setActiveTab('Menú');
  };

  const handleAssignTable = (tableId: string, waiter: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { 
          ...t, 
          status: 'occupied', 
          waiter, 
          minutes: 1, 
          currentOrder: [] 
        };
      }
      return t;
    }));
    setSelectedTableId(tableId);
    setIsTakeout(false);
    setActiveTab('Menú');
  };

  // Add Item to Order
  const handleAddToOrder = (item: MenuItem, quantity: number, notes: string) => {
    if (isTakeout) {
      setTakeoutOrder(prev => {
        const exists = prev.find(o => o.menuItem.id === item.id && o.notes === notes);
        if (exists) {
          return prev.map(o => {
            if (o.menuItem.id === item.id && o.notes === notes) {
              return { ...o, quantity: o.quantity + quantity };
            }
            return o;
          });
        }
        return [...prev, { menuItem: item, quantity, notes }];
      });
    } else if (selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          const order = [...t.currentOrder];
          const exists = order.find(o => o.menuItem.id === item.id && o.notes === notes);
          if (exists) {
            const updated = order.map(o => {
              if (o.menuItem.id === item.id && o.notes === notes) {
                return { ...o, quantity: o.quantity + quantity };
              }
              return o;
            });
            return { ...t, currentOrder: updated };
          } else {
            return { ...t, currentOrder: [...order, { menuItem: item, quantity, notes }] };
          }
        }
        return t;
      }));
    }
  };

  // Quantity updates on active ticket
  const handleUpdateQuantity = (menuItemId: string, change: number) => {
    if (isTakeout) {
      setTakeoutOrder(prev => {
        return prev.map(o => {
          if (o.menuItem.id === menuItemId) {
            const newQty = o.quantity + change;
            return newQty > 0 ? { ...o, quantity: newQty } : null;
          }
          return o;
        }).filter(Boolean) as OrderItem[];
      });
    } else if (selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          const updated = t.currentOrder.map(o => {
            if (o.menuItem.id === menuItemId) {
              const newQty = o.quantity + change;
              return newQty > 0 ? { ...o, quantity: newQty } : null;
            }
            return o;
          }).filter(Boolean) as OrderItem[];
          return { ...t, currentOrder: updated };
        }
        return t;
      }));
    }
  };

  // Clear entire active order
  const handleClearOrder = () => {
    if (isTakeout) {
      setTakeoutOrder([]);
      setTakeoutNotes('');
    } else if (selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          return { ...t, currentOrder: [] };
        }
        return t;
      }));
    }
  };

  // Cook notes
  const handleUpdateTakeoutNotes = (notes: string) => {
    setTakeoutNotes(notes);
  };

  const handleUpdateTableNotes = (tableId: string, notes: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, orderNotes: notes };
      }
      return t;
    }));
  };

  const handleComandaSent = () => {
    addNotification(
      isTakeout 
        ? 'Nueva comanda para llevar enviada a cocina.' 
        : `Comanda de Mesa ${activeTable?.number} enviada a cocina.`
    );
  };

  const handleSaveOrder = () => {
    addNotification(`Orden de Mesa ${activeTable?.number} guardada.`);
  };

  // Complete Payment & checkout
  const handleCheckoutOrder = (paymentMethod: 'Tarjeta' | 'Efectivo', total: number) => {
    const nextFolioNum = 142 + transactions.length;
    const folioStr = `#00${nextFolioNum}`;

    // Get active local hour
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const timestampStr = `${hours}:${minutes} ${ampm}`;

    const dateStr = now.toISOString().split('T')[0];

    const originStr = isTakeout ? 'Para Llevar' : `Mesa ${activeTable?.number}`;

    const newTx: Transaction = {
      id: `tx_${nextFolioNum}`,
      folio: folioStr,
      timestamp: timestampStr,
      date: dateStr,
      type: originStr,
      method: paymentMethod,
      total
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update table status to dirty (needs cleaning!) to simulate real restaurant flow
    if (!isTakeout && selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          return { ...t, status: 'dirty', currentOrder: [], orderNotes: '' };
        }
        return t;
      }));
      setSelectedTableId(null);
    } else if (isTakeout) {
      setTakeoutOrder([]);
      setTakeoutNotes('');
    }

    addNotification(`Venta completada por $${total.toFixed(2)}. Folio ${folioStr}`);
    
    // Automatically switch to Cartera/Reports view so the user can verify immediately
    setActiveTab('Cartera');
  };

  // Support / Settings additions
  const handleAddMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const handleRemoveMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddTable = (table: Table) => {
    setTables(prev => [...prev, table]);
  };

  const handleRemoveTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
  };

  const handleVoidTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    addNotification('Transacción anulada correctamente.');
  };

  const handleResetAll = () => {
    localStorage.removeItem('cv_pos_menu');
    localStorage.removeItem('cv_pos_tables');
    localStorage.removeItem('cv_pos_transactions');
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSelectedTableId('table_12');
    setIsTakeout(false);
    setTakeoutOrder([]);
    setActiveTab('Mesas');
    addNotification('Punto de venta restablecido.');
  };

  // Notification helper
  const addNotification = (text: string) => {
    setNotifications(prev => [text, ...prev.slice(0, 5)]);
    setShowNotificationPopup(true);
    setTimeout(() => {
      setShowNotificationPopup(false);
    }, 4000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#fbfaee] text-[#1b1c15] font-sans">
      
      {/* SideNavBar matching image 5 style perfectly */}
      <nav className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-4 bg-surface-dim docked w-20 bg-surface-container-high border-r border-outline-variant shadow-sm hidden md:flex shrink-0">
        <div className="mb-8 mt-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-serif text-xl font-bold border border-outline-variant shadow-xs">
            CV
          </div>
        </div>
        
        <ul className="flex flex-col w-full gap-4 items-center flex-1">
          {/* Mesas Tab */}
          <li className="w-full flex justify-center">
            <button 
              onClick={() => { setActiveTab('Mesas'); setIsTakeout(false); }}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all scale-95 duration-150 ease-in-out group relative cursor-pointer ${
                activeTab === 'Mesas' 
                  ? 'text-primary bg-surface-container-highest border-l-4 border-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'Mesas' ? "'FILL' 1" : "'FILL' 0" }}>
                table_restaurant
              </span>
              <span className="text-[10px] mt-1 font-sans font-semibold">Mesas</span>
            </button>
          </li>

          {/* Menú Tab */}
          <li className="w-full flex justify-center">
            <button 
              onClick={() => setActiveTab('Menú')}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all scale-95 duration-150 ease-in-out group relative cursor-pointer ${
                activeTab === 'Menú' 
                  ? 'text-primary bg-surface-container-highest border-l-4 border-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'Menú' ? "'FILL' 1" : "'FILL' 0" }}>
                restaurant_menu
              </span>
              <span className="text-[10px] mt-1 font-sans font-semibold">Menú</span>
            </button>
          </li>

          {/* Historial Tab */}
          <li className="w-full flex justify-center">
            <button 
              onClick={() => setActiveTab('Historial')}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all scale-95 duration-150 ease-in-out group relative cursor-pointer ${
                activeTab === 'Historial' 
                  ? 'text-primary bg-surface-container-highest border-l-4 border-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'Historial' ? "'FILL' 1" : "'FILL' 0" }}>
                history
              </span>
              <span className="text-[10px] mt-1 font-sans font-semibold">Historial</span>
            </button>
          </li>

          {/* Cartera (Corte de caja) Tab */}
          <li className="w-full flex justify-center">
            <button 
              onClick={() => setActiveTab('Cartera')}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all scale-95 duration-150 ease-in-out group relative cursor-pointer ${
                activeTab === 'Cartera' 
                  ? 'text-primary bg-surface-container-highest border-l-4 border-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'Cartera' ? "'FILL' 1" : "'FILL' 0" }}>
                account_balance_wallet
              </span>
              <span className="text-[10px] mt-1 font-sans font-semibold">Cartera</span>
            </button>
          </li>
        </ul>

        {/* Ajustes Tab */}
        <div className="mt-auto mb-4 w-full flex justify-center">
          <button 
            onClick={() => setActiveTab('Ajustes')}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all scale-95 duration-150 ease-in-out group relative cursor-pointer ${
              activeTab === 'Ajustes' 
                ? 'text-primary bg-surface-container-highest border-l-4 border-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'Ajustes' ? "'FILL' 1" : "'FILL' 0" }}>
              settings
            </span>
            <span className="text-[10px] mt-1 font-sans font-semibold">Ajustes</span>
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-20 h-full relative overflow-hidden">
        
        {/* TopNavBar matching image 5 layout perfectly */}
        <header className="fixed top-0 right-0 left-0 md:left-20 h-16 z-40 flex justify-between items-center px-6 bg-surface-dim text-primary border-b border-outline-variant flat no shadows">
          
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile only */}
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-stone-border/40 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary tracking-tight">Casa Vieja POS</h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Search Bar - Synced with current Active View */}
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-md">
                search
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'Mesas' ? "Buscar mesa..." : "Buscar platillo..."} 
                className="pl-9 pr-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 text-xs font-sans w-48 lg:w-64 transition-all placeholder:text-on-surface-variant/45"
              />
            </div>
            
            {/* Nav icons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Notification Toggler */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationPopup(prev => !prev)}
                  className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-xs"></span>
                </button>
                
                {/* Simulated notifications dropdown */}
                <AnimatePresence>
                  {showNotificationPopup && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-2 w-72 bg-[#fdfcf0] border border-stone-border rounded-2xl shadow-xl p-4 z-50 space-y-3"
                    >
                      <h4 className="font-serif text-sm font-bold text-on-surface flex items-center justify-between border-b border-stone-border/40 pb-2">
                        <span>Notificaciones Recientes</span>
                        <span className="text-[10px] font-sans font-bold bg-primary-fixed text-primary px-2 py-0.5 rounded-full uppercase">POS</span>
                      </h4>
                      <ul className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-hide text-xs font-sans">
                        {notifications.map((notif, index) => (
                          <li key={index} className="p-2 bg-stone-card rounded-xl border border-stone-border/30 text-on-surface-variant leading-relaxed">
                            {notif}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cashier portrait Profile button */}
              <button 
                onClick={() => setShowProfileModal(prev => !prev)}
                className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
                title="Perfil del cajero"
              >
                <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant shadow-xs">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhqI0NW9inCd2QgE9_ILsSlCGcrFq3_To5QzwnWgcS1683sTadyKyPC1ipLZpY0hxY9xKExKrB_t2EwnT2htx0ItiThRMf_NK5S3HvANBLSsuvmQD9EN2rIhPhbMXrBvGAuEoast2A-6chJE0-StEcmyCY4HNLR8qGyTkNMTjWkSPgYAytv2dn9pHE_vK7mSK42DJqtRFq9EUqOVHmj-geQZurmRsjQR1c5KYY1XmL9GZjMmLssRh2iXP9adScQlubs4HiNaBFSg" 
                    alt="Cajero" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </button>

            </div>
            
            <button 
              onClick={() => setActiveTab('Cartera')}
              className="bg-primary text-white hover:bg-primary-container px-4 sm:px-5 py-2 rounded-full font-sans text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95"
            >
              Cerrar Caja
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
              <motion.div 
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="relative flex flex-col w-64 max-w-xs bg-[#fdfcf0] h-full p-5 border-r border-stone-border space-y-6"
              >
                <div className="flex items-center justify-between border-b border-stone-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-serif text-lg font-bold border border-outline-variant shadow-xs">
                      CV
                    </div>
                    <span className="font-serif font-bold text-primary text-md">Casa Vieja POS</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-on-surface-variant hover:bg-stone-card">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <ul className="space-y-2 flex-grow">
                  <li>
                    <button
                      onClick={() => { setActiveTab('Mesas'); setIsTakeout(false); setMobileMenuOpen(false); }}
                      className={`w-full p-3.5 rounded-xl text-left text-sm font-semibold font-sans flex items-center gap-3 transition-colors ${
                        activeTab === 'Mesas' ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-stone-card'
                      }`}
                    >
                      <span className="material-symbols-outlined text-md">table_restaurant</span>
                      <span>Gestión de Mesas</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab('Menú'); setMobileMenuOpen(false); }}
                      className={`w-full p-3.5 rounded-xl text-left text-sm font-semibold font-sans flex items-center gap-3 transition-colors ${
                        activeTab === 'Menú' ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-stone-card'
                      }`}
                    >
                      <span className="material-symbols-outlined text-md">restaurant_menu</span>
                      <span>Tomar Orden / Menú</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab('Historial'); setMobileMenuOpen(false); }}
                      className={`w-full p-3.5 rounded-xl text-left text-sm font-semibold font-sans flex items-center gap-3 transition-colors ${
                        activeTab === 'Historial' ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-stone-card'
                      }`}
                    >
                      <span className="material-symbols-outlined text-md">history</span>
                      <span>Historial del Día</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab('Cartera'); setMobileMenuOpen(false); }}
                      className={`w-full p-3.5 rounded-xl text-left text-sm font-semibold font-sans flex items-center gap-3 transition-colors ${
                        activeTab === 'Cartera' ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-stone-card'
                      }`}
                    >
                      <span className="material-symbols-outlined text-md">account_balance_wallet</span>
                      <span>Cartera / Finanzas</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setActiveTab('Ajustes'); setMobileMenuOpen(false); }}
                      className={`w-full p-3.5 rounded-xl text-left text-sm font-semibold font-sans flex items-center gap-3 transition-colors ${
                        activeTab === 'Ajustes' ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-stone-card'
                      }`}
                    >
                      <span className="material-symbols-outlined text-md">settings</span>
                      <span>Configuraciones</span>
                    </button>
                  </li>
                </ul>

                <div className="border-t border-stone-border/60 pt-4 text-center">
                  <p className="text-[10px] text-on-surface-variant/70 font-sans">© 2024 Casa Vieja - POS v1.2</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Workspace Stage */}
        <main className="flex-1 mt-16 flex flex-col lg:flex-row overflow-hidden relative z-10">
          
          {/* Active Router Tab workspace panel */}
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative min-w-0">
            {activeTab === 'Mesas' && (
              <TableManagement 
                tables={tables}
                onSelectTable={handleSelectTable}
                onCleanTable={handleCleanTable}
                onStartTakeout={handleStartTakeout}
                onAssignTable={handleAssignTable}
              />
            )}

            {activeTab === 'Menú' && (
              <MenuCatalog 
                menuItems={menuItems}
                onAddToOrder={handleAddToOrder}
                activeSearchQuery={searchQuery}
              />
            )}

            {activeTab === 'Cartera' && (
              <FinancialSummary 
                transactions={transactions}
                onPrintShiftClosure={() => addNotification('Reporte del Cierre de caja impreso con éxito.')}
              />
            )}

            {activeTab === 'Historial' && (
              <HistoryLog 
                transactions={transactions}
                onVoidTransaction={handleVoidTransaction}
              />
            )}

            {activeTab === 'Ajustes' && (
              <SettingsPanel 
                menuItems={menuItems}
                onAddMenuItem={handleAddMenuItem}
                onRemoveMenuItem={handleRemoveMenuItem}
                tables={tables}
                onAddTable={handleAddTable}
                onRemoveTable={handleRemoveTable}
                onResetAll={handleResetAll}
              />
            )}
          </div>

          {/* Persistent Active Ticket Bill sidebar inside POS screen */}
          {activeTab === 'Menú' && (
            <OrderSidebar 
              activeTable={activeTable}
              isTakeout={isTakeout}
              takeoutOrder={takeoutOrder}
              takeoutNotes={takeoutNotes}
              onUpdateTakeoutNotes={handleUpdateTakeoutNotes}
              onUpdateTableNotes={handleUpdateTableNotes}
              onClearOrder={handleClearOrder}
              onUpdateQuantity={handleUpdateQuantity}
              onComandaSent={handleComandaSent}
              onSaveOrder={handleSaveOrder}
              onCheckoutOrder={handleCheckoutOrder}
              menuItems={menuItems}
              onAddToOrderDirect={handleAddToOrderDirect}
            />
          )}

        </main>

        {/* Global Floating real-time Notification alert */}
        <AnimatePresence>
          {showNotificationPopup && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-12 right-6 bg-[#2d2a26] text-[#fbfaee] py-3.5 px-5 rounded-2xl shadow-xl border border-stone-border/20 z-50 flex items-center gap-3 max-w-sm"
            >
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center border border-primary/25 shadow-xs shrink-0 text-white">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-xs font-sans space-y-0.5">
                <p className="font-bold text-white tracking-wide">Notificación del POS</p>
                <p className="text-[#e4e3d7] leading-relaxed">{notifications[0]}</p>
              </div>
              <button 
                onClick={() => setShowNotificationPopup(false)}
                className="text-stone-border hover:text-white shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Info modal */}
        <AnimatePresence>
          {showProfileModal && (
            <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#fdfcf0] rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-2xl text-center space-y-5"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <div className="w-24 h-24 rounded-full bg-surface-variant overflow-hidden border-2 border-primary shadow-md">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhqI0NW9inCd2QgE9_ILsSlCGcrFq3_To5QzwnWgcS1683sTadyKyPC1ipLZpY0hxY9xKExKrB_t2EwnT2htx0ItiThRMf_NK5S3HvANBLSsuvmQD9EN2rIhPhbMXrBvGAuEoast2A-6chJE0-StEcmyCY4HNLR8qGyTkNMTjWkSPgYAytv2dn9pHE_vK7mSK42DJqtRFq9EUqOVHmj-geQZurmRsjQR1c5KYY1XmL9GZjMmLssRh2iXP9adScQlubs4HiNaBFSg" 
                      alt="Cajero" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#fdfcf0] shadow-md">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-serif text-[#4a3f35] font-bold">Sofía Torres</h3>
                  <p className="text-xs text-on-surface-variant font-sans uppercase tracking-widest font-semibold">Cajera Principal</p>
                  <p className="text-[10px] text-secondary font-mono">Turno Matutino • Casa Vieja Centro</p>
                </div>

                <div className="bg-stone-card/60 p-3 rounded-xl border border-stone-border/40 text-xs font-sans text-on-surface-variant leading-relaxed">
                  "Comprometida con brindar la calidez de nuestro hogar colonial y el sabor de nuestra cocina rústica en cada comanda."
                </div>

                <div className="flex gap-2.5 border-t border-stone-border/50 pt-4">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-3 border border-stone-border rounded-xl text-xs font-semibold font-sans uppercase tracking-wider hover:bg-stone-card transition-colors text-on-surface-variant"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      alert('Cerrando sesión de usuario...');
                    }}
                    className="flex-1 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-semibold font-sans uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Minimal Editorial Footer matching guidelines perfectly */}
        <footer className="fixed bottom-0 left-0 md:left-20 right-0 h-8 flex items-center justify-between px-6 z-30 bg-[#fdfcf0] border-t border-stone-border flat text-[11px] font-sans text-on-surface-variant">
          <p>© 2024 Casa Vieja - Sistema de Punto de Venta Artesanal</p>
          <div className="flex gap-4">
            <a href="#soporte" onClick={(e) => { e.preventDefault(); alert('Conectando con soporte de Casa Vieja...'); }} className="hover:text-primary transition-colors">Soporte</a>
            <a href="#manual" onClick={(e) => { e.preventDefault(); alert('Abriendo manual del POS...'); }} className="hover:text-primary transition-colors">Manual de Usuario</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
