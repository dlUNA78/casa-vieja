const fs = require('fs');

const file = 'src/components/MenuCatalog.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
            const defaultImages: Record<string, string> = {
              'Desayunos': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80',
              'Comidas': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
              'Antojitos': 'https://images.unsplash.com/photo-1564987588329-3af7b884d521?w=500&q=80',
              'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
              'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
              'Especiales': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80'
            };
            const itemImage = item.image || defaultImages[item.category] || defaultImages['Comidas'];
            const hasImg = true;
`;

code = code.replace(/const hasImg = !!item.image;/, replacement);
fs.writeFileSync(file, code);
