const md5 = require('md5')
const config = require('../../config').MqttConfig
module.exports = {
  //连接认证
  authenticate: async (client, username, password, callback) => {
    let flag = false
    if (username) {
      let u = username.split('#')
      if (u[0] == 'user') {
        //用户端认证
        let user = await db.user.findOne({
          _id: db.ObjectId(u[1])
        }).lean()
        flag = user && password == md5(user.openid)
        if (flag) {
          client.user = username
        }
      } else if (u[0] == 'device') {
        //设备端认证
        let device = await db.device.findOne({
          _id: db.ObjectId(u[1])
        }).lean()
        flag = device && password == device.password
        if (flag) {
          client.user = username
        }
      }
    }
    callback(null, flag)
  },
  //发布校验
  authenticatePublish: async (client, topic, payload, callback) => {
    // 授权用户可以发布 device#(device id)#instruction 主题
    let flag = false
    let t = topic.split('#')
    if (t[0] == 'public') {
      if (t[1] == 'test') {
        flag = true
      }
    } else {
      let usp = client.user.split('#')
      let uMark = usp[0]
      let userId = usp[1]
      if (uMark == 'user') {
        let tMark = t[0]
        let deviceId = t[1]
        let operation = t[2]
        if (tMark == 'device') {
          let queryDate = await db.device.findOne({
            _id: db.ObjectId(deviceId),
            user: db.ObjectId(userId)
          }).lean()
          if (queryDate) {
            if (config.userPubAuth.includes(operation))
              flag = true
          }
        }
      } else if (uMark == 'device') {
        let tMark = t[0]
        let deviceId = t[1]
        let operation = t[2]
        if (tMark == 'device') {
          if (deviceId == userId) {
            if (config.devicePubAuth.includes(operation)) {
              flag = true
            }
          }
        }
      }
    }
    callback(null, flag)
  },
  //订阅校验
  authenticateSubscribe: async (client, topic, callback) => {
    // 授权用户可以订阅 device#(device id)#data|warning 主题
    let flag = false
    let t = topic.split('#')
    if (t[0] == 'public') {
      if (config.publicAuth.includes(t[1])) {
        flag = true
      }
    } else {
      let usp = client.user.split('#')
      let uMark = usp[0]
      let userId = usp[1]
      if (uMark == 'user') {
        let tMark = t[0]
        let deviceId = t[1]
        let operation = t[2]
        if (tMark == 'device') {
          let queryDate = await db.device.findOne({
            _id: db.ObjectId(deviceId),
            user: db.ObjectId(userId)
          }).lean()
          if (queryDate) {
            if (config.userSubAuth.includes(operation))
              flag = true
          }
        }
      } else if (uMark == 'device') {
        let tMark = t[0]
        let deviceId = t[1]
        let operation = t[2]
        if (tMark == 'device') {
          if (deviceId == userId) {
            if (config.deviceSubAuth.includes(operation)) {
              flag = true
            }
          }
        }
      }
    }
    callback(null, flag)
  }
}