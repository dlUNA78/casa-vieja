// server.js — Puente POS Casa Vieja con estado compartido en memoria
// Sin base de datos. El estado vive mientras el servidor esté corriendo.

import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import express from 'express';

const PORT = 3001;

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ─── Estado compartido en memoria ────────────────────────────────────────────
// Clave: tableId  │  Valor: { tableId, tableNumber, items, orderNotes, ts }
const tableStates = {};

io.on('connection', (socket) => {
  console.log(`[POS] Cliente conectado:    ${socket.id}`);

  // 1. Enviar estado actual al cliente recién conectado (si hay órdenes activas)
  const activeStates = Object.values(tableStates);
  if (activeStates.length > 0) {
    socket.emit('estado_inicial', tableStates);
    console.log(`[POS] Estado enviado a ${socket.id}: ${activeStates.length} mesa(s) activa(s)`);
  }

  // 2. Avisar a los demás que hay un nuevo dispositivo conectado
  socket.broadcast.emit('nuevo_cliente_conectado', { socketId: socket.id });

  // 3. Recibir comanda de un mesero → guardar y sincronizar a TODOS
  socket.on('enviar_orden', (data) => {
    // Guardar en memoria (reemplaza el estado anterior de esa mesa)
    tableStates[data.tableId] = {
      tableId:      data.tableId,
      tableNumber:  data.tableNumber,
      items:        data.items,
      orderNotes:   data.orderNotes || '',
      senderSocketId: socket.id,
      ts:           Date.now(),
    };

    console.log(`[POS] ✓ Mesa ${data.tableNumber} sincronizada | ${data.items.length} platillo(s)`);

    // io.emit → incluye al remitente, así TODOS (celular + caja) quedan igual
    io.emit('sincronizar_mesa', tableStates[data.tableId]);
  });

  // 4. Cuando una mesa se libera, limpiar su estado del servidor
  socket.on('liberar_mesa', ({ tableId }) => {
    if (tableStates[tableId]) {
      const num = tableStates[tableId].tableNumber;
      delete tableStates[tableId];
      io.emit('mesa_liberada', { tableId });
      console.log(`[POS] Mesa ${num} liberada del estado compartido`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[POS] Cliente desconectado: ${socket.id}`);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Servidor POS escuchando en http://0.0.0.0:${PORT}`);
});
