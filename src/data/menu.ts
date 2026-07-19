import { MenuItem, MenuOptionGroup } from '../types';

const GLOBAL_EXTRAS: MenuOptionGroup = {
  name: 'Extras Adicionales',
  required: false,
  multiSelect: true,
  options: [
    { name: 'Extra de cecina', priceDelta: 50 },
    { name: 'Pieza de pollo', priceDelta: 35 },
    { name: 'Pieza huevo', priceDelta: 20 },
    { name: 'Extra pollo desmenuzado', priceDelta: 30 },
    { name: 'Extra queso', priceDelta: 10 },
    { name: 'Porción extra res, cerdo o adobada', priceDelta: 30 },
  ]
};

export const menuItemsData: MenuItem[] = [
  // CATEGORÍA 1: Desayunos y Especialidades
  {
    id: 'chilaquiles',
    name: 'Chilaquiles',
    description: 'Verdes o rojos',
    price: 65, // Base sencillos
    category: 'Desayunos',
    optionGroups: [
      {
        name: 'Salsa',
        required: true,
        options: [
          { name: 'Verdes', priceDelta: 0 },
          { name: 'Rojos', priceDelta: 0 }
        ]
      },
      {
        name: 'Preparación',
        required: true,
        options: [
          { name: 'Sencillos', priceDelta: 0 },
          { name: 'c/Huevo', priceDelta: 20 }, // 85 - 65
          { name: 'Pollo', priceDelta: 35 }, // 100 - 65
          { name: 'c/Pollo y Huevo', priceDelta: 55 } // 120 - 65
        ]
      },
      {
        name: 'Extras',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Extra de cecina', priceDelta: 50 },
          { name: 'Queso extra', priceDelta: 10 },
          { name: 'Porción extra res, cerdo o adobada', priceDelta: 30 }
        ]
      }
    ]
  },
  {
    id: 'enchiladas_rojas',
    name: 'Enchiladas Rojas',
    description: '',
    price: 70, // Sencillas
    category: 'Desayunos',
    optionGroups: [
      {
        name: 'Orden',
        required: true,
        options: [
          { name: 'Sencillas', priceDelta: 0 },
          { name: 'Media Orden Pollo o Cecina', priceDelta: 10 }, // 80
          { name: 'c/Pollo o Cecina', priceDelta: 30 }, // 100
          { name: 'Pollo y Cecina', priceDelta: 80 }, // 150
        ]
      },
      {
        name: 'Extras',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Pieza de huevo', priceDelta: 20 },
          { name: 'Queso extra', priceDelta: 10 }
        ]
      }
    ]
  },
  {
    id: 'huevos_al_gusto',
    name: 'Huevos al Gusto',
    description: 'Jamón, tocino, salchicha o chorizo',
    price: 75,
    category: 'Desayunos',
    optionGroups: [
      {
        name: 'Ingrediente Principal',
        required: true,
        options: [
          { name: 'Jamón', priceDelta: 0 },
          { name: 'Tocino', priceDelta: 0 },
          { name: 'Salchicha', priceDelta: 0 },
          { name: 'Chorizo', priceDelta: 0 },
        ]
      },
      {
        name: 'Ingrediente Adicional',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Jamón extra', priceDelta: 20 },
          { name: 'Tocino extra', priceDelta: 20 },
          { name: 'Salchicha extra', priceDelta: 20 },
          { name: 'Chorizo extra', priceDelta: 20 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'omelette',
    name: 'Omelette',
    description: 'Jamón, champiñón, pimiento o tocino',
    price: 95,
    category: 'Desayunos',
    optionGroups: [
      {
        name: 'Ingrediente Principal',
        required: true,
        options: [
          { name: 'Jamón', priceDelta: 0 },
          { name: 'Champiñón', priceDelta: 0 },
          { name: 'Pimiento', priceDelta: 0 },
          { name: 'Tocino', priceDelta: 0 },
        ]
      },
      {
        name: 'Ingrediente Adicional',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Jamón extra', priceDelta: 20 },
          { name: 'Champiñón extra', priceDelta: 20 },
          { name: 'Pimiento extra', priceDelta: 20 },
          { name: 'Tocino extra', priceDelta: 20 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'huevos_divorciados_rancheros',
    name: 'Huevos Divorciados o Rancheros',
    description: '',
    price: 90,
    category: 'Desayunos',
    optionGroups: [
      {
        name: 'Estilo',
        required: true,
        options: [
          { name: 'Divorciados (Salsa Verde y Roja)', priceDelta: 0 },
          { name: 'Rancheros', priceDelta: 0 },
        ]
      },
      {
        name: 'Extras',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Ingrediente Adicional (Jamón, Tocino, etc)', priceDelta: 20 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },

  // CATEGORÍA 2: Antojitos
  {
    id: 'alambres',
    name: 'Alambres',
    description: 'Asada de res, cerdo, adobada, pastor, mixto',
    price: 110,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Carne (Selecciona 1 o más para Mixto)',
        required: true,
        multiSelect: true,
        options: [
          { name: 'Asada de Res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'burro_suizo_enchilado',
    name: 'Burro Suizo o Enchilado',
    description: 'Asada de res, cerdo, adobada, pastor o mixto',
    price: 90,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Estilo',
        required: true,
        options: [
          { name: 'Suizo', priceDelta: 0 },
          { name: 'Enchilado', priceDelta: 0 },
        ]
      },
      {
        name: 'Carne (Selecciona 1 o más para Mixto)',
        required: true,
        multiSelect: true,
        options: [
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'huaraches',
    name: 'Huaraches',
    description: 'Asada de res, cerdo, adobada, pastor o mixto',
    price: 70,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Carne (Selecciona 1 o más para Mixto)',
        required: true,
        multiSelect: true,
        options: [
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'chavindeca',
    name: 'Chavindeca',
    description: 'Asada de res, cerdo, adobada, pastor o mixto',
    price: 80, // Chica
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Tamaño',
        required: true,
        options: [
          { name: 'Chica', priceDelta: 0 },
          { name: 'Grande', priceDelta: 20 }, // 100 - 80
        ]
      },
      {
        name: 'Carne (Selecciona 1 o más para Mixto)',
        required: true,
        multiSelect: true,
        options: [
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'burro_norteno',
    name: 'Burro Norteño',
    description: 'Asada de res, cerdo, adobada, pastor',
    price: 70,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Carne',
        required: true,
        options: [
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'tacos',
    name: 'Tacos',
    description: 'Asada de res, asada de cerdo, adobada o pastor',
    price: 17,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Carne',
        required: true,
        options: [
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Asada de cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'sincronizada',
    name: 'Sincronizada',
    description: '',
    price: 70, // Jamón
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Tipo de Especialidad',
        required: true,
        options: [
          { name: 'De Jamón', priceDelta: 0 },
          { name: 'Especial (Otras Carnes / Mixta)', priceDelta: 20 }
        ]
      },
      {
        name: 'Carnes Especiales (Selecciona 1 o más para Mixto)',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Pastor', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'quesadilla',
    name: 'Quesadilla',
    description: '',
    price: 35, // Sencilla
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Ingrediente Principal',
        required: true,
        options: [
          { name: 'Sencilla', priceDelta: 0 },
          { name: 'Champiñón', priceDelta: 20 }, // 55 - 35
          { name: 'Pollo', priceDelta: 20 },
          { name: 'Res', priceDelta: 20 },
          { name: 'Cerdo', priceDelta: 20 },
          { name: 'Adobada', priceDelta: 20 },
          { name: 'Jamón', priceDelta: 20 },
          { name: 'Pastor', priceDelta: 20 },
        ]
      },
      {
        name: 'Ingredientes Adicionales',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Champiñón extra', priceDelta: 15 },
          { name: 'Pollo extra', priceDelta: 15 },
          { name: 'Res extra', priceDelta: 15 },
          { name: 'Cerdo extra', priceDelta: 15 },
          { name: 'Adobada extra', priceDelta: 15 },
          { name: 'Jamón extra', priceDelta: 15 },
          { name: 'Pastor extra', priceDelta: 15 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },

  // CATEGORÍA 3: Platos Fuertes y Opciones a la Carta
  {
    id: 'nachos_clasicos',
    name: 'Nachos Clásicos',
    description: '',
    price: 85,
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Tamaño/Variante',
        required: true,
        options: [
          { name: 'Clásicos', priceDelta: 0 },
          { name: 'c/Guacamole', priceDelta: 15 }, // 100 - 85
          { name: 'c/Carne', priceDelta: 40 }, // 125 - 85
          { name: 'Xtra (Carne extra)', priceDelta: 65 }, // 150 - 85
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'carne_asada',
    name: 'Carne Asada',
    description: 'Arrachera o diezmillo. Opción Especial disponible.',
    price: 180,
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Corte / Especialidad',
        required: true,
        options: [
          { name: 'Arrachera', priceDelta: 0 },
          { name: 'Diezmillo', priceDelta: 0 },
          { name: 'Carne Asada Especial', priceDelta: 20 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'pechuga_pollo',
    name: 'Pechuga de Pollo',
    description: 'A la plancha, a las finas hierbas o empanizada',
    price: 180,
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Preparación',
        required: true,
        options: [
          { name: 'A la plancha', priceDelta: 0 },
          { name: 'A las finas hierbas', priceDelta: 0 },
          { name: 'Empanizada', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'hamburguesa',
    name: 'Hamburguesa',
    description: '',
    price: 100, // clasica o pollo
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Tipo',
        required: true,
        options: [
          { name: 'Clásica', priceDelta: 0 },
          { name: 'Pollo', priceDelta: 0 },
          { name: 'Especial', priceDelta: 25 }, // 125 - 100
          { name: 'Hawaiana', priceDelta: 25 }, // 125 - 100
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'tortas',
    name: 'Tortas',
    description: '',
    price: 50, // Sencilla
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Tipo de Torta',
        required: true,
        options: [
          { name: 'Sencilla (1 ingrediente)', priceDelta: 0 },
          { name: '2 ingredientes', priceDelta: 10 }, // 60 - 50
          { name: '3 ó más ingredientes', priceDelta: 30 }, // 80 - 50
          { name: 'Cubana', priceDelta: 40 }, // 90 - 50
        ]
      },
      {
        name: 'Ingredientes a elegir',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Jamón', priceDelta: 0 },
          { name: 'Salchicha', priceDelta: 0 },
          { name: 'Queso', priceDelta: 0 },
          { name: 'Milanesa', priceDelta: 0 },
          { name: 'Pierna', priceDelta: 0 },
          { name: 'Huevo', priceDelta: 0 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'flautas',
    name: 'Orden de Flautas',
    description: 'Pollo, papa o lomo',
    price: 70,
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Relleno',
        required: true,
        options: [
          { name: 'Pollo', priceDelta: 0 },
          { name: 'Papa', priceDelta: 0 },
          { name: 'Lomo', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'sopitos',
    name: 'Sopitos o Tacos Dorados (pza)',
    description: 'Pollo, lomo o picadillo',
    price: 20,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Tipo',
        required: true,
        options: [
          { name: 'Sopito', priceDelta: 0 },
          { name: 'Taco Dorado', priceDelta: 0 },
        ]
      },
      {
        name: 'Carne',
        required: true,
        options: [
          { name: 'Pollo', priceDelta: 0 },
          { name: 'Lomo', priceDelta: 0 },
          { name: 'Picadillo', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'popusa',
    name: 'Popusa',
    description: 'Lomo, pollo, asada de res, cerdo, adobada, jamón o queso',
    price: 35,
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Relleno',
        required: true,
        options: [
          { name: 'Lomo', priceDelta: 0 },
          { name: 'Pollo', priceDelta: 0 },
          { name: 'Asada de res', priceDelta: 0 },
          { name: 'Cerdo', priceDelta: 0 },
          { name: 'Adobada', priceDelta: 0 },
          { name: 'Jamón', priceDelta: 0 },
          { name: 'Queso', priceDelta: 0 },
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'tostadas',
    name: 'Tostadas',
    description: 'Lomo, pollo, cueritos o pata',
    price: 30, // Base Lomo
    category: 'Antojitos',
    optionGroups: [
      {
        name: 'Tipo',
        required: true,
        options: [
          { name: 'Lomo', priceDelta: 0 },
          { name: 'Pollo', priceDelta: 5 },
          { name: 'Cueritos', priceDelta: 5 },
          { name: 'Pata', priceDelta: 5 }
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'morisqueta',
    name: 'Morisqueta',
    description: '',
    price: 20, // sencilla chica
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Tamaño y Estilo',
        required: true,
        options: [
          { name: 'Sencilla Chica', priceDelta: 0 },
          { name: 'Sencilla Grande', priceDelta: 10 }, // 30 - 20
          { name: 'Con carne chica', priceDelta: 20 }, // 40 - 20
          { name: 'Con carne grande', priceDelta: 30 }, // 50 - 20
        ]
      },
      GLOBAL_EXTRAS
    ]
  },
  {
    id: 'guisado_dia',
    name: 'Guisado del Día',
    description: '(Sujeto a disponibilidad)',
    price: 85,
    category: 'Comidas',
    optionGroups: [
      {
        name: 'Combo',
        required: true,
        options: [
          { name: 'Solo Guisado', priceDelta: 0 },
          { name: 'Guisado + Agua', priceDelta: 10 } // 95 - 85
        ]
      },
      GLOBAL_EXTRAS
    ]
  },

  // CATEGORÍA 4: Menú Dulce (¡PROHIBIDO OFRECER EXTRAS SALADOS!)
  {
    id: 'fruta_yogurth',
    name: 'Fruta con Yogurth',
    description: 'Incluye plátano, manzana, melón, fresa y yogurth',
    price: 50,
    category: 'Postres',
    optionGroups: [
      {
        name: 'Exclusiones (Quitar ingredientes)',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Sin plátano', priceDelta: 0 },
          { name: 'Sin manzana', priceDelta: 0 },
          { name: 'Sin melón', priceDelta: 0 },
          { name: 'Sin fresa', priceDelta: 0 },
          { name: 'Sin yogurth', priceDelta: 0 },
        ]
      }
    ]
  },
  {
    id: 'hot_cakes',
    name: 'Hot Cakes',
    description: 'Incluye platano, fresa y lechera',
    price: 70,
    category: 'Postres',
    optionGroups: [
      {
        name: 'Exclusiones (Quitar ingredientes)',
        required: false,
        multiSelect: true,
        options: [
          { name: 'Sin platano', priceDelta: 0 },
          { name: 'Sin fresa', priceDelta: 0 },
          { name: 'Sin lechera', priceDelta: 0 },
        ]
      }
    ]
  },

  // CATEGORÍA 5: Platillos Fijos (Sin Variantes)
  {
    id: 'enchiladas_suizas',
    name: 'Enchiladas Suizas',
    description: '',
    price: 100,
    category: 'Comidas',
    optionGroups: []
  },
  {
    id: 'club_sandwich',
    name: 'Club Sandwich',
    description: '',
    price: 110,
    category: 'Comidas',
    optionGroups: []
  },
  {
    id: 'molletes',
    name: 'Molletes',
    description: '',
    price: 70,
    category: 'Antojitos',
    optionGroups: []
  },
  {
    id: 'nuggets',
    name: 'Nuggets de Pollo',
    description: 'Incluye papas a la francesa',
    price: 70,
    category: 'Comidas',
    optionGroups: []
  },
  {
    id: 'papas_francesa',
    name: 'Papas a la Francesa',
    description: '',
    price: 60,
    category: 'Antojitos',
    optionGroups: []
  }
];
