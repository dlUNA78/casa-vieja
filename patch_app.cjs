const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<CashoutFlow[\s\S]*?expectedCash=\{[\s\S]*?\}[\s\S]*?onConfirmPrint=\{[\s\S]*?\}[\s\S]*?\/>/,
  `<CashoutFlow 
                expectedCash={transactions.filter(t => t.method === 'Efectivo').reduce((sum, t) => sum + t.total, 0)}
                transactions={transactions}
                onConfirmPrint={(declared) => {
                  addNotification(\`Cierre de caja completado. Total declarado: \$\${declared.toFixed(2)}.\`);
                  setTransactions([]);
                  changeTab('CajaActual');
                }}
              />`
);

fs.writeFileSync('src/App.tsx', code);
