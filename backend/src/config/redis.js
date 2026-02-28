const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST || 'redis-16012.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
        port: parseInt(process.env.REDIS_PORT || '16012'),
    },
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('Redis connected');
});

module.exports = redisClient;