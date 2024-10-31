const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const http= require('http');
const setupWebSocketServer = require('./wsChatServer');
dotenv.config();

const app = express();

connectDB().then(() => {console.info('MongoDB connected');});
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crypto', cryptoRoutes);
console.log(__dirname);
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

setupWebSocketServer(server);


server.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});

module.exports = app;
