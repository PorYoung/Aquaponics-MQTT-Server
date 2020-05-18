const formidable = require('formidable')
const md5 = require('md5')
const path = require('path')
const fs = require('fs')
const config = require(`${process.cwd()}/config`)
module.exports = {
  /* Device management */
  addADevice: async (req, res) => {
    let form = new formidable.IncomingForm()
    let fields = {}
    let filePath = null
    let fileUrlPath = null
    let date = new Date()

    form.uploadDir = path.join(process.cwd(), '/static/temp')
    form.maxFileSize = 2 * 1024 * 1024
    form.parse(req)
    form.on('field', (name, value) => {
      fields[name] = value
    })
    form.on('fileBegin', (name, file) => {
      let type = file.type.split('/')[1].toLowerCase()
      let filename = md5(file.name.concat(date.getTime())).concat('.').concat(type)
      file.name = filename
      fileUrlPath = path.join('/static/image/device/', filename)
      filePath = path.join(process.cwd(), fileUrlPath)
      file.path = filePath
    })
    form.on('end', async () => {
      let {
        password,
        description,
        tag,
        name,
        user_id,
        define
      } = fields
      let device = await db.device.create({
        password: password,
        name: name,
        tag: tag,
        description: description,
        creater: user_id,
        users: [user_id],
        avatarUrl: fileUrlPath,
        date: date,
        runState: {
          stopUploadAllData: false,
          collectInterval: 5
        },
      })
      if (!device) {
        stat = fs.statSync(filePath)
        if (stat) {
          fs.unlinkSync(filePath)
        }
        return res.send({
          errMsg: -1,
          desc: 'Fail to add'
        })
      }
      define = JSON.parse(define)
      if (define._id) {
        await db.dfdefine.updataOne({
          _id: db.ObjectId(define._id)
        }, {
          $inc: { 'refCount': 1 }
        })
      }
      let defineData = await db.define.create({
        define: define.define,
        refDefine: define._id || null,
        whoSet: user_id,
        date: date,
        device: device._id
      })
      return res.send({
        errMsg: 1,
        _id: device._id.toString()
      })
    })
    form.on('error', (err) => {
      console.error(err)
      return res.send({
        errMsg: -1,
        desc: 'Server Error!'
      })
    })
  },
  fetchOwnedDevice: async (req, res) => {
    let {
      page,
      query_id,
      order,
      sortBy
    } = req.query
    page = Number.parseInt(page)
    let user = req.session.user
    let devices = null
    switch (user.level) {
      case 3:
        {
          if (page = -1) {
            devices = await db.device.find({
              users: db.ObjectId(user._id)
            }).sort({
              date: -1
            }).lean()
            break
          }
          devices = await db.findByPagination(db.device, {
            users: db.ObjectId(user._id)
          }, 8, page)
          break
        }
      case 2:
      case 1:
        {
          if (page = -1) {
            devices = await db.device.find({}).sort({
              date: -1
            }).lean()
            break
          }
          devices = await db.findByPagination(db.device, {}, 8, page)
          break
        }
    }
    return res.send({
      errMsg: 1,
      devices: devices
    })
  },
  bindDevice: async (req, res) => {
    let {
      deviceId,
      password,
      user_id
    } = req.body
    let device = await db.device.findOne({
      _id: db.ObjectId(deviceId)
    }).lean()
    if (device && device.password == password) {
      device = await db.device.findOneAndUpdate({
        _id: db.ObjectId(deviceId)
      }, {
        $addToSet: { users: db.ObjectId(user_id) }
      }, {
        new: 1
      }).lean()
      return res.send({
        errMsg: 1,
        device: device
      })
    }
    return res.send({
      errMsg: -2,
      desc: '设备不存在或密码错误'
    })
  },
  unbindDevice: async (req, res) => {
    let {
      deviceId,
      user_id
    } = req.body
    let device = await db.device.findOne({
      _id: db.ObjectId(deviceId)
    }).lean()
    if (device) {
      device = await db.device.findOneAndUpdate({
        _id: db.ObjectId(deviceId)
      }, {
        $pull: {
          users: db.ObjectId(user_id)
        }
      }, {
        new: 1
      }).lean()
      return res.send({
        errMsg: 1,
        device: device
      })
    }
    return res.send({
      errMsg: -2,
      desc: '设备不存在或密码错误'
    })
  },
  removeDevice: async (req, res) => {
    let {
      deviceId
    } = req.body
    if (req.session.user.level < 1) {
      return res.send({
        errMsg: -1,
        desc: 'Permission Denied. Remove Fail.'
      })
    }
    let device = await db.device.deleteOne({
      _id: db.ObjectId(deviceId)
    })
    let define = await db.define.deleteOne({
      device: db.ObjectId(deviceId)
    })
    if (device.ok) {
      return res.send({
        errMsg: 1
      })
    }
    return res.send({
      errMsg: -1,
      desc: 'Remove Fail.'
    })
  },
  fetchDeviceInfo: async (req, res) => {
    let {
      deviceId,
      detail
    } = req.query
    if (deviceId != null) {
      let device = await db.device.findOne({
        _id: db.ObjectId(deviceId)
      }).populate('creater', '_id nickName avatarUrl level').populate('users', '_id nickName avatarUrl level').lean()
      if (device) {
        return res.send({
          errMsg: 1,
          device: device
        })
      }
    }
    return res.send({
      errMsg: -1,
      desc: 'deviceId is null or cannot find the device'
    })
  },
  /* Device Index Define */
  getDefaultIndexDefine: async (req, res) => {
    let { _id } = req.query
    if (_id != null) {
      let define = await db.dfdefine.findOne({ _id: db.ObjectId(_id) }).lean()
      if (define) {
        return res.send({
          errMsg: 1,
          data: define
        })
      } else {
        return res.send({
          errMsg: -1,
          desc: 'Cannot find defination.'
        })
      }
    }
    return res.send({
      errMsg: 1,
      data: {
        define: config.defaultDefine
      }
    })
  },
  getIndexDefine: async (req, res) => {
    let {
      deviceId,
      indexId
    } = req.query
    if (indexId) {
      let defineData = await db.define.findOne({
        device: db.ObjectId(deviceId),
        'define.id': indexId,
        expired: false
      }, { 'define.$': 1, date: 1, whoSet: 1 }).populate('whoSet', '_id nickName avatarUrl level').lean()
      if (defineData && defineData.define) {
        return res.send({
          errMsg: 1,
          data: {
            define: defineData.define,
            date: defineData.date,
            whoSet: defineData.whoSet
          }
        })
      }
    } else {
      let defineData = await db.define.findOne({
        device: db.ObjectId(deviceId),
        expired: false
      }).populate('whoSet', '_id nickName avatarUrl level').lean()
      if (defineData && defineData.define) {
        return res.send({
          errMsg: 1,
          data: {
            define: defineData.define,
            date: defineData.date,
            whoSet: defineData.whoSet
          }
        })
      }
    }
    return res.send({
      errMsg: -1,
      desc: 'No such a device or define'
    })
  },
  updateIndexDefine: async (req, res) => {
    let {
      user_id,
      deviceId,
      indexId,
      define
    } = req.body
    let date = new Date()
    let defineData = await db.define.findOneAndUpdate({
      device: db.ObjectId(deviceId), expired: false
    }, {
      $set: {
        expired: true
      }
    }).lean()
    if (defineData && defineData.define) {
      defineData = defineData.define
    } else {
      defineData = {}
    }
    defineData[indexId] = Object.assign(defineData[indexId] || {}, define)
    let updateData = await db.define.create({
      device: deviceId,
      define: defineData,
      whoSet: user_id,
      date: date
    })
    if (updateData) {
      return res.send({
        errMsg: 1,
        define: {
          define: updateData.define[indexId],
          date: date
        }
      })
    }
    return res.send({
      errMsg: -1,
      desc: 'Update Failed.'
    })
  },
  /* Device Data */
  getDeviceData: async (req, res) => {
    let {
      deviceId,
      start,
      stop,
      count,
      page,
      warning
    } = req.body
    let level = req.session.user.level
    let user_id = req.session.user._id
    let device = null
    if (level == 1 || level == 2) {
      device = await db.device.findOne({
        _id: db.ObjectId(deviceId)
      }).lean()
    } else {
      device = await db.device.findOne({
        _id: db.ObjectId(deviceId),
        users: user_id
      }).lean()
    }
    if (device) {
      let data = null
      page = parseInt(page)
      count = parseInt(count)
      let total = count
      if (page === -1) {
        if (start) {
          let qs = {
            device: db.ObjectId(deviceId),
            date: {
              '$gte': start,
              '$lt': stop
            }
          }
          !!warning && (qs['warning'] = true)
          data = await db.data.find(qs).sort({
            date: -1
          }).limit(count).populate('issue', '_id note date user').lean()
        } else {
          // get all data
          let qs = {
            device: db.ObjectId(deviceId)
          }
          !!warning && (qs['warning'] = true)
          data = await db.data.find(qs).sort({
            date: -1
          }).populate('issue', '_id note date user').lean()
        }
      } else {
        let qs = { device: db.ObjectId(deviceId) }
        !!warning && (qs['warning'] = true)
        if (start) {
          if (page == 0) {
            total = await db.data.countDocuments(qs)
          }
          count = count || config.pagination
          qs.date = {
            '$gte': start,
            '$lt': stop
          }
          data = await db.data.find(qs).sort({
            date: -1
          }).skip(page * count).limit(count).populate('issue', '_id note date user').lean()
        } else {
          if (page == 0) {
            total = await db.data.countDocuments(qs)
          }
          data = await db.data.find(qs).sort({
            date: -1
          }).skip(page * count).limit(count).populate('issue', '_id note date user').lean()
        }
      }
      return res.send({
        errMsg: 1,
        data: data,
        total: total
      })
    }
    return res.send({
      errMsg: -1,
      desc: 'device not exist.'
    })
  },
  getLatestData: async (req, res) => {
    let { deviceId } = req.query
    const asyncRedisClient = asyncRedisClientConnect()
    let dataID = await asyncRedisClient.hget('latestDataID', deviceId)
    if (!deviceId) {
      return res.send({
        errMsg: -1,
        desc: 'have no this data'
      })
    }
    let query
    if (!dataID) {
      query = await db.data.find({ device: deviceId }).sort({ date: -1 }).limit(1).lean()
      query = query[0]
      if (query) {
        asyncRedisClient.hset('latestDataID', deviceId, query._id.toString())
      }
    } else {
      query = await db.data.findOne({ _id: dataID }).lean()
    }
    asyncRedisClient.quit()
    return res.send({
      errMsg: 1,
      data: query
    })
  },
  getLatestManualData: async (req, res) => {
    let { deviceId } = req.query
    const asyncRedisClient = asyncRedisClientConnect()
    let dataID = await asyncRedisClient.hget('latestManualDataID', deviceId)
    if (!deviceId) {
      return res.send({
        errMsg: -1,
        desc: 'have no this data'
      })
    }
    let query
    if (!dataID) {
      query = await db.data.find({ device: deviceId, manualData: { $exists: true } }).sort({ date: -1 }).limit(1).lean()
      query = query[0]
      if (query) {
        asyncRedisClient.hset('latestManualDataID', deviceId, query._id.toString())
      }
    } else {
      query = await db.data.findOne({ _id: dataID }).lean()
    }
    asyncRedisClient.quit()
    return res.send({
      errMsg: 1,
      data: query
    })

  },
  updateWarningIssue: async (req, res) => {
    let { user_id, warningId, issueId, note } = req.body
    let result = null
    if (!!issueId) {
      result = await db.issue.findOneAndUpdate({ _id: issueId }, {
        $set: {
          note: note,
          user: user_id,
          date: new Date()
        }
      })
    } else {
      result = await db.issue.create({
        user: user_id,
        data: warningId,
        note: note,
        date: new Date()
      })
      await db.data.findOneAndUpdate({ _id: warningId }, {
        $set: {
          issue: result._id
        }
      })
    }
    if (result) {
      return res.send({
        errMsg: 1
      })
    } else {
      return res.send({
        errMsg: -1,
        desc: 'have no result'
      })
    }
  },
  changeRunState: async (req, res) => {
    let {
      deviceId,
      code
    } = req.body
    let device
    if (code == 1) {
      let stopUploadAllData = req.body.stopUploadAllData
      device = await db.device.findOneAndUpdate({
        _id: db.ObjectId(deviceId)
      }, {
        $set: {
          'runState.stopUploadAllData': stopUploadAllData
        }
      })
    } else if (code == 2) {
      let collectInterval = req.body.collectInterval
      device = await db.device.findOneAndUpdate({
        _id: db.ObjectId(deviceId)
      }, {
        $set: {
          'runState.collectInterval': collectInterval
        }
      })
    }
    if (device) {
      return res.send({
        errMsg: 1
      })
    }
    return res.send({
      errMsg: -1
    })
  },
  becomeManager: async (req, res) => {
    let {
      user_id,
      password
    } = req.body
    if (password == 'PorYoung') {
      let user = await db.user.findOneAndUpdate({
        _id: db.ObjectId(user_id)
      }, {
        $set: {
          level: 1
        }
      })
      if (user) {
        return res.send({
          errMsg: 1
        })
      }
    }
    return res.send({
      errMsg: -1
    })
  }
}