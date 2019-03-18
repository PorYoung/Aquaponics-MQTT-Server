const express = require('express')
const User = require('./user')
const Device = require('./device')
const apiRouter = express.Router()

apiRouter
  .use(User)
  .use(Device)

module.exports = apiRouter