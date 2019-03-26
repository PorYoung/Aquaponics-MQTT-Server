const mosca = require('mosca')
const config = {
  server_url: 'https://localhost',
  wechat_login_url: `https://api.weixin.qq.com/sns/jscode2session`,
  wechat_AppID: 'wxdc501806d28dc430',
  wechat_AppSecret: 'ba554361047bad30781920b7808ccf66',
  MqttConfig: {
    userPubAuth: ['instruction'],
    devicePubAuth: ['data'],
    userSubAuth: ['data', 'wraning'],
    deviceSubAuth: ['instruction'],
    publicAuth: ['test', 'info']
  },
  ssl: {
    enable: 'false',
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
  }
}
config.MqttConfig = Object.assign(config.MqttConfig, {
  mqttDataAnalysisApi: config.server_url + '/api/mqttDataAnalysis',
  seperator: '/'
})
module.exports = config