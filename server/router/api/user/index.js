const express = require('express')
const User = require('../../../controller/user')
const Permission = require('../../../controller/permission')

const userRouter = express.Router()

userRouter
  .get('/permissionCheck', Permission.permissionCheck, async (req, res) => {
    res.send({
      errMsg: 1
    })
  })
  .post('/wechatSPLogin', User.wechatSPLogin)

module.exports = userRouter