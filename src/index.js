const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)

// Enable CORS for all routes
app.use(
  cors({
    origin: '*', // Allow all origins (change to specific origin if needed)
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
  })
)

const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true // Enable credentials if needed
  }
})

app.get('/', (req, res) => {
  res.end('server running')
})

// All listeners handling below
io.on('connection', (socket) => {
  // console.log('A user connected');
  io.emit('server-connection', true)
  io.emit('visitor-info', `${socket.conn.id}`) // Emit message to all clients

  socket.on('disconnect', () => {
    // console.log('User disconnected');
    io.emit('server-connection', false)
  })

  //  ================ getting signals from react app =======================
  socket.on('react-client', (msg) => {
    // console.log(socket.conn.id)
    // console.log('Message received: ' + msg);
    io.emit('from-react-server', `Operator: ${msg}`) // Emit message to all clients
    io.emit('corejs-client', `Operator: ${msg}`)
  })

  socket.on('operator-call', (msg) => {
    if (msg === 'start-call') {
      io.emit('operator-start-call', true)
      console.log('helo')
    }
  })

  // ================= getting singals from COREJS file =====================

  socket.on('visitor-call', (msg) => {
    if (msg === 'start-call') {
      io.emit('start-call', true)
    }
  })

  socket.on('visitor-decline-call', (msg) => {
    console.log('not attending')
    io.emit('visitor-call-status', msg)
  })

  socket.on('operator-decline-call', (msg) => {
    io.emit('operator-call-status', msg)
  })

  socket.on('corejs-client', (msg) => {
    // console.log(socket.conn.id)
    // console.log(socket.handshake.headers)
    // console.log('Message received: ' + msg);
    io.emit('corejs-client', `Visitor: ${msg}`)
    io.emit('from-react-server', `Visitor: ${msg}`) // Emit message to all clients
    io.emit('visitor-info', `${socket.conn.id}`) // Emit message to all clients
  })
})

// =================== server listening port ================================
server.listen(3001, () => {
  // Ensure this matches the port in your client-side code
  console.log('Listening on *:3001')
})
