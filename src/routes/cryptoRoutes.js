// src/routes/cryptoRoutes.js
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 }); // Кэшировать данные на 10 минут

router.get('/crypto-prices', async (req, res) => {
    const cachedData = cache.get('cryptoPrices');

    if (cachedData) {
        return res.json(cachedData); // Отправить кэшированные данные
    }

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,ton&vs_currencies=usd');
        const data = response.data;

        cache.set('cryptoPrices', data); // Сохранить данные в кэш

        res.json(data);
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        res.status(500).json({ message: 'Error fetching crypto prices' });
    }
});

router.delete('/crypto-prices/cache', (req, res) => {
    cache.del('cryptoPrices'); // Удалить данные из кэша
    res.json({ message: 'Cache cleared successfully' });
});

module.exports = router;
