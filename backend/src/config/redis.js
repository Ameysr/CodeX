const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-16012.crce276.ap-south-1-3.ec2.cloud.redislabs.com',
        port: 16012
    }
});

module.exports = redisClient;