const md5 = require('md5')
const authenticate = require('./authenticate')
const MqttConfig = Object.assign(require('../../config').MqttConfig, {
  deviceList: []
})
MqttConfig.warningTopic = (deviceId) => {
  return 'device' + this.seperator + deviceId + this.seperator + 'warning'
}
// const request = require('superagent')
module.exports = {
  MqttServerCreate: async (MqttServer) => {
    MqttServer.on('clientConnected', (client) => {
      console.log('client connected:', client.id)
    })
    MqttServer.on('clientDisconnected', (client) => {
      console.log('client disconnected', client.id)
    })
    MqttServer.on('subscribed', async (topic, client) => {
      let qtt = {
        topic: 'public' + MqttConfig.seperator + 'info',
        payload: client.user + ' has subscribed topic: ' + topic
      }
      MqttServer.publish(qtt)
    })
    MqttServer.on('unSubscribed', (topic, client) => { //取消订阅
      let qtt = {
        topic: 'public' + MqttConfig.seperator + 'info',
        payload: client.user + ' has unsubscribed topic: ' + topic
      }
      MqttServer.publish(qtt)
    })
    MqttServer.on('ready', async () => {
      console.log('Mqtt Server is running...')
      MqttServer.authenticate = authenticate.authenticate
      MqttServer.authorizeSubscribe = authenticate.authorizeSubscribe
      MqttServer.authorizePublish = authenticate.authorizePublish
    })

    /**
     * 监听Mqtt主题消息
     */

    MqttServer.on('published', async (packet, client) => {
      let topic = packet.topic
      //Define message(String or Object)
      let qtt = {
        topic: 'other',
        payload: 'This is server'
      }
      let t = topic.split(MqttConfig.seperator)
      if (t.length == 2 && t[0] == 'public') {
        switch (t[1]) {
          case 'info':
            {
              console.log('Info: ', packet)
              break
            }
          case 'test':
            {
              console.log('test: ', packet)
              break
            }
        }
      } else if (t.length == 3 && t[0] == 'device') {
        if (t[2] == 'data') {
          // 方案1：向http服务器发送数据检查请求，payload默认json字符串
          // 方案2：直接处理
          let deviceId = t[1]
          let data = null
          try {
            data = JSON.parse(packet.payload.toString())
          } catch (e) {
            return console.warn(e)
          }
          // 方案2
          let defineQuery = await db.define.findOne({
            device: db.ObjectId(deviceId)
          }).lean()
          if (defineQuery && defineQuery.define) {
            let define = defineQuery.define
            let warning = {}
            let flag = false
            if (data.hasOwnProperty('date')) {
              warning.date = data.date
            }
            Object.keys(define).forEach((key) => {
              let {
                min,
                max,
                fMin,
                fMax
              } = define
              if (data.hasOwnProperty(key)) {
                if (data[key].val <= min) {
                  warning[key] = {
                    val: data[key],
                    stat: -1
                  }
                  flag = true
                } else if (data[key].val >= max) {
                  warning[key] = {
                    val: data[key],
                    stat: -1
                  }
                  flag = true
                }
              }
              data[key] = Object.assign(data[key], {
                min,
                max,
                fMin,
                fMax
              })
            })
            if (flag) {
              let warningQuery = await db.warning.create({
                device: db.ObjectId(deviceId),
                data: warning,
                date: new Date()
              })
              let qtt = {
                topic: MqttConfig.warningTopic(deviceId),
                payload: JSON.stringify(warningQuery.toObject()),
                qos: 1,
                retain: true
              }
              MqttServer.publish(qtt)
            }
          }
          /**
           * 方案1
          data.deviceId = deviceId
          let response = await request.post(MqttConfig.mqttDataAnalysisApi, data)
          let response = JSON.parse(response.text)
          if (response && response.warning) {
            let qtt = {
              topic: 'device' + MqttConfig.seperator + deviceId + MqttConfig.seperator + 'warning',
              payload: JSON.stringify(response)
            }
            MqttServer.publish(qtt)
          } */
        } else if (t.length == 3 && t[2] == 'instruction') {
          let deviceId = t[1]
          let instruction = null
          try {
            instruction = JSON.parse(packet.payload.toString())
          } catch (e) {
            return console.warn(e)
          }
          await db.instruction.create({
            device: deviceId,
            instruction: instruction,
            date: new Date()
          })
        }
      }
    })
  }
}