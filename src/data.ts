import { MenuItem, Table, Transaction } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'chilaquiles_rojos',
    name: 'Chilaquiles Rojos',
    description: 'Con pollo, crema, queso artesanal y cebolla morada.',
    price: 120,
    category: 'Desayunos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo_ETMng8rFe2azYpzu4bHpk5jxlDC-iarslzku25dH0rE_YmSXvxHIcbd1HHSzSPloGhTiYpdafZEqGJphU-ZOtir6Bw-b6Ei_6gEDmea7FIV3iX47SuyeqPDxFcPeWPSxB2GBdtVmfYw3lCTNAMOqboJbGTR2ens4kjTpqy41W1grDYGnFTiLZNmGhaGnFtyJg_ZfeDtf1k-v8UBG3t3ucWlAZLTPRhyh3Wk8-RAcP-Pwt0yiS75Ag3DOX7CjK2K-RBCTJGXDCk'
  },
  {
    id: 'cafe_olla',
    name: 'Café de Olla',
    description: 'Tradicional con piloncillo y canela.',
    price: 95,
    category: 'Bebidas',
    icon: 'local_cafe'
  },
  {
    id: 'huevos_motulenos',
    name: 'Huevos Motuleños',
    description: 'Sobre tortilla frita con frijoles, salsa de tomate, jamón y chícharos.',
    price: 145,
    category: 'Desayunos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo_ETMng8rFe2azYpzu4bHpk5jxlDC-iarslzku25dH0rE_YmSXvxHIcbd1HHSzSPloGhTiYpdafZEqGJphU-ZOtir6Bw-b6Ei_6gEDmea7FIV3iX47SuyeqPDxFcPeWPSxB2GBdtVmfYw3lCTNAMOqboJbGTR2ens4kjTpqy41W1grDYGnFTiLZNmGhaGnFtyJg_ZfeDtf1k-v8UBG3t3ucWlAZLTPRhyh3Wk8-RAcP-Pwt0yiS75Ag3DOX7CjK2K-RBCTJGXDCk'
  },
  {
    id: 'naranjada',
    name: 'Naranjada',
    description: 'Natural o mineral, recién exprimida.',
    price: 45,
    category: 'Bebidas',
    icon: 'local_drink'
  },
  {
    id: 'enchiladas_suizas',
    name: 'Enchiladas Suizas',
    description: 'Rellenas de pollo deshuesado, salsa verde cremosa, gratinadas con queso manchego.',
    price: 135,
    category: 'Antojitos',
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'tacos_cochinita',
    name: 'Tacos de Cochinita',
    description: 'Tres deliciosos tacos con carne marinada en achiote, acompañados de cebolla morada curtida.',
    price: 110,
    category: 'Antojitos',
    icon: 'restaurant'
  },
  {
    id: 'flan_napolitano',
    name: 'Flan Napolitano',
    description: 'Flan casero suave y cremoso con caramelo de piloncillo artesanal.',
    price: 65,
    category: 'Postres',
    icon: 'icecream'
  },
  {
    id: 'arroz_leche',
    name: 'Arroz con Leche',
    description: 'Cocinado lentamente con canela de Ceilán, ralladura de limón y pasas.',
    price: 60,
    category: 'Postres',
    icon: 'cookie'
  },
  {
    id: 'especial_casa_vieja',
    name: 'Especial Casa Vieja',
    description: 'Corte de arrachera con nopales asados, cebollitas cambray y mole poblano.',
    price: 185,
    category: 'Especiales',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'
  }
];

export const INITIAL_TABLES: Table[] = [
  {
    id: 'table_1',
    number: 1,
    status: 'occupied',
    waiter: 'Juan P.',
    minutes: 45,
    currentOrder: [
      {
        menuItem: INITIAL_MENU_ITEMS[4], // Enchiladas Suizas
        quantity: 2,
        notes: 'Picosas'
      },
      {
        menuItem: INITIAL_MENU_ITEMS[1], // Café de olla
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
        menuItem: INITIAL_MENU_ITEMS[5], // Tacos Cochinita
        quantity: 1,
        notes: 'Sin chile'
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
        menuItem: INITIAL_MENU_ITEMS[0], // Chilaquiles Rojos
        quantity: 1,
        notes: 'Sin cebolla, extra crema'
      },
      {
        menuItem: INITIAL_MENU_ITEMS[3], // Naranjada
        quantity: 2,
        notes: 'Mineral'
      }
    ],
    orderNotes: 'Ej. Término medio, sin sal...'
  },
  {
    id: 'table_6',
    number: 6,
    status: 'available',
    currentOrder: []
  },
  {
    id: 'table_7',
    number: 7,
    status: 'available',
    currentOrder: []
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
