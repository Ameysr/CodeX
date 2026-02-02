const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19446.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 19446
    }
});

module.exports = redisClient;