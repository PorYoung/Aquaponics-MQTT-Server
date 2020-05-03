const mosca = require('mosca')
const config = {
  server_url: 'https://localhost',
  wechat_login_url: `https://api.weixin.qq.com/sns/jscode2session`,
  wechat_AppID: 'wxdc501806d28dc430',
  wechat_AppSecret: 'ba554361047bad30781920b7808ccf66',
  superManagerCode: 'PorYoung',
  managerCode: 'AquaponicsIOT',
  MqttConfig: {
    userPubAuth: ['instruction', 'data'],
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
  },
  defaultDefine: [{
    id: 'PHH2O',
    name: '酸碱度',
    wmax: 7.5,
    wmin: 6.5,
    max: 14,
    min: 0,
    desc: '',
    manual: false
  }, {
    id: 'TH2O',
    name: '水温',
    unit: '℃',
    wmax: 30,
    wmin: 15,
    max: 100,
    min: 0,
    desc: '',
    manual: false
  }, {
    id: 'TAN',
    name: '总氨氮',
    unit: 'ppm',
    wmax: 10e6,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'NH3',
    name: '氨',
    unit: 'ppm',
    wmax: 3,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'NO2MAX',
    name: '亚硝酸盐最大值',
    unit: 'ppm',
    wmax: 1,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'NO3MAX',
    name: '硝酸盐最大值',
    unit: 'ppm',
    wmax: 250,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'PHMANUAL',
    name: '酸碱度-人工测量',
    wmax: 7.5,
    wmin: 6.5,
    max: 14,
    min: 0,
    desc: '',
    manual: true
  }, {
    id: 'EC',
    name: '电导率',
    unit: 'μS/cm',
    wmax: 1000,
    wmin: 0,
    max: 10000,
    min: 0
  }, {
    id: 'DO',
    name: '溶解氧',
    unit: 'ppm',
    wmax: 10,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'CL',
    name: '氯',
    unit: 'ppm',
    wmax: 0.02,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'K',
    name: '钾',
    unit: 'ppm',
    wmax: 40,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'CA',
    name: '钙',
    unit: 'ppm',
    wmax: 40,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'FE',
    name: '铁',
    unit: 'ppm',
    wmax: 10e6,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'Mg',
    name: '镁',
    unit: 'ppm',
    wmax: 10e6,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'P',
    name: '磷',
    unit: 'ppm',
    wmax: 10e6,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'PAR',
    name: '照明强度',
    unit: 'lx',
    wmax: 10e6,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: true
  }, {
    id: 'LIGHT',
    name: '照明强度',
    unit: 'lx',
    wmax: 10e6,
    wmin: 0,
    max: 10e6,
    min: 0,
    manual: false
  }, {
    id: 'TAIR',
    name: '空气温度',
    unit: '℃',
    wmax: 26,
    wmin: 12,
    max: -50,
    min: 50,
    desc: '',
    manual: false
  }, {
    id: 'RHAIR',
    name: '空气湿度',
    unit: '%',
    wmax: 80,
    wmin: 60,
    max: 100,
    min: 0,
    desc: '',
    manual: false
  }, {
    id: 'RHSUB',
    name: '基质湿度',
    unit: '%',
    wmax: 95,
    wmin: 80,
    max: 100,
    min: 0,
    desc: '',
    manual: false
  }, {
    id: 'TDS',
    name: '总溶解性固体',
    unit: 'ppm',
    wmax: 500,
    wmin: 0,
    max: 1000,
    min: 0,
    desc: '',
    manual: false,
  }, {
    id: 'ORP',
    name: '氧化还原电位',
    unit: 'mV',
    wmax: 2000,
    wmin: -2000,
    max: 2000,
    min: -2000,
    desc: '',
    manual: false
  }, {
    id: 'LEVEL',
    name: '种植槽水位线',
    unit: 'cm',
    wmax: 1,
    wmin: 0,
    max: 1,
    min: 0,
    desc: '',
    manual: false
  }, {
    id: 'V',
    name: '蓄水池水位线',
    unit: 'cm',
    wmax: 100,
    wmin: 0,
    max: 10e6,
    min: 0,
    desc: '',
    manual: false
  }]
}
config.MqttConfig = Object.assign(config.MqttConfig, {
  mqttDataAnalysisApi: config.server_url + '/api/mqttDataAnalysis',
  seperator: '/'
})
module.exports = config
