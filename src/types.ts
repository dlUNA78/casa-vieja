export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Desayunos' | 'Antojitos' | 'Bebidas' | 'Postres' | 'Especiales';
  image?: string;
  icon?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'dirty';
  waiter?: string;
  minutes?: number;
  currentOrder: OrderItem[];
  orderNotes?: string;
}

export interface Transaction {
  id: string;
  folio: string;
  timestamp: string; // e.g. "11:45 AM"
  date: string; // e.g. "2026-07-13"
  type: string; // e.g. "Mesa 4", "Para Llevar", "Barra"
  method: 'Tarjeta' | 'Efectivo';
  total: number;
}
