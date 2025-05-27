// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir los archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Comunicación por sockets
io.on('connection', (socket) => {
  console.log('🎉 Una nueva pantalla se conectó');

  // Cuando alguien envía datos, reenviarlos a todos (incluido quien envió)
  socket.on('datos', (data) => {
    io.emit('datos', data); // emite a todos
  });

  socket.on('disconnect', () => {
    console.log('💨 Una pantalla se desconectó');
  });
});

// Usar el puerto de Heroku si está disponible, o 3000 si es local
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`🌐 Servidor funcionando en http://localhost:${PORT}`);
});

