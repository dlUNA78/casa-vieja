const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the activeTab grouping for Mesas
code = code.replace(
  /\{\(activeTab === 'Mesas' \|\| activeTab === 'Comandas' \|\| activeTab === 'Inicio'\) && \(/,
  "{(activeTab === 'Mesas' || activeTab === 'Inicio') && ("
);

// Add the ComandasView right after the TableManagement component
const tableManagementEnd = `              />\n            )}`;
const comandasViewStr = `
            {activeTab === 'Comandas' && (
              <ComandasView 
                tables={tables}
                takeoutOrders={takeoutOrders}
                onCancelOrder={(id, isTakeout) => {
                  if (isTakeout) {
                    handleFreeTakeout(id);
                  } else {
                    handleFreeTable(id);
                  }
                  addNotification('Orden anulada en cocina.');
                }}
                onCancelItem={(orderId, isTakeout, itemIndex) => {
                  if (isTakeout) {
                    setTakeoutOrders(prev => prev.map(t => {
                      if (t.id === orderId) {
                        const newOrder = [...t.currentOrder];
                        newOrder.splice(itemIndex, 1);
                        return { ...t, currentOrder: newOrder };
                      }
                      return t;
                    }));
                  } else {
                    setTables(prev => prev.map(t => {
                      if (t.id === orderId) {
                        const newOrder = [...t.currentOrder];
                        newOrder.splice(itemIndex, 1);
                        return { ...t, currentOrder: newOrder };
                      }
                      return t;
                    }));
                  }
                  addNotification('Platillo anulado en cocina.');
                }}
              />
            )}
`;

code = code.replace(tableManagementEnd, tableManagementEnd + comandasViewStr);
fs.writeFileSync('src/App.tsx', code);
