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
      // public message
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
      }
      // device message
      else if (t.length == 3 && t[0] == 'device') {
        if (t[2] == 'data') {
          // Check the received data if should publish a warning message
          let deviceId = t[1]
          let data = null
          try {
            data = JSON.parse(packet.payload.toString())
          } catch (e) {
            return console.warn(e)
          }
          let defineQuery = await db.define.findOne({
            device: db.ObjectId(deviceId),
            expired: false
          }).lean()
          if (defineQuery && defineQuery.define) {
            let define = defineQuery.define
            let flag = false
            let isManualData = !!data.isManualData
            let currentData = {}
            let manualData = {}
            define.forEach(item => {
              let {
                min,
                max,
                wmax,
                wmin,
                id
              } = item
              let stat = 0
              if (data.hasOwnProperty(id)) {
                let val = data[id]
                if (val <= min || val >= max) {
                  stat = -2
                  flag = true
                } else if (val > wmax || val < wmin) {
                  stat = -1
                  flag = true
                }
              } else {
                stat = -3
              }
              if (!item.manual) {
                currentData[id] = {
                  stat,
                  val: Number(data[id]) || 0
                }
              } else {
                manualData[id] = {
                  stat,
                  val: Number(data[id]) || 0
                }
              }
            })
            let dataQuery
            const asyncRedisClient = asyncRedisClientConnect()
            if (isManualData) {
              let refDataID = await asyncRedisClient.hget('latestDataID', deviceId)
              dataQuery = await db.data.findOneAndUpdate({ _id: refDataID }, {
                $set: {
                  manualData: manualData,
                  device: db.ObjectId(deviceId),
                  date: data.date || serverDate,
                  useDefine: defineQuery._id,
                  warning: flag,
                  updateBy: data.updateBy,
                }
              }, {
                new: 1,
                upsert: 1
              })
              await asyncRedisClient.hset('latestManualDataID', deviceId, refDataID)
            } else {
              dataQuery = await db.data.create({
                data: currentData,
                device: db.ObjectId(deviceId),
                date: data.date || serverDate,
                useDefine: defineQuery._id,
                warning: flag
              })
              // set the latest data id to redis
              await asyncRedisClient.hset('latestDataID', deviceId, dataQuery._id.toString())
            }
            if (flag) {
              let qtt = {
                topic: MqttConfig.warningTopic(deviceId),
                payload: JSON.stringify(dataQuery.toObject()),
                qos: 1,
                retain: true
              }
              MqttServer.publish(qtt)
            }
            asyncRedisClient.quit()
          }
        }
        // instruction message
        else if (t.length == 3 && t[2] == 'instruction') {
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