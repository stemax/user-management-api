const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Регистрация нового пользователя
exports.register = async (req, res) => {
    const {username, password, role} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }
    try {
        let user = await User.findOne({username});
        if (user) {
            return res.status(400).json({message: 'User already exists'});
        }

        user = new User({username, password, role});
        await user.save();

        // Создание JWT токена
        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({token});
    } catch (err) {
        console.error('Registration error:', err); // Печать ошибки в консоль
        res.status(500).json({message: 'Server error', error: err.message});
    }
};


exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Находим пользователя по имени
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Сравниваем пароли
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Создаем JWT токен
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
