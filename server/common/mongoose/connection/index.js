const mongoose = require('../config')
const config = require(`${process.cwd()}/config`)

const options = config.mongo

const uri = `mongodb://${options.host}:${options.port}/${options.database}`
mongoose.connect(uri, config.mongoose)
const dbConnection = mongoose.connection

dbConnection.on('error', console.error.bind(console, 'connection error:'))
dbConnection.once('open', function () {
  console.log('数据库链接成功')
})

module.exports = dbConnection