import { MenuItem, Table, Transaction } from './types';
import { menuItemsData } from './data/menu';

export const INITIAL_MENU_ITEMS: MenuItem[] = menuItemsData;

export const INITIAL_TABLES: Table[] = [
  {
    id: 'table_1',
    number: 1,
    status: 'occupied',
    waiter: 'Juan P.',
    minutes: 45,
    currentOrder: [
      {
        menuItem: INITIAL_MENU_ITEMS[8], // Enchiladas Rojas
        quantity: 2,
        notes: 'Picosas'
      },
      {
        menuItem: INITIAL_MENU_ITEMS[0], // Chilaquiles
        quantity: 1,
        notes: ''
      }
    ]
  },
  {
    id: 'table_2',
    number: 2,
    status: 'available',
    currentOrder: []
  },
  {
    id: 'table_3',
    number: 3,
    status: 'occupied',
    waiter: 'María L.',
    minutes: 15,
    currentOrder: [
      {
        menuItem: INITIAL_MENU_ITEMS[1], // Huevos al Gusto
        quantity: 1,
        notes: 'Sin cebolla'
      }
    ]
  },
  {
    id: 'table_4',
    number: 4,
    status: 'dirty',
    currentOrder: []
  },
  {
    id: 'table_5',
    number: 5,
    status: 'available',
    currentOrder: []
  },
  {
    id: 'table_12',
    number: 12,
    status: 'occupied',
    waiter: 'Juan P.',
    minutes: 10,
    currentOrder: [
      {
        menuItem: INITIAL_MENU_ITEMS[0], // Chilaquiles
        quantity: 1,
        notes: ''
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_142',
    folio: '#00142',
    timestamp: '11:45 AM',
    date: '2026-07-13',
    type: 'Mesa 4',
    method: 'Tarjeta',
    total: 450.00
  },
  {
    id: 'tx_143',
    folio: '#00143',
    timestamp: '12:10 PM',
    date: '2026-07-13',
    type: 'Para Llevar',
    method: 'Efectivo',
    total: 180.00
  },
  {
    id: 'tx_144',
    folio: '#00144',
    timestamp: '12:35 PM',
    date: '2026-07-13',
    type: 'Mesa 12',
    method: 'Tarjeta',
    total: 1250.00
  },
  {
    id: 'tx_145',
    folio: '#00145',
    timestamp: '01:15 PM',
    date: '2026-07-13',
    type: 'Barra',
    method: 'Tarjeta',
    total: 320.00
  }
];
