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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  openMenu: string | null;
  onToggleMenu: (menu: string) => void;
  isMobile?: boolean;
}

export default function Sidebar({ activeTab, onChangeTab, openMenu, onToggleMenu, isMobile = false }: SidebarProps) {
  
  const NavItem = ({ id, label, icon: Icon, onClick }: any) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-sans ${
          isActive 
            ? 'bg-primary-fixed text-primary font-bold' 
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-semibold'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  const NavGroup = ({ id, label, icon: Icon, children }: any) => {
    const isOpen = openMenu === id;
    
    return (
      <div className="w-full">
        <button 
          onClick={() => onToggleMenu(id)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-sans font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="text-sm">{label}</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {isOpen && (
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
        className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-sans text-xs ${
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
      <div className="mb-8 flex items-center gap-3 px-4">
        <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-2xl">restaurant</span>
        </div>
        {!isMobile && <h2 className="font-serif font-bold text-lg text-primary tracking-tight truncate">Casa Vieja</h2>}
      </div>
      
      <div className="flex flex-col gap-2 w-full flex-1 overflow-y-auto scrollbar-hide">
        <NavItem id="Inicio" label="Inicio (Dashboard)" icon={Home} onClick={() => onChangeTab('Inicio')} />
        <NavItem id="PuntoDeVenta" label="Punto de Venta" icon={MonitorPlay} onClick={() => onChangeTab('PuntoDeVenta')} />
        <NavItem id="Mesas" label="Mesas" icon={Grid2X2} onClick={() => onChangeTab('Mesas')} />
        <NavItem id="Comandas" label="Comandas" icon={ListOrdered} onClick={() => onChangeTab('Comandas')} />
        
        <NavGroup id="Caja" label="Caja" icon={Wallet}>
          <SubNavItem id="CajaActual" label="Caja Actual" onClick={() => onChangeTab('CajaActual')} />
          <SubNavItem id="CorteCaja" label="Corte / Cierre de Caja" onClick={() => onChangeTab('CorteCaja')} />
          <SubNavItem id="HistorialCortes" label="Historial de Cortes" onClick={() => onChangeTab('HistorialCortes')} />
        </NavGroup>

        <NavGroup id="Productos" label="Productos" icon={PackageSearch}>
          <SubNavItem id="Disponibilidad" label="Disponibilidad" onClick={() => onChangeTab('Disponibilidad')} />
          <SubNavItem id="EditarMenu" label="Editar Menú" onClick={() => onChangeTab('EditarMenu')} />
        </NavGroup>

        <NavGroup id="Config" label="Configuración" icon={Settings}>
          <SubNavItem id="Usuarios" label="Usuarios" onClick={() => onChangeTab('Usuarios')} />
          <SubNavItem id="HistorialVentas" label="Historial de Ventas / Reportes" onClick={() => onChangeTab('HistorialVentas')} />
        </NavGroup>
      </div>

      <div className="mt-auto pt-4 border-t border-stone-border/60 text-center w-full">
         <p className="text-[10px] text-on-surface-variant/70 font-sans">© 2024 Casa Vieja - POS v1.2</p>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-[#fdfcf0]">
        {navContent}
      </div>
    );
  }

  return (
    <nav className="fixed left-0 top-0 h-full z-50 flex flex-col py-6 px-4 bg-surface-dim w-64 hidden md:flex shrink-0 border-r border-stone-border/40">
      {navContent}
    </nav>
  );
}
