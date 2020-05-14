const express = require('express')
const Device = require('../../../controller/device')
const Permission = require('../../../controller/permission')
const deviceRouter = express.Router()

deviceRouter
  .post('/addADevice', Permission.permissionCheck, Device.addADevice)
  .post('/bindDevice', Permission.permissionCheck, Device.bindDevice)
  .post('/unbindDevice', Permission.permissionCheck, Device.unbindDevice)
  .post('/removeDevice', Permission.permissionCheck, Device.removeDevice)
  .post('/getDeviceData', Permission.permissionCheck, Device.getDeviceData)
  .post('/updateIndexDefine', Permission.permissionCheck, Device.updateIndexDefine)
  .post('/issue', Permission.permissionCheck, Device.updateWarningIssue)
  .post('/changeRunState', Permission.permissionCheck, Device.changeRunState)
  .post('/becomeManager', Permission.permissionCheck, Device.becomeManager)
  .get('/fetchOwnedDevice', Permission.permissionCheck, Device.fetchOwnedDevice)
  .get('/fetchDeviceInfo', Permission.permissionCheck, Device.fetchDeviceInfo)
  .get('/getIndexDefine', Permission.permissionCheck, Device.getIndexDefine)
  .get('/getDefaultIndexDefine', Permission.permissionCheck, Device.getDefaultIndexDefine)
  .get('/latestData', Permission.permissionCheck, Device.getLatestData)
  .get('/latestManualData', Permission.permissionCheck, Device.getLatestManualData)

module.exports = deviceRouter