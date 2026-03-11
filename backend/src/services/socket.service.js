let io = null;

function initSocket(socketIO) {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io não inicializado');
  return io;
}

module.exports = { initSocket, getIO };
