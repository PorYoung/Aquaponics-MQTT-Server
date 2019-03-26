const express = require('express')
const mosca = require('mosca')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const xmlParser = require('express-xml-bodyparser')
const router = require('./router')
const db = require('./common/mongoose') //数据库连接句柄
const config = require('../config')
// 设置为全局数据库连接句柄
global.db = db
/* 初始化 */

/* 初始化结束 */

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
  secret: 'PorYoung',
  cookie: {
    maxAge: 60 * 1000 * 30
  },
  resave: false,
  saveUninitialized: true,
}))
app.use(router)

module.exports = app