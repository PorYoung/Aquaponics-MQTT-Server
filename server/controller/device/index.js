const formidable = require('formidable')
const md5 = require('md5')
const path = require('path')
const fs = require('fs')
module.exports = {
  addADevice: async (req, res) => {
    let form = new formidable.IncomingForm()
    let fields = {}
    let filePath = null
    let fileUrlPath = null
    let date = new Date()

    form.uploadDir = path.join(process.cwd(), '/static/temp')
    form.maxFileSize = 1 * 1024 * 1024
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
        manager: user_id,
        avatarUrl: fileUrlPath,
        date: date
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
      let defineData = await db.define.create({
        define: define,
        whoSet: user_id,
        date: date,
        device: device._id.toString()
      })
      return res.send({
        errMsg: 1,
        _id: device._id.toString()
      })
    })
    form.on('error', (err) => {
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
      case 0:
        {
          if (page = -1) {
            devices = await db.device.find({
              user: db.ObjectId(user._id)
            }, {
              sort: {
                date: -1
              }
            }).lean()
            break
          }
          devices = await db.findByPagination(db.device, {
            user: db.ObjectId(user._id)
          }, 8, page)
          break
        }
      case 1:
        {
          if (page = -1) {
            devices = await db.device.find({
              manager: db.ObjectId(user._id)
            }, {
              sort: {
                date: -1
              }
            }).lean()
            break
          }
          devices = await db.findByPagination(db.device, {
            manager: db.ObjectId(user._id)
          }, 8, page)
          break
        }
      case 2:
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
      user_id,
      tag,
      name
    } = req.body
    let device = await db.device.findOne({
      _id: db.ObjectId(deviceId)
    }).lean()
    if (device && device.password == password) {
      if (device.user && device.user.toString() == user_id) {
        return res.send({
          errMsg: -1,
          desc: 'Already Done'
        })
      } else if (!name) {
        device = await db.device.findOneAndUpdate({
          _id: db.ObjectId(deviceId)
        }, {
          $set: {
            user: db.ObjectId(user_id),
            date: new Date(),
            tag: tag
          }
        }, {
          new: 1
        }).lean()
      } else {
        device = await db.device.findOneAndUpdate({
          _id: db.ObjectId(deviceId)
        }, {
          $set: {
            user: db.ObjectId(user_id),
            date: new Date(),
            name: name,
            tag: tag
          }
        }, {
          new: 1
        }).lean()
      }
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
      password
    } = req.body
    let device = await db.device.findOne({
      _id: db.ObjectId(deviceId)
    }).lean()
    if (device && device.password == password) {
      device = await db.device.findOneAndUpdate({
        _id: db.ObjectId(deviceId)
      }, {
        $set: {
          user: null,
          date: new Date()
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
      }).populate('user', '_id nickName avatarUrl level').populate('manager', '_id nickName avatarUrl level').lean()
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

  getIndexDefine: async (req, res) => {
    let {
      deviceId,
      indexId
    } = req.query
    let defineData = await db.define.findOne({
      device: db.ObjectId(deviceId),
      expired: false
    }).populate('whoSet', '_id nickName avatarUrl level').lean()
    if (defineData && defineData.define) {
      if (indexId) {
        if (defineData.define[indexId]) {
          return res.send({
            errMsg: 1,
            define: {
              define: defineData.define[indexId],
              date: defineData.date,
              whoSet: defineData.whoSet
            }
          })
        }
      } else {
        return res.send({
          errMsg: 1,
          define: {
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
      device: db.ObjectId(deviceId)
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
  getDeviceData: async (req, res) => {
    let {
      deviceId,
      start,
      stop,
      count
    } = req.body
    let level = req.session.user.level
    let user_id = req.session.user._id
    let device = await db.device.findOne({
      _id: db.ObjectId(deviceId)
    }).lean()
    if (device) {
      if (level == 2 || (level == 1 && user_id == device.manager.toString()) || user_id == device.user.toString()) {
        let data = null
        count = parseInt(count)
        if (start) {
          start = new Date(start)
          if (count) {
            if (stop) {
              stop = new Date(stop)
              data = await db.data.find({
                device: db.ObjectId(deviceId),
                date: {
                  '$gte': start,
                  '$lt': stop
                }
              }).sort({
                date: -1
              }).limit(count).lean()
            } else {
              data = await db.data.find({
                device: db.ObjectId(deviceId),
                date: {
                  '$gte': start
                }
              }).sort({
                date: 1
              }).limit(count).lean()
            }
          } else {
            start = new Date(start)
            stop = new Date(stop)
            data = await db.data.find({
              device: db.ObjectId(deviceId),
              date: {
                '$gte': start,
                '$lt': stop
              }
            }).sort({
              date: 1
            }).lean()
          }
        } else if (count) {
          stop = new Date()
          data = await db.data.find({
            device: db.ObjectId(deviceId),
            date: {
              '$lt': stop
            }
          }).sort({
            date: -1
          }).limit(count).lean()
        } else {
          data = await db.data.find({
            device: db.ObjectId(deviceId)
          }).sort({
            date: 1
          }).lean()
        }
        return res.send({
          errMsg: 1,
          data: data
        })
      }
    }
    return res.send({
      errMsg: -1,
      desc: 'device not exist.'
    })
  }
}