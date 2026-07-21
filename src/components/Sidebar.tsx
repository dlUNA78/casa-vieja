import React from 'react';
import { 
  Home, 
  MonitorPlay, 
  Grid2X2, 
  ListOrdered, 
  Wallet, 
  PackageSearch, 
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  openMenu: string | null;
  onToggleMenu: (menu: string) => void;
  isMobile?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function Sidebar({ activeTab, onChangeTab, openMenu, onToggleMenu, isMobile = false, isMinimized = false, onToggleMinimize }: SidebarProps) {
  
  const NavItem = ({ id, label, icon: Icon, onClick }: any) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={onClick}
        title={isMinimized ? label : undefined}
        className={`w-full flex items-center gap-3 ${isMinimized ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all font-sans ${
          isActive 
            ? 'bg-primary-fixed text-primary font-bold shadow-sm' 
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
        {!isMinimized && <span className="text-sm">{label}</span>}
      </button>
    );
  };

  const NavGroup = ({ id, label, icon: Icon, children }: any) => {
    const isOpen = openMenu === id;
    
    return (
      <div className="w-full relative group">
        <button 
          onClick={() => {
            if (isMinimized && onToggleMinimize) {
               onToggleMinimize();
               onToggleMenu(id);
            } else {
               onToggleMenu(id);
            }
          }}
          title={isMinimized ? label : undefined}
          className={`w-full flex items-center ${isMinimized ? 'justify-center px-0' : 'justify-between px-4'} py-3 rounded-xl transition-all font-sans font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            {!isMinimized && <span className="text-sm">{label}</span>}
          </div>
          {!isMinimized && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        </button>
        <AnimatePresence>
          {!isMinimized && isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 pl-11 pr-2 py-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const SubNavItem = ({ id, label, onClick }: any) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={onClick}
        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all font-sans text-xs ${
          isActive 
            ? 'bg-primary-fixed/50 text-primary font-bold' 
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
        }`}
      >
        {label}
      </button>
    );
  };

  const navContent = (
    <>
      <div className={`mb-8 flex items-center ${isMinimized ? 'justify-center px-0' : 'gap-3 px-4'} pt-2`}>
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shrink-0">
          <span className="material-symbols-outlined text-[22px]">restaurant</span>
        </div>
        {!isMobile && !isMinimized && <h2 className="font-serif font-bold text-xl text-primary tracking-tight truncate">Casa Vieja</h2>}
      </div>
      
      <div className={`flex flex-col gap-1.5 w-full flex-1 overflow-y-auto scrollbar-hide ${isMinimized ? 'items-center' : ''}`}>
        <NavItem id="Inicio" label="Inicio (Dashboard)" icon={Home} onClick={() => onChangeTab('Inicio')} />
        <NavItem id="PuntoDeVenta" label="Punto de Venta" icon={MonitorPlay} onClick={() => onChangeTab('PuntoDeVenta')} />
        <NavItem id="Mesas" label="Mesas" icon={Grid2X2} onClick={() => onChangeTab('Mesas')} />
        <NavItem id="Comandas" label="Comandas" icon={ListOrdered} onClick={() => onChangeTab('Comandas')} />
        
        <div className={`my-2 border-t border-stone-border/50 ${isMinimized ? 'w-10' : 'mx-4 w-auto'}`}></div>

        <NavGroup id="Caja" label="Caja" icon={Wallet}>
          <SubNavItem id="CajaActual" label="Caja Actual" onClick={() => onChangeTab('CajaActual')} />
          <SubNavItem id="CorteCaja" label="Corte / Cierre" onClick={() => onChangeTab('CorteCaja')} />
          <SubNavItem id="HistorialCortes" label="Historial" onClick={() => onChangeTab('HistorialCortes')} />
        </NavGroup>

        <NavGroup id="Productos" label="Productos" icon={PackageSearch}>
          <SubNavItem id="Disponibilidad" label="Disponibilidad" onClick={() => onChangeTab('Disponibilidad')} />
          <SubNavItem id="EditarMenu" label="Editar Menú" onClick={() => onChangeTab('EditarMenu')} />
        </NavGroup>

        <NavGroup id="Config" label="Configuración" icon={Settings}>
          <SubNavItem id="Usuarios" label="Usuarios" onClick={() => onChangeTab('Usuarios')} />
          <SubNavItem id="HistorialVentas" label="Reportes" onClick={() => onChangeTab('HistorialVentas')} />
        </NavGroup>
      </div>

      <div className="mt-auto pt-6 border-t border-stone-border/50 flex flex-col items-center w-full">
         {!isMinimized && <p className="text-[10px] text-on-surface-variant/60 font-sans tracking-wide uppercase mb-4">Casa Vieja POS v1.2</p>}
         {!isMobile && (
           <button 
             onClick={onToggleMinimize}
             title={isMinimized ? "Expandir menú" : "Minimizar menú"}
             className={`p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors ${!isMinimized ? 'w-full flex items-center justify-center gap-2 bg-surface-container/50 border border-stone-border/50' : 'hover:text-primary'}`}
           >
             {isMinimized ? <PanelLeft className="w-5 h-5" /> : (
               <>
                 <PanelLeftClose className="w-5 h-5" />
                 <span className="text-xs font-bold font-sans">Ocultar Panel</span>
               </>
             )}
           </button>
         )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-surface-container-low">
        {navContent}
      </div>
    );
  }

  return (
    <nav className={`fixed left-0 top-0 h-full z-50 flex flex-col py-6 ${isMinimized ? 'px-3 w-20' : 'px-4 w-64'} bg-surface-container-low hidden md:flex shrink-0 border-r border-stone-border/60 transition-all duration-300`}>
      {navContent}
    </nav>
  );
}
