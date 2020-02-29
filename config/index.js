const mosca = require('mosca')
const config = {
  server_url: 'https://localhost',
  wechat_login_url: `https://api.weixin.qq.com/sns/jscode2session`,
  wechat_AppID: 'wxdc501806d28dc430',
  wechat_AppSecret: 'ba554361047bad30781920b7808ccf66',
  superManagerCode: 'PorYoung',
  managerCode: 'AquaponicsIOT',
  MqttConfig: {
    userPubAuth: ['instruction'],
    devicePubAuth: ['data'],
    userSubAuth: ['data', 'warning'],
    deviceSubAuth: ['instruction'],
    publicAuth: ['test', 'info']
  },
  ssl: {
    enable: 'all',
    key: 'E:/workfiles/Project/ssl/server.key',
    cert: 'E:/workfiles/Project/ssl/server.crt'
  },
  moscaSettings: {
    port: 1883,
    backend: {
      //using ascoltatore
      type: 'mongo',
      url: 'mongodb://localhost:27017/mqtt',
      pubsubCollection: 'ascoltatori',
      mongo: {}
    },
    persistence: {
      factory: mosca.persistence.Mongo,
      url: 'mongodb://localhost:27017/mqtt'
    }
  },
  mongo: {
    host: 'localhost',
    port: '27017',
    database: 'fishv'
  },
  mongoose: {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: '1'
  }
}
config.MqttConfig = Object.assign(config.MqttConfig, {
  mqttDataAnalysisApi: config.server_url + '/api/mqttDataAnalysis',
  seperator: '/'
})
module.exports = config
