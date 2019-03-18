const express = require('express')
//API请求路由
const apiRouter = require('./api')
const pageRouter = require('./page')

const router = express.Router()

router
  .use('/api', apiRouter)
  .use(pageRouter)

module.exports = router