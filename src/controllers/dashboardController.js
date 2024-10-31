const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Регистрация нового пользователя
exports.getDashboard = async (req, res) => {
    res.json({message: `Welcome to your dashboard, user ID: ${req.user.id}`});
};
