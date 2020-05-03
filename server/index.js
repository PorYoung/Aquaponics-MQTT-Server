const express = require('express')
const mosca = require('mosca')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const xmlParser = require('express-xml-bodyparser')
const router = require('./router')
// 数据库连接句柄
const db = require('./common/mongoose')
// // redis数据库
const { redisClient, asyncRedisClientConnect } = require('./common/redis')
// session
const session = require('express-session')
let RedisStore = require('connect-redis')(session)
const config = require('../config')
// 设置为全局数据库连接句柄
global.db = db
global.redisClient = redisClient
global.asyncRedisClientConnect = asyncRedisClientConnect

const app = express()
const MqttServer = new mosca.Server(config.moscaSettings)

// HTTPS OR HTTP
if (config.ssl.enable === true) {
  const fs = require('fs')
  const https = require('https')
  const options = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert)
  }
  const httpsServer = https.createServer(options, app)
  httpsServer.listen(443)
  MqttServer.attachHttpServer(httpsServer)
} else if (config.ssl.enable == 'all') {
  const fs = require('fs')
  const https = require('https')
  const options = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert)
  }
  const httpsServer = https.createServer(options, app)
  httpsServer.listen(443)
  MqttServer.attachHttpServer(httpsServer)
  const httpServer = require('http').createServer(app)
  httpServer.listen(8081)
} else if (config.ssl.enable === false) {
  const httpServer = require('http').createServer(app)
  httpServer.listen(8081)
  MqttServer.attachHttpServer(httpServer)
}

require('./mqtt').MqttServerCreate(MqttServer)

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(xmlParser())

// cookie、session配置
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'PorYoung',
  cookie: {
    maxAge: 60 * 1000 * 30
  },
  resave: false,
  saveUninitialized: true,
}))
redisClient.flushdb(async () => {
  app.use(router)
  await require('./common/init').userListCategorize()
  console.log('Redis flush db successs!')
})
process.on('uncaughtException', (err) => {
  console.log('Exit!')
  redisClient.end(true)
})
module.exports = app