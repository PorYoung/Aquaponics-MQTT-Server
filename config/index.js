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
  }
}
config.MqttConfig = Object.assign(config.MqttConfig, {
  mqttDataAnalysisApi: config.server_url + '/api/mqttDataAnalysis',
  seperator: '/'
})
module.exports = config