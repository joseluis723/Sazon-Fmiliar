// Guarda la instancia de Socket.io en el objeto global para que las API routes
// (que corren en el mismo proceso que server.js) puedan emitir eventos.

function setIO(io) {
  globalThis.__io = io;
}

function getIO() {
  return globalThis.__io || null;
}

/** Emite un evento a todos los paneles (admin y cocina) y, opcionalmente, a la mesa del pedido. */
function emitOrderEvent(eventName, order) {
  const io = getIO();
  if (!io) return;
  io.to("staff").emit(eventName, order);
  if (order?.tableId) {
    io.to(`mesa:${order.tableId}`).emit(eventName, order);
  }
}

module.exports = { setIO, getIO, emitOrderEvent };
