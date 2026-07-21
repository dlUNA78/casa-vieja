const fs = require('fs');
let data = fs.readFileSync('src/data/menu.ts', 'utf8');

const images = {
  'Desayunos': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80',
  'Comidas': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
  'Antojitos': 'https://images.unsplash.com/photo-1564987588329-3af7b884d521?w=500&q=80',
  'Postres': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80',
  'Bebidas': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80',
  'Especiales': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80'
};

for (const [cat, img] of Object.entries(images)) {
  const regex = new RegExp(`category: '${cat}',`, 'g');
  data = data.replace(regex, `category: '${cat}',\n    image: '${img}',`);
}

fs.writeFileSync('src/data/menu.ts', data);
