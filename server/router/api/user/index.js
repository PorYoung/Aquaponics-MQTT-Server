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
  .post('/wechatSPBind', User.wechatSPBind)
  .get('/getUserList', Permission.permissionCheck, User.getUserListCategorized)
  .post('/updateUserEnable', Permission.permissionCheck, User.updateUserEnable)
  .post('permissionApply', Permission.permissionCheck, User.permissionApply)
  .get('permissionApply', Permission.permissionCheck, User.permissionApplyRefuse)

module.exports = userRouter