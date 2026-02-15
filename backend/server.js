const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lists', require('./routes/listRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;

const http = require('http');
const server = http.createServer(app);

// Socket.io initialization with explicit error logging
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: ["https://my-grocery-olive.vercel.app", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], // Added common dev ports
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling', 'websocket'] // Explicitly allow both
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible in routes
app.set('socketio', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
