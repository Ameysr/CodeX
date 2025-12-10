const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10088.c305.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 10088
    }
});

module.exports = redisClient;