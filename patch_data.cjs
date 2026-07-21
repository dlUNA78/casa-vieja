const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(
  /export const INITIAL_TABLES: Table\[\] = \[([\s\S]*?)\];/,
  `export const INITIAL_TABLES: Table[] = [
  { id: 'table_1', number: 1, status: 'available', currentOrder: [] },
  { id: 'table_2', number: 2, status: 'available', currentOrder: [] },
  { id: 'table_3', number: 3, status: 'available', currentOrder: [] },
  { id: 'table_4', number: 4, status: 'available', currentOrder: [] },
  { id: 'table_5', number: 5, status: 'available', currentOrder: [] },
  { id: 'table_12', number: 12, status: 'available', currentOrder: [] }
];`
);

code = code.replace(
  /export const INITIAL_TRANSACTIONS: Transaction\[\] = \[([\s\S]*?)\];/,
  `export const INITIAL_TRANSACTIONS: Transaction[] = [];`
);

fs.writeFileSync('src/data.ts', code);
