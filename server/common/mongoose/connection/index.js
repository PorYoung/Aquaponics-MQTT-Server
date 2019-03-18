const mongoose = require('../config')

const options = {
  //user: 'admin',
  //pwd: '123456',
  host: 'localhost',
  port: '27017',
  database: 'fishv'
  //authSource: 'admin',
}

// const uri = `mongodb://${options.user}:${options.pwd}@${options.host}:${options.port}/${options.database}?authSource=${options.authSource}`
const uri = `mongodb://${options.host}:${options.port}/${options.database}`
mongoose.connect(uri, {
  useNewUrlParser: true
})
mongoose.set('useCreateIndex', true)
const dbConnection = mongoose.connection

dbConnection.on('error', console.error.bind(console, 'connection error:'))
dbConnection.once('open', function () {
  console.log('数据库链接成功')
})

module.exports = dbConnection