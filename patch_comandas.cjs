const fs = require('fs');
let code = fs.readFileSync('src/components/ComandasView.tsx', 'utf8');

code = code.replace(
  /<span>Hace \{order\.minutes \|\| 1\} min<\/span>/,
  "<span>Hace {(order as any).minutes || 1} min</span>"
);

fs.writeFileSync('src/components/ComandasView.tsx', code);
