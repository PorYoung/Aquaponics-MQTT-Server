const mqtt = require('mqtt')
const config = {
  serverUrl: 'mqtt://localhost',
  mqttOptions: {
    username: '5c8f452ed265ad3158df3f4c',
    password: '123456',
    clean: false
  },
  seperator: '#'
}
config.generateTopic = (n) => {
  switch (n) {
    case 1:
      n = 'data'
      break
    case 2:
      n = 'instruction'
      break
  }
  return 'device' + this.seperator + this.mqttOptions.username + this.seperator + n
}
const client = mqtt.connect(config.serverUrl, config.mqttOptions)

client.on('connect', () => {
  client.subscribe('test', (err) => {
    if (!err) {
      client.publish('test', 'Hello mqtt! I\'m' + config.mqttOptions.username)
    }
  })
  client.subscribe(config.generateTopic(2), (err) => {
    if (!err) {
      console.log('has subscribe ', config.generateTopic(2))
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  // client.end()
})
const indexData={
  
}
setInterval(()=>{
  client.publish(config.generateTopic(1),)
})