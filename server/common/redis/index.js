const config = require(`${process.cwd()}/config`)
// redis数据库
const redis = require("redis")
const asyncRedis = require('async-redis')
const redisClient = redis.createClient(config.redis)
// const asyncRedisClient = require('async-redis').decorate(redisClient)
const asyncRedisClientConnect = () => {
    return asyncRedis.createClient(config.redis)
}

redisClient.on("error", function (error) {
    console.error(error)
})
module.exports = { redisClient, asyncRedisClientConnect }