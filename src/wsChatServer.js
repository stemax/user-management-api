const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Модель пользователя
const Message = require('./models/Message'); // Модель сообщения
const activeUsers = new Set(); // Список активных пользователей
function setupWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        console.log('New client connected');

        // Добавляем нового пользователя
        const userId = req.headers['sec-websocket-key']; // Можем использовать уникальный ключ для идентификации
        activeUsers.add(userId);

        // Отправляем последние сообщения при подключении
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50).exec();
        messages.reverse(); // Чтобы отправить их в правильном порядке
        messages.forEach(msg => {
            ws.send(JSON.stringify({ type: 'chat', user: msg.user, text: msg.text, timestamp: msg.timestamp }));
        });

        // Уведомляем всех клиентов о новом пользователе
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'user_joined', userId }));
            }
        });

        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data);

                if (message.type === 'auth') {
                    const token = message.token;

                    try {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        ws.user = await User.findById(decoded.id);

                        if (!ws.user) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid user' }));
                            ws.close();
                        } else {
                            ws.send(JSON.stringify({ type: 'auth_success', message: 'Authenticated' }));
                        }
                    } catch (err) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
                        ws.close();
                    }
                } else if (message.type === 'chat') {
                    if (!ws.user) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
                        ws.close();
                    } else {
                        const chatMessage = {
                            user: ws.user.username,
                            text: message.text,
                            timestamp: new Date(),
                        };

                        // Сохранение сообщения в базе данных
                        await Message.create(chatMessage);

                        // Отправляем сообщение всем клиентам
                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'chat', ...chatMessage }));
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            activeUsers.delete(userId);
        });
    });
}

module.exports = setupWebSocketServer;
