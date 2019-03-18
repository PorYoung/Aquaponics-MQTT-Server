const express = require('express')
const Device = require('../../../controller/device')
const Permission = require('../../../controller/permission')
const deviceRouter = express.Router()

deviceRouter
  .post('/addADevice', Permission.permissionCheck, Device.addADevice)
  .post('/bindDevice', Permission.permissionCheck, Device.bindDevice)
  .get('/fetchOwnedDevice', Permission.permissionCheck, Device.fetchOwnedDevice)
  .get('/fetchDeviceInfo', Permission.permissionCheck, Device.fetchDeviceInfo)


module.exports = deviceRouter