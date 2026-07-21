import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, Table, Transaction, OrderItem, TakeoutOrder, OrderOption } from './types';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_TRANSACTIONS 
} from './data';
import { io, Socket } from 'socket.io-client';
import { playWaiterConnected, playNewOrder } from './utils/sounds';

// ─── Configuración del servidor socket ───────────────────────────────────────
// Cambia esta IP por la de tu máquina en la red local cuando uses el celular.
// IP local actual: 192.168.1.72
const SOCKET_SERVER_URL = 'http://192.168.1.72:3001';

import ComandasView from './components/ComandasView';
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
  Award,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Sidebar from './components/Sidebar';
import CashoutFlow from './components/CashoutFlow';

export default function App() {
  // Instancia del socket (ref para no recrearla en cada render)
  const socketRef = useRef<Socket | null>(null);
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_SERVER_URL, { autoConnect: true });
  }
  const socket = socketRef.current;
  // Global State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = null; // localStorage.getItem('cv_pos_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = null; // localStorage.getItem('cv_pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = null; // localStorage.getItem('cv_pos_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [takeoutOrders, setTakeoutOrders] = useState<TakeoutOrder[]>(() => {
    const saved = null; // localStorage.getItem('cv_pos_takeout_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<string>('Mesas');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  
  const toggleMenu = (menu: string) => {
    setOpenMenu(prev => prev === menu ? null : menu);
  };
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null); // defaults to Mesa 12 per screenshots
  const [isTakeout, setIsTakeout] = useState(false);
  const [selectedTakeoutOrderId, setSelectedTakeoutOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pending add item when no active order exists
  const [pendingAddOrderItem, setPendingAddOrderItem] = useState<{item: MenuItem, quantity: number, notes: string, selectedOptions?: OrderOption[]} | null>(null);
  const [newTakeoutName, setNewTakeoutName] = useState('');

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
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

  useEffect(() => {
    localStorage.setItem('cv_pos_takeout_orders', JSON.stringify(takeoutOrders));
  }, [takeoutOrders]);

  // ─── Socket: escuchar órdenes remotas del celular ────────────────────────
  useEffect(() => {
    const handleNuevaOrden = (data: { tableId: string; tableNumber: number; items: OrderItem[] }) => {
      // 🔔 Sonido de nueva orden
      playNewOrder();

      // A) Notificar en la caja
      addNotification(`📱 Nueva orden remota para Mesa ${data.tableNumber}`);

      // B) Actualizar el estado de la mesa: marcarla ocupada e inyectar los platillos
      setTables(prev => prev.map(t => {
        if (t.id === data.tableId) {
          const existingOrder = [...t.currentOrder];
          data.items.forEach((incoming: OrderItem) => {
            const idx = existingOrder.findIndex(
              o => o.menuItem.id === incoming.menuItem.id &&
                   o.notes === incoming.notes &&
                   JSON.stringify(o.selectedOptions || []) === JSON.stringify(incoming.selectedOptions || [])
            );
            if (idx !== -1) {
              existingOrder[idx] = { ...existingOrder[idx], quantity: existingOrder[idx].quantity + incoming.quantity };
            } else {
              existingOrder.push(incoming);
            }
          });
          return { ...t, status: 'occupied', currentOrder: existingOrder };
        }
        return t;
      }));
    };

    const handleNuevoCliente = () => {
      // 🔔 Sonido de mesero conectado
      playWaiterConnected();
      addNotification('🧑‍🍳 Un mesero se ha conectado al sistema.');
    };

    socket.on('nueva_orden_recibida', handleNuevaOrden);
    socket.on('nuevo_cliente_conectado', handleNuevoCliente);

    return () => {
      socket.off('nueva_orden_recibida', handleNuevaOrden);
      socket.off('nuevo_cliente_conectado', handleNuevoCliente);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Derived Active Table and Takeout
  const activeTable = tables.find(t => t.id === selectedTableId) || null;
  const activeTakeout = takeoutOrders.find(t => t.id === selectedTakeoutOrderId) || null;

  // Active orders modifier helper
  const handleAddToOrderDirect = (extraItem: MenuItem, quantity: number, notes: string) => {
    handleAddToOrder(extraItem, quantity, notes);
  };

  const changeTab = (tab: string) => {
    // Check if we are leaving the 'Menú' tab and we have a selected table
    if (activeTab === 'PuntoDeVenta' && tab !== 'PuntoDeVenta') {
      if (selectedTableId && !isTakeout) {
        const currentTable = tables.find(t => t.id === selectedTableId);
        if (currentTable && currentTable.currentOrder.length === 0) {
          // Revert to available
          setTables(prev => prev.map(t => {
            if (t.id === selectedTableId) {
              return { ...t, status: 'available', waiter: undefined, minutes: undefined };
            }
            return t;
          }));
        }
      }
    }
    setActiveTab(tab);
  };

  // State actions
  const handleSelectTable = (table: Table) => {
    setSelectedTableId(table.id);
    setIsTakeout(false);
    setSelectedTakeoutOrderId(null);
    changeTab('PuntoDeVenta');
    setMobileMenuOpen(false);
  };

  const handleSelectTakeoutOrder = (orderId: string) => {
    setSelectedTakeoutOrderId(orderId);
    setIsTakeout(true);
    setSelectedTableId(null);
    changeTab('PuntoDeVenta');
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

  const handleFreeTable = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, status: 'available', currentOrder: [], waiter: undefined, minutes: undefined };
      }
      return t;
    }));
    setSelectedTableId(null);
    changeTab('Mesas');
    addNotification(`Mesa ${tables.find(t => t.id === tableId)?.number} ha sido liberada`);
  };

  const handleFreeTakeout = (orderId: string) => {
    setTakeoutOrders(prev => prev.filter(t => t.id !== orderId));
    setSelectedTakeoutOrderId(null);
    changeTab('Mesas');
    addNotification(`Pedido para llevar ha sido cancelado`);
  };

  const handleStartTakeout = (customerName: string) => {
    const newTakeout: TakeoutOrder = {
      id: `takeout_${Date.now()}`,
      customerName,
      status: 'pending',
      currentOrder: [],
      orderNotes: ''
    };
    setTakeoutOrders(prev => [...prev, newTakeout]);
    setIsTakeout(true);
    setSelectedTakeoutOrderId(newTakeout.id);
    setSelectedTableId(null);
    changeTab('PuntoDeVenta');
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
    setSelectedTakeoutOrderId(null);
    changeTab('PuntoDeVenta');
  };

  // Add Item to Order
  const handleAddToOrder = (item: MenuItem, quantity: number, notes: string, options?: OrderOption[]) => {
    const isSameItem = (o: OrderItem) => o.menuItem.id === item.id && o.notes === notes && JSON.stringify(o.selectedOptions || []) === JSON.stringify(options || []);

    if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.map(t => {
        if (t.id === selectedTakeoutOrderId) {
          const order = [...t.currentOrder];
          const exists = order.find(isSameItem);
          if (exists) {
            const updated = order.map(o => {
              if (isSameItem(o)) {
                return { ...o, quantity: o.quantity + quantity };
              }
              return o;
            });
            return { ...t, currentOrder: updated };
          } else {
            return { ...t, currentOrder: [...order, { menuItem: item, quantity, notes, selectedOptions: options }] };
          }
        }
        return t;
      }));
    } else if (selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          const order = [...t.currentOrder];
          const exists = order.find(isSameItem);
          if (exists) {
            const updated = order.map(o => {
              if (isSameItem(o)) {
                return { ...o, quantity: o.quantity + quantity };
              }
              return o;
            });
            return { ...t, currentOrder: updated };
          } else {
            return { ...t, currentOrder: [...order, { menuItem: item, quantity, notes, selectedOptions: options }] };
          }
        }
        return t;
      }));
    } else {
      setPendingAddOrderItem({ item, quantity, notes, selectedOptions: options });
    }
  };

  // Quantity updates on active ticket
  const handleUpdateQuantity = (menuItemId: string, change: number) => {
    if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.map(t => {
        if (t.id === selectedTakeoutOrderId) {
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
    if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.map(t => {
        if (t.id === selectedTakeoutOrderId) {
          return { ...t, currentOrder: [], orderNotes: '' };
        }
        return t;
      }));
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
    if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.map(t => {
        if (t.id === selectedTakeoutOrderId) {
          return { ...t, orderNotes: notes };
        }
        return t;
      }));
    }
  };

  const handleUpdateTakeoutAddress = (address: string) => {
    if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.map(t => {
        if (t.id === selectedTakeoutOrderId) {
          return { ...t, address };
        }
        return t;
      }));
    }
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
    const identifier = isTakeout ? `Para Llevar (${activeTakeout?.customerName || ''})` : `Mesa ${activeTable?.number}`;
    const items = isTakeout ? (activeTakeout?.currentOrder || []) : (activeTable?.currentOrder || []);
    
    console.log(`\n=== TICKET DE COCINA ===`);
    console.log(`Destino: ${identifier}`);
    console.log(`Fecha/Hora: ${new Date().toLocaleString()}`);
    console.log(`------------------------`);
    items.forEach(item => {
      console.log(`[ ] ${item.quantity}x ${item.menuItem.name}`);
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        console.log(`      Opciones: ${item.selectedOptions.map(o => o.optionName).join(', ')}`);
      }
      if (item.notes) {
        console.log(`      Notas: ${item.notes}`);
      }
    });
    console.log(`========================\n`);

    addNotification(
      isTakeout 
        ? `Nueva comanda para ${activeTakeout?.customerName || 'Llevar'} enviada a cocina.` 
        : `Comanda de Mesa ${activeTable?.number} enviada a cocina.`
    );
  };

  const handleSaveOrder = () => {
    if (isTakeout) {
      addNotification(`Pedido de ${activeTakeout?.customerName} guardado.`);
      changeTab('Mesas');
    } else {
      addNotification(`Orden de Mesa ${activeTable?.number} guardada.`);
    }
  };

  // Partial Payment for Split Bills
  const handlePartialCheckoutOrder = (paymentMethod: 'Tarjeta' | 'Efectivo', total: number, itemsPaid: OrderItem[]) => {
    const nextFolioNum = 142 + transactions.length;
    const folioStr = `#00${nextFolioNum}-P`; // P for partial

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timestampStr = `${hours}:${minutes} ${ampm}`;
    const dateStr = now.toISOString().split('T')[0];

    const originStr = isTakeout ? `Para Llevar (${activeTakeout?.customerName || ''})` : `Mesa ${activeTable?.number}`;

    const newTx: Transaction = {
      id: `tx_${nextFolioNum}_p`,
      folio: folioStr,
      timestamp: timestampStr,
      date: dateStr,
      type: `${originStr} (Parcial)`,
      method: paymentMethod,
      total
    };

    setTransactions(prev => [newTx, ...prev]);

    console.log(`\n=== TICKET DE PAGO (PARCIAL) ===`);
    console.log(`Folio: ${folioStr}`);
    console.log(`Destino: ${originStr}`);
    console.log(`Fecha/Hora: ${timestampStr} ${dateStr}`);
    console.log(`------------------------`);
    itemsPaid.forEach(item => {
      const optionsTotal = item.selectedOptions?.reduce((sum, opt) => sum + opt.priceDelta, 0) || 0;
      const unitPrice = item.menuItem.price + optionsTotal;
      const itemTotal = unitPrice * item.quantity;
      console.log(`${item.quantity}x ${item.menuItem.name}`.padEnd(30) + `$${itemTotal.toFixed(2)}`);
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        console.log(`   + ${item.selectedOptions.map(o => o.optionName).join(', ')}`);
      }
      if (item.notes) {
        console.log(`   * ${item.notes}`);
      }
    });
    console.log(`------------------------`);
    console.log(`Subtotal:`.padEnd(30) + `$${(total / 1.16).toFixed(2)}`);
    console.log(`IVA (16%):`.padEnd(30) + `$${(total - (total / 1.16)).toFixed(2)}`);
    console.log(`TOTAL A PAGAR:`.padEnd(30) + `$${total.toFixed(2)}`);
    console.log(`Método de Pago: ${paymentMethod}`);
    console.log(`========================\n`);

    const isSameItem = (a: OrderItem, b: OrderItem) => {
      return a.menuItem.id === b.menuItem.id && a.notes === b.notes && JSON.stringify(a.selectedOptions || []) === JSON.stringify(b.selectedOptions || []);
    };

    // Update table order
    if (!isTakeout && selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          const newOrder = [...t.currentOrder].map(o => ({...o}));
          itemsPaid.forEach(paid => {
             const existingIndex = newOrder.findIndex(o => isSameItem(o, paid));
             if (existingIndex !== -1) {
                newOrder[existingIndex].quantity -= paid.quantity;
             }
          });
          const filteredOrder = newOrder.filter(o => o.quantity > 0);
          if (filteredOrder.length === 0) {
             return { ...t, status: 'dirty', currentOrder: [], orderNotes: '' };
          }
          return { ...t, currentOrder: filteredOrder };
        }
        return t;
      }));
      // If table is now empty, we'll deselect it... wait, it's better to check after update
    } else if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.map(t => {
        if (t.id === selectedTakeoutOrderId) {
          const newOrder = [...t.currentOrder].map(o => ({...o}));
          itemsPaid.forEach(paid => {
             const existingIndex = newOrder.findIndex(o => isSameItem(o, paid));
             if (existingIndex !== -1) {
                newOrder[existingIndex].quantity -= paid.quantity;
             }
          });
          const filteredOrder = newOrder.filter(o => o.quantity > 0);
          return { ...t, currentOrder: filteredOrder };
        }
        return t;
      }).filter(t => t.currentOrder.length > 0)); // Remove if empty
    }

    addNotification(`Pago parcial completado por $${total.toFixed(2)}.`);
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

    const originStr = isTakeout ? `Para Llevar (${activeTakeout?.customerName || ''})` : `Mesa ${activeTable?.number}`;

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

    const activeOrderItems = isTakeout ? activeTakeout?.currentOrder || [] : activeTable?.currentOrder || [];
    
    console.log(`\n=== TICKET DE PAGO ===`);
    console.log(`Folio: ${folioStr}`);
    console.log(`Destino: ${originStr}`);
    console.log(`Fecha/Hora: ${timestampStr} ${dateStr}`);
    console.log(`------------------------`);
    activeOrderItems.forEach(item => {
      const optionsTotal = item.selectedOptions?.reduce((sum, opt) => sum + opt.priceDelta, 0) || 0;
      const unitPrice = item.menuItem.price + optionsTotal;
      const itemTotal = unitPrice * item.quantity;
      console.log(`${item.quantity}x ${item.menuItem.name}`.padEnd(30) + `$${itemTotal.toFixed(2)}`);
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        console.log(`   + ${item.selectedOptions.map(o => o.optionName).join(', ')}`);
      }
      if (item.notes) {
        console.log(`   * ${item.notes}`);
      }
    });
    console.log(`------------------------`);
    console.log(`Subtotal:`.padEnd(30) + `$${(total / 1.16).toFixed(2)}`);
    console.log(`IVA (16%):`.padEnd(30) + `$${(total - (total / 1.16)).toFixed(2)}`);
    console.log(`TOTAL A PAGAR:`.padEnd(30) + `$${total.toFixed(2)}`);
    console.log(`Método de Pago: ${paymentMethod}`);
    console.log(`========================\n`);

    // Update table status to dirty (needs cleaning!) to simulate real restaurant flow
    if (!isTakeout && selectedTableId) {
      setTables(prev => prev.map(t => {
        if (t.id === selectedTableId) {
          return { ...t, status: 'dirty', currentOrder: [], orderNotes: '' };
        }
        return t;
      }));
      setSelectedTableId(null);
    } else if (isTakeout && selectedTakeoutOrderId) {
      setTakeoutOrders(prev => prev.filter(t => t.id !== selectedTakeoutOrderId));
      setSelectedTakeoutOrderId(null);
    }

    addNotification(`Venta completada por $${total.toFixed(2)}. Folio ${folioStr}`);
    
    // Automatically switch to Cartera/Reports view so the user can verify immediately
    changeTab('CajaActual');
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
    localStorage.removeItem('cv_pos_takeout_orders');
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setTransactions(INITIAL_TRANSACTIONS);
    setTakeoutOrders([]);
    setSelectedTableId('table_12');
    setSelectedTakeoutOrderId(null);
    setIsTakeout(false);
    changeTab('Mesas');
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
    <div className="h-screen w-screen overflow-hidden flex bg-surface-container-lowest text-on-surface font-sans">
      
      {/* SideNavBar matching image 5 style perfectly */}
      <Sidebar 
        activeTab={activeTab} 
        onChangeTab={(tab) => {
          if (tab === 'PuntoDeVenta') {
            setSelectedTableId(null);
            setSelectedTakeoutOrderId(null);
          } else if (tab === 'Mesas') {
            setIsTakeout(false);
          }
          changeTab(tab);
        }} 
        openMenu={openMenu} 
        onToggleMenu={toggleMenu} 
        isMinimized={isSidebarMinimized}
        onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
      />

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col ${isSidebarMinimized ? 'md:pl-20' : 'md:pl-64'} transition-all duration-300 h-full relative overflow-hidden`}>
        
        {/* TopNavBar matching image layout perfectly */}
        <header className={`fixed top-0 right-0 left-0 ${isSidebarMinimized ? 'md:left-20' : 'md:left-64'} transition-all duration-300 h-16 z-40 flex justify-between items-center px-6 bg-surface-container-lowest border-b border-stone-border/60 text-primary`}>
          
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
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant/50 text-md">
                search
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'Mesas' ? "Buscar mesa o plato..." : "Buscar platillo..."} 
                className="pl-9 pr-4 py-2.5 rounded-xl bg-surface-container border-none focus:ring-1 focus:ring-primary text-xs font-sans w-48 lg:w-64 transition-all placeholder:text-on-surface-variant/45 shadow-sm text-on-surface"
              />
            </div>
            
            {/* Nav icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Notification Toggler */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotificationPopup(prev => !prev)}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary"></span>
                </button>
                
                {/* Simulated notifications dropdown */}
                <AnimatePresence>
                  {showNotificationPopup && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-stone-border rounded-2xl shadow-xl p-4 z-50 space-y-3"
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
                className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-all"
                title="Perfil del cajero"
              >
                <User className="w-5 h-5" />
              </button>

            </div>
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
                className="relative flex flex-col w-64 max-w-xs bg-surface-container-low h-full p-5 border-r border-stone-border space-y-6"
              >
                <div className="absolute top-4 right-4 z-50">
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-on-surface-variant hover:bg-stone-card">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Sidebar 
                  activeTab={activeTab} 
                  onChangeTab={(tab) => { 
                    if (tab === 'PuntoDeVenta') {
                      setSelectedTableId(null);
                      setSelectedTakeoutOrderId(null);
                    } else if (tab === 'Mesas') {
                      setIsTakeout(false);
                    }
                    changeTab(tab); 
                    setMobileMenuOpen(false); 
                  }} 
                  openMenu={openMenu} 
                  onToggleMenu={toggleMenu} 
                  isMobile={true} 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Workspace Stage */}
        <main className="flex-1 mt-16 flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* Active Router Tab workspace panel */}
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative min-w-0">
            {(activeTab === 'Mesas' || activeTab === 'Inicio') && (
              <TableManagement 
                tables={tables}
                takeoutOrders={takeoutOrders}
                onSelectTable={handleSelectTable}
                onCleanTable={handleCleanTable}
                onFreeTable={handleFreeTable}
                onStartTakeout={handleStartTakeout}
                onSelectTakeoutOrder={handleSelectTakeoutOrder}
                onFreeTakeout={handleFreeTakeout}
                onAssignTable={handleAssignTable}
              />
            )}
            {activeTab === 'Comandas' && (
              <ComandasView 
                tables={tables}
                takeoutOrders={takeoutOrders}
                onCancelOrder={(id, isTakeout) => {
                  if (isTakeout) {
                    handleFreeTakeout(id);
                  } else {
                    handleFreeTable(id);
                  }
                  addNotification('Orden anulada en cocina.');
                }}
                onCancelItem={(orderId, isTakeout, itemIndex) => {
                  if (isTakeout) {
                    setTakeoutOrders(prev => prev.map(t => {
                      if (t.id === orderId) {
                        const newOrder = [...t.currentOrder];
                        newOrder.splice(itemIndex, 1);
                        return { ...t, currentOrder: newOrder };
                      }
                      return t;
                    }));
                  } else {
                    setTables(prev => prev.map(t => {
                      if (t.id === orderId) {
                        const newOrder = [...t.currentOrder];
                        newOrder.splice(itemIndex, 1);
                        return { ...t, currentOrder: newOrder };
                      }
                      return t;
                    }));
                  }
                  addNotification('Platillo anulado en cocina.');
                }}
              />
            )}


            {activeTab === 'PuntoDeVenta' && (
              <div className="flex flex-col flex-1 h-full min-h-0 relative">
                {(selectedTableId || selectedTakeoutOrderId) && (
                  <div className="px-6 md:px-8 pt-6 pb-0 shrink-0">
                    <button 
                      onClick={() => changeTab('Mesas')}
                      className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-sans text-sm font-bold transition-colors w-fit"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Volver a Mesas</span>
                    </button>
                  </div>
                )}
                <MenuCatalog 
                  menuItems={menuItems}
                  onAddToOrder={handleAddToOrder}
                  activeSearchQuery={searchQuery}
                />
                
                {/* Floating Mobile Cart Button */}
                {(selectedTableId || selectedTakeoutOrderId) && !isMobileCartOpen && (
                  <div className="md:hidden absolute bottom-10 left-6 right-6 z-30">
                    <button 
                      onClick={() => setIsMobileCartOpen(true)}
                      className="w-full bg-primary hover:bg-primary-dark text-white shadow-xl py-4 rounded-2xl font-sans font-bold flex items-center justify-between px-6 border border-primary-dark/20"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span>Ver Orden</span>
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                        {isTakeout ? 'Para Llevar' : `Mesa ${activeTable?.number || '?'}`}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'CajaActual' && (
              <FinancialSummary 
                transactions={transactions}
                onPrintShiftClosure={() => addNotification('Reporte del Cierre de caja impreso con éxito.')}
              />
            )}
            
            {activeTab === 'CorteCaja' && (
              <CashoutFlow 
                expectedCash={transactions.filter(t => t.method === 'Efectivo').reduce((sum, t) => sum + t.total, 0)}
                transactions={transactions}
                onConfirmPrint={(declared) => {
                  addNotification(`Cierre de caja completado. Total declarado: ${declared.toFixed(2)}.`);
                  setTransactions([]);
                  changeTab('CajaActual');
                }}
              />
            )}

            {(activeTab === 'HistorialCortes' || activeTab === 'HistorialVentas') && (
              <HistoryLog 
                transactions={transactions}
                onVoidTransaction={handleVoidTransaction}
              />
            )}

            {(activeTab === 'EditarMenu' || activeTab === 'Disponibilidad' || activeTab === 'Usuarios') && (
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
          {activeTab === 'PuntoDeVenta' && (activeTable || (isTakeout && activeTakeout)) && (
            <>
              {/* Mobile overlay background */}
              {isMobileCartOpen && (
                <div 
                  className="fixed inset-0 bg-stone-dark/40 z-40 md:hidden backdrop-blur-sm"
                  onClick={() => setIsMobileCartOpen(false)}
                />
              )}
              
              <div className={`fixed top-16 right-0 bottom-8 z-50 md:static md:z-auto ${isMobileCartOpen ? 'flex' : 'hidden md:flex'} w-full md:w-80 lg:w-96 bg-surface-container-lowest border-l border-stone-border/60 shadow-2xl md:shadow-none flex-col shrink-0 transition-transform duration-300`}>
                <OrderSidebar 
                  activeTable={activeTable}
                  isTakeout={isTakeout}
                  takeoutCustomerName={activeTakeout?.customerName || ''}
                  takeoutOrder={activeTakeout?.currentOrder || []}
                  takeoutNotes={activeTakeout?.orderNotes || ''}
                  takeoutAddress={activeTakeout?.address || ''}
                  onUpdateTakeoutAddress={handleUpdateTakeoutAddress}
                  onUpdateTakeoutNotes={handleUpdateTakeoutNotes}
                  onUpdateTableNotes={handleUpdateTableNotes}
                  onClearOrder={handleClearOrder}
                  onUpdateQuantity={handleUpdateQuantity}
                  onComandaSent={handleComandaSent}
                  onSaveOrder={handleSaveOrder}
                  onCheckoutOrder={handleCheckoutOrder}
                  onPartialCheckoutOrder={handlePartialCheckoutOrder}
                  menuItems={menuItems}
                  onAddToOrderDirect={handleAddToOrderDirect}
                  onFreeTable={isTakeout && selectedTakeoutOrderId ? () => handleFreeTakeout(selectedTakeoutOrderId) : handleFreeTable}
                  onCloseMobile={() => setIsMobileCartOpen(false)}
                  socket={socket}
                />
              </div>
            </>
          )}

        </main>

        {/* Global Floating real-time Notification alert */}
        <AnimatePresence>
          {showNotificationPopup && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-12 right-6 bg-stone-dark text-surface-container-lowest py-3.5 px-5 rounded-2xl shadow-xl border border-stone-border/20 z-50 flex items-center gap-3 max-w-sm"
            >
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center border border-primary/25 shadow-xs shrink-0 text-white">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-xs font-sans space-y-0.5">
                <p className="font-bold text-white tracking-wide">Notificación del POS</p>
                <p className="text-surface-container-high leading-relaxed">{notifications[0]}</p>
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

        {/* Select Destination Modal for new Item when no active order */}
        <AnimatePresence>
          {pendingAddOrderItem && (
            <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-stone-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b border-stone-border/40 pb-3">
                  <h3 className="text-xl font-serif text-on-surface font-bold">Asignar Producto</h3>
                  <button onClick={() => { setPendingAddOrderItem(null); setNewTakeoutName(''); }} className="p-1 rounded-lg text-on-surface-variant hover:bg-stone-card">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-sm font-sans text-on-surface-variant mb-4">
                  Selecciona a qué mesa o pedido para llevar deseas agregar: <strong className="text-primary">{pendingAddOrderItem.quantity}x {pendingAddOrderItem.item.name}</strong>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface mb-2">Mesas Ocupadas</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {tables.filter(t => t.status === 'occupied').length > 0 ? (
                        tables.filter(t => t.status === 'occupied').map(table => (
                          <button
                            key={table.id}
                            onClick={() => {
                              setSelectedTableId(table.id);
                              setIsTakeout(false);
                              setSelectedTakeoutOrderId(null);
                              // We simulate adding the item manually because state update might take a cycle
                              setTables(prev => prev.map(t => {
                                if (t.id === table.id) {
                                  const order = [...t.currentOrder];
                                  const isSameItem = (o: OrderItem) => o.menuItem.id === pendingAddOrderItem.item.id && o.notes === pendingAddOrderItem.notes && JSON.stringify(o.selectedOptions || []) === JSON.stringify(pendingAddOrderItem.selectedOptions || []);
                                  const exists = order.find(isSameItem);
                                  if (exists) {
                                    const updated = order.map(o => {
                                      if (isSameItem(o)) {
                                        return { ...o, quantity: o.quantity + pendingAddOrderItem.quantity };
                                      }
                                      return o;
                                    });
                                    return { ...t, currentOrder: updated };
                                  } else {
                                    return { ...t, currentOrder: [...order, { menuItem: pendingAddOrderItem.item, quantity: pendingAddOrderItem.quantity, notes: pendingAddOrderItem.notes, selectedOptions: pendingAddOrderItem.selectedOptions }] };
                                  }
                                }
                                return t;
                              }));
                              setPendingAddOrderItem(null);
                            }}
                            className="p-3 border border-stone-border rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-2xl text-on-surface-variant mb-1">table_restaurant</span>
                            <span className="font-bold text-sm text-on-surface">Mesa {table.number}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 text-xs text-on-surface-variant italic">No hay mesas ocupadas.</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface mb-2">Pedidos Para Llevar Activos</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {takeoutOrders.length > 0 ? (
                        takeoutOrders.map(order => (
                          <button
                            key={order.id}
                            onClick={() => {
                              setSelectedTakeoutOrderId(order.id);
                              setIsTakeout(true);
                              setSelectedTableId(null);
                              setTakeoutOrders(prev => prev.map(t => {
                                if (t.id === order.id) {
                                  const ord = [...t.currentOrder];
                                  const isSameItem = (o: OrderItem) => o.menuItem.id === pendingAddOrderItem.item.id && o.notes === pendingAddOrderItem.notes && JSON.stringify(o.selectedOptions || []) === JSON.stringify(pendingAddOrderItem.selectedOptions || []);
                                  const exists = ord.find(isSameItem);
                                  if (exists) {
                                    const updated = ord.map(o => {
                                      if (isSameItem(o)) {
                                        return { ...o, quantity: o.quantity + pendingAddOrderItem.quantity };
                                      }
                                      return o;
                                    });
                                    return { ...t, currentOrder: updated };
                                  } else {
                                    return { ...t, currentOrder: [...ord, { menuItem: pendingAddOrderItem.item, quantity: pendingAddOrderItem.quantity, notes: pendingAddOrderItem.notes, selectedOptions: pendingAddOrderItem.selectedOptions }] };
                                  }
                                }
                                return t;
                              }));
                              setPendingAddOrderItem(null);
                            }}
                            className="p-3 border border-stone-border rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors text-center"
                          >
                            <span className="material-symbols-outlined text-2xl text-on-surface-variant mb-1">shopping_bag</span>
                            <span className="font-bold text-sm text-on-surface break-all">{order.customerName || 'Sin Nombre'}</span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 text-xs text-on-surface-variant italic">No hay pedidos para llevar activos.</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-border/40">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface mb-3">Crear Nueva Orden</h4>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="flex-1 flex gap-2">
                        <select 
                          className="flex-1 p-3 rounded-xl bg-stone-card border border-stone-border focus:border-primary focus:ring-0 text-sm font-sans"
                          onChange={(e) => {
                            const tableId = e.target.value;
                            if (tableId) {
                              setTables(prev => prev.map(t => {
                                if (t.id === tableId) {
                                  return { 
                                    ...t, 
                                    status: 'occupied', 
                                    waiter: 'Mesero General', 
                                    minutes: 1, 
                                    currentOrder: [{ menuItem: pendingAddOrderItem.item, quantity: pendingAddOrderItem.quantity, notes: pendingAddOrderItem.notes, selectedOptions: pendingAddOrderItem.selectedOptions }] 
                                  };
                                }
                                return t;
                              }));
                              setSelectedTableId(tableId);
                              setIsTakeout(false);
                              setSelectedTakeoutOrderId(null);
                              setPendingAddOrderItem(null);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Asignar a Mesa Libre...</option>
                          {tables.filter(t => t.status === 'available' || t.status === 'dirty').map(t => (
                            <option key={t.id} value={t.id}>Mesa {t.number}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Nombre para llevar..." 
                          value={newTakeoutName}
                          onChange={(e) => setNewTakeoutName(e.target.value)}
                          className="flex-1 p-3 rounded-xl bg-stone-card border border-stone-border focus:border-primary focus:ring-0 text-sm font-sans"
                        />
                        <button
                          onClick={() => {
                            if (newTakeoutName.trim()) {
                              const newTakeout: TakeoutOrder = {
                                id: `takeout_${Date.now()}`,
                                customerName: newTakeoutName.trim(),
                                status: 'pending',
                                currentOrder: [{ menuItem: pendingAddOrderItem.item, quantity: pendingAddOrderItem.quantity, notes: pendingAddOrderItem.notes, selectedOptions: pendingAddOrderItem.selectedOptions }],
                                orderNotes: ''
                              };
                              setTakeoutOrders(prev => [...prev, newTakeout]);
                              setIsTakeout(true);
                              setSelectedTakeoutOrderId(newTakeout.id);
                              setSelectedTableId(null);
                              setPendingAddOrderItem(null);
                              setNewTakeoutName('');
                            } else {
                              alert("Ingresa el nombre del cliente para llevar.");
                            }
                          }}
                          className="px-4 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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
                className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 border border-stone-border shadow-2xl text-center space-y-5"
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
                  <h3 className="text-xl font-serif text-on-surface font-bold">Sofía Torres</h3>
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
        <footer className={`fixed bottom-0 right-0 left-0 ${isSidebarMinimized ? 'md:left-20' : 'md:left-64'} transition-all duration-300 h-8 flex items-center justify-between px-6 z-30 bg-surface-container-lowest text-[11px] font-sans text-on-surface-variant`}>
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
