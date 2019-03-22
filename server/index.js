const express = require('express')
// const https = require('https')
const mosca = require('mosca')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const bodyParser = require('body-parser')
const xmlParser = require('express-xml-bodyparser')
const router = require('./router')
const db = require('./common/mongoose') //数据库连接句柄
// 设置为全局数据库连接句柄
global.db = db
/* 初始化 */

/* 初始化结束 */

const app = express()
/* const options = {
  key: fs.readFileSync('E:/workfiles/Project/ssl/server.key'),
  cert: fs.readFileSync('E:/workfiles/Project/ssl/server.crt')
} */
// const httpsServer = https.createServer(options, app)
const ascoltatore = {
  //using ascoltatore
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

const moscaSettings = {
  port: 1883,
  backend: ascoltatore,
  persistence: {
    factory: mosca.persistence.Mongo,
    url: 'mongodb://localhost:27017/mqtt'
  }
};
const MqttServer = new mosca.Server(moscaSettings)
// MqttServer.attachHttpServer(httpsServer)
// require('./mqtt').MqttServerCreate(MqttServer)
// httpsServer.listen(443)
const httpServer = require('http').createServer(app)
httpServer.listen(8081)
MqttServer.attachHttpServer(httpServer)
require('./mqtt').MqttServerCreate(MqttServer)

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(xmlParser())
// cookie、session配置
app.use(session({
  secret: 'PorYoung',
  cookie: {
    maxAge: 60 * 1000 * 30
  },
  resave: false,
  saveUninitialized: true,
}))
app.use(router)

module.exports = app