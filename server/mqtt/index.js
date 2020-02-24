const md5 = require('md5')
const authenticate = require('./authenticate')
const MqttConfig = Object.assign(require('../../config').MqttConfig, {
  deviceList: [],
})
MqttConfig.warningTopic = (deviceId) => {
  return 'device' + MqttConfig.seperator + deviceId + MqttConfig.seperator + 'warning'
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
      let serverDate = new Date()
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
              // console.log('Info: ', packet)
              break
            }
          case 'test':
            {
              // console.log('test: ', packet)
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
            device: db.ObjectId(deviceId),
            expired: false
          }).lean()
          if (defineQuery && defineQuery.define) {
            let define = defineQuery.define
            let flag = false
            Object.keys(define).forEach((key) => {
              let {
                min,
                max,
                fMin,
                fMax
              } = define[key]
              let stat = 0
              if (data.hasOwnProperty(key)) {
                let val = data[key]
                if (val <= min) {
                  stat = -2
                  flag = true
                } else if (val >= max) {
                  stat = 2
                  flag = true
                } else if (val > fMax) {
                  stat = 1
                } else if (val < fMin) {
                  stat = -1
                }
              }
              data[key] = Object.assign({
                min,
                max,
                fMin,
                fMax,
                stat,
                val: Number(data[key]) || 0
              })
            })
            if (flag) {
              let dataQuery = await db.data.create({
                data: data,
                device: db.ObjectId(deviceId),
                date: data.date || serverDate,
                warning: true
              })
              let qtt = {
                topic: MqttConfig.warningTopic(deviceId),
                payload: JSON.stringify(dataQuery.toObject()),
                qos: 1,
                retain: true
              }
              MqttServer.publish(qtt)
            } else {
              await db.data.create({
                data: data,
                device: db.ObjectId(deviceId),
                date: data.date || serverDate
              })
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
          let instruction = packet.payload.toString()
          let device = await db.define.findOne({
            device: db.ObjectId(deviceId)
          })
          if (instruction == '0') {
            //启动设备
            await db.define.findOneAndUpdate({
              device: db.ObjectId(deviceId)
            }, {
              $set: {
                runStatus: {
                  power: true,
                  stopUploadAllData: false
                }
              }
            })
          } else if (instruction == '|1|' && device && device.power) {
            await db.define.findOneAndUpdate({
              device: db.ObjectId(deviceId)
            }, {
              $set: {
                runStatus: {
                  stopUploadAllData: true
                }
              }
            })
          } else if (instruction == '|2|' && device && device.power) {
            await db.define.findOneAndUpdate({
              device: db.ObjectId(deviceId)
            }, {
              $set: {
                runStatus: {
                  stopUploadAllData: false
                }
              }
            })
          }
          await db.instruction.create({
            device: deviceId,
            instruction: instruction,
            date: serverDate
          })
        }
      }
    })
  }
}