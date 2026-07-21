// server.js — Puente "Smoke & Mirrors" para el POS Casa Vieja
// Solo retransmite eventos entre clientes; sin base de datos ni persistencia.

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
  cors: {
    origin: '*',      // En producción limita esto a tu IP local
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[POS] Cliente conectado: ${socket.id}`);

  // Notificar a los demás clientes (la caja) que un mesero se conectó
  socket.broadcast.emit('nuevo_cliente_conectado', { socketId: socket.id });

  // El celular (mesero) envía este evento con los datos de la comanda
  socket.on('enviar_orden', (data) => {
    console.log(`[POS] Nueva orden recibida de Mesa ${data.tableNumber}:`, data);

    // Retransmitir a TODOS los demás clientes (la caja registradora)
    socket.broadcast.emit('nueva_orden_recibida', data);
  });

  socket.on('disconnect', () => {
    console.log(`[POS] Cliente desconectado: ${socket.id}`);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Servidor POS escuchando en http://0.0.0.0:${PORT}`);
});
