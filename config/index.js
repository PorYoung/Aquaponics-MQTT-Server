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
    enable: false,
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
    desc: `定义：PHH20，为酸碱值，指水溶液中氢离子的活度。
    背景知识：
    （1）淡水养殖：6.5-9.0；海水养殖：7.5-8.5；
    （2）PH值超过8.5，水中氨的毒性增大，硫化氢毒性减小。PH值低于6，水产的氨无毒性，但硫化氢毒性增大。鱼虾在PH低于6.5时易缺氧浮头。PH值超过9.5、低于5时，大多数水产动物不能存活。
    （3）解决方案：可使用合适的缓冲剂控制正常PH值；如高于9.0，应采取降酸措施，如加入适量醋酸等；如低于6，应采取增高措施，加入生石灰或水必净。`,
    manual: false
  }, {
    id: 'TH2O',
    name: '水温',
    unit: '℃',
    wmax: 30,
    wmin: 15,
    max: 100,
    min: 0,
    desc: `定义：TH2O，指养殖水体的温度。
    背景知识：硝化细菌的最适水温为20～35℃，10℃以下时绝大部分细菌进入休眠期。`,
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
    manual: false,
    desc: `定义：LIGHT,又称照度，用于指示光照的强弱,光照强度对生物的光合作用影响很大，指单位面积上所接受可见光的光通量。
    背景知识
    （1）、常见范围：
    晚上： 0.001-0.02
    月夜： 0.02-0.3
    多云室内： 5-50
    多云室外： 50-500
    晴天室内： 100-1000
    夏天中午光照下： 大约10^6能量
    （2）①阳生植物：需光下限是全日照的1/5～1/10，在荫蔽和弱光条件下生长发育不良。在水分、温度等生态因子适合的情况下，不存在光照过度的问题，
    ②耐阴植物：耐阴植物在全日照下生长最好，但也能忍耐适度的荫蔽，所需最小光量为全日照的1/10～1/50
    ③阴性植物：需光量可低于全日照的1/50，呼吸和蒸腾作用均较弱。
    `
  }, {
    id: 'TAIR',
    name: '空气温度',
    unit: '℃',
    wmax: 26,
    wmin: 12,
    max: -50,
    min: 50,
    desc: `定义：气温，为区别于水温，在小程序中将单位自定义表示为℃`,
    manual: false
  }, {
    id: 'RHAIR',
    name: '空气湿度',
    unit: '%',
    wmax: 80,
    wmin: 60,
    max: 100,
    min: 0,
    desc: `定义：RHAIR，空气湿度，用于表示空气中水汽含量和湿润程度。`,
    manual: false
  }, {
    id: 'RHSUB',
    name: '基质湿度',
    unit: '%',
    wmax: 95,
    wmin: 80,
    max: 100,
    min: 0,
    desc: `定义：RHSUB，当土壤缺水时，传感器输出值将减小，反之将增大。
    背景知识:
    （1）常见范围：
    0 ~300 : 干燥基质
    300~700 : 湿润基质
    700~950 : 放到水中
    （2）该传感器以典型电压值为标准（测试平台：10位AD，基准电压5V），不同于传统基质含水率——含水量占其干重的百分数。
    `,
    manual: false
  }, {
    id: 'TDS',
    name: '总溶解性固体',
    unit: 'ppm',
    wmax: 500,
    wmin: 0,
    max: 1000,
    min: 0,
    desc: `定义：TDS，又称溶解性固体总量，它表明1升水中溶有多少毫克溶解性固体。
    背景知识：
    （1）通常情况下，TDS值为电导率值的一半，即：TDS = EC / 2.
    （2）通常情况下，EC＞1600ms/cm时，鱼类开始出现高渗环境下的不适。无土栽培领域，瓜果类蔬菜对EC值的需求较高。故水中最适EC/TDS值是针对鱼类而言的。
    （3）TDS值越高，表示水中含有的溶解物越多。中国生活饮用水标准：
    ①饮用水≤1000us（500ppm）
    ②纯净水≤100us（50ppm）
    ③蒸馏水、纯酒精电导率=0
    `,
    manual: false,
  }, {
    id: 'ORP',
    name: '氧化还原电位',
    unit: 'mV',
    wmax: 2000,
    wmin: -2000,
    max: 2000,
    min: -2000,
    desc: `定义：ORP，溶液的氧化还原电位，表征介质氧化性或还原性的综合性指标，ORP与微生物生长密切相关。
    背景知识：硝化细菌属于好氧细菌，为鱼植系统的关键性细菌。
    （1）好氧微生物适宜生长范围：+100mV以上，最适为+300mV~+400mV
    ①自然界中的ORP上下限：上限为+820mV，富氧而无氧利用系统的环境；下限为-400mV，充满氢的环境。
    ②兼性厌氧微生物适宜生长+100mV以上时进行好氧呼吸，+100mV以下时进行无氧呼吸。
    ③专性厌氧细菌200mV~-250mV，其中专性厌氧的产甲烷菌要求为-300~400mV。
    （3）ORP 测试可以发现高有机气体含量的区块。溶解有机气体压力高会导致鱼类患致命的气泡病（栓塞）。解决方案：清除发生有机气体的垃圾，开增氧机或使用增氧药物以氧化池水。
    `,
    manual: false
  }, {
    id: 'LEVEL',
    name: '种植槽水位线',
    unit: 'cm',
    wmax: 1,
    wmin: 0,
    max: 1,
    min: 0,
    desc: `定义：养殖容器中的水深。
    背景知识：
    在换水或者容器发生漏水时，及时获悉水池水位线尤为重要，用户需据实际情况设定预警、最适范围。
    `,
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
  }],
  pagination: 8
}
config.MqttConfig = Object.assign(config.MqttConfig, {
  mqttDataAnalysisApi: config.server_url + '/api/mqttDataAnalysis',
  seperator: '/'
})
module.exports = config
