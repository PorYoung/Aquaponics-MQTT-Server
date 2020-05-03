const config = require(`${process.cwd()}/config`)
const request = require('superagent')
const md5 = require('md5')
const { userListCategorize } = require('../../common/init')
module.exports = {
  wechatSPLogin: async (req, res) => {
    let {
      code,
      userInfo
    } = req.body
    if (code && userInfo) {
      //authenticate against wechat server
      let url = `${config.wechat_login_url}?appid=${config.wechat_AppID}&secret=${config.wechat_AppSecret}&js_code=${code}&grant_type=authorization_code`
      let response = await request.get(url)
      let info = response.text
      try {
        info = JSON.parse(info)
      } catch (e) {
        return res.send({
          errMsg: -2
        })
      }
      if (info.openid) {
        //query user infomation from databases
        let queryData = await db.user.findOne({
          openid: info.openid
        }).lean()
        if (!userInfo.nickName) {
          userInfo.nickName = '用户'.concat(md5(info.openid))
        }
        if (!userInfo.avatarUrl) {
          userInfo.avatarUrl = config.server_url.concat('/static/image/default_avatar.jpg')
        }
        if (!queryData) {
          //user does not exist and create a user record
          queryData = await db.user.create({
            openid: info.openid,
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl
          })
          //return first use flag to start using instruction in small program
          return res.send({
            errMsg: 2,
            _id: queryData._id.toString(),
            nickName: queryData.nickName,
            avatarUrl: queryData.avatarUrl,
            level: queryData.level,
            list: queryData.list
          })
        } else if (queryData.nickName != userInfo.nickName || queryData.avatarUrl != userInfo.avatarUrl) {
          queryData = await db.user.findOneAndUpdate({
            openid: info.openid
          }, {
            $set: {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl
            }
          }, {
            new: true
          })
        }
        // check user level
        if (queryData.level == 0) {
          return res.send({
            errMsg: -1,
            _id: queryData._id.toString()
          })
        }
        let signStr = md5(info.openid)
        let user = Object.assign({}, queryData, {
          signStr: signStr
        })
        user._id = queryData._id.toString()
        req.session.user = user
        return res.send({
          errMsg: 1,
          user: user
        })
      } else {
        return res.send({
          errMsg: -2
        })
      }
    } else {
      return res.send({
        errMsg: -3
      })
    }
  },
  wechatSPBind: async (req, res) => {
    let {
      _id,
      secret
    } = req.body
    if (_id && secret) {
      let queryData = await db.user.findOne({
        _id: db.ObjectId(_id)
      }).lean()
      if (!queryData) {
        return res.send({
          errMsg: -1
        })
      }
      if (secret == config.superManagerCode) {
        // Bind super manager account
        await db.user.findOneAndUpdate({
          _id: db.ObjectId(_id)
        }, {
          $set: {
            level: 1,
            userManageEnable: true,
            addDeviceEnable: true,
            deleteDeviceEnable: true
          }
        })
        return res.send({
          errMsg: 1
        })
      } else if (secret == config.managerCode) {
        // Bind manager account
        await db.user.findOneAndUpdate({
          _id: db.ObjectId(_id)
        }, {
          $set: {
            level: 2,
            userManageEnable: true,
            addDeviceEnable: true,
            deleteDeviceEnable: true
          }
        })
        return res.send({
          errMsg: 1
        })
      }
      return res.send({
        errMsg: -2
      })
    }
  },
  getUserList: async (req, res) => {

  },
  getUserListCategorized: async (req, res) => {
    let level = req.session.user.level
    if (level != 1 && level != 2) {
      return res.send({
        errMsg: -1
      })
    }
    await userListCategorize()
    const asyncRedisClient = asyncRedisClientConnect()
    let ul = {}
    for (let i = 0; i < 26; ++i) {
      let key = String.fromCharCode(65 + i)
      let ulraw = await asyncRedisClient.lrange(key, 0, -1)
      ul[key] = ulraw
    }
    asyncRedisClient.quit()
    return res.send({
      errMsg: 1,
      ul: ul
    })
  },
  updateUserEnable: async (req, res) => {
    let { _id, letter, index, level, userManageEnable, addDeviceEnable, deleteDeviceEnable } = req.body
    if (_id == null || letter == null || index == null) {
      return res.send({
        errMsg: -1,
        desc: 'does not have _id, letter or index'
      })
    }
    let user = null
    if (level != null) {
      if (!isNaN(level)) {
        if (level == 1 || level == 2) {
          user = await db.user.findOneAndUpdate({ _id: db.ObjectId(_id) }, {
            $set: {
              level: level,
              userManageEnable: true,
              addDeviceEnable: true,
              deleteDeviceEnable: true
            }
          }, {
            new: true
          })
        } else {
          user = await db.user.findOneAndUpdate({ _id: db.ObjectId(_id) }, {
            $set: { level: level }
          }, {
            new: true
          })
        }
      }
    }
    if (userManageEnable != null) {
      user = await db.user.findOneAndUpdate({ _id: db.ObjectId(_id) }, {
        $set: {
          userManageEnable: !!userManageEnable
        }
      }, {
        new: true
      })
    }
    if (addDeviceEnable != null) {
      user = await db.user.findOneAndUpdate({ _id: db.ObjectId(_id) }, {
        $set: {
          addDeviceEnable: !!addDeviceEnable
        }
      }, {
        new: true
      })
    }
    if (deleteDeviceEnable != null) {
      user = await db.user.findOneAndUpdate({ _id: db.ObjectId(_id) }, {
        $set: {
          deleteDeviceEnable: !!deleteDeviceEnable
        }
      }, {
        new: true
      })
    }
    if (user == null) {
      return res.send({
        errMsg: -2,
        desc: 'Update fail!'
      })
    }
    // update redis
    const asyncRedisClient = asyncRedisClientConnect()
    await asyncRedisClient.lset(letter, index, JSON.stringify(user))
    asyncRedisClient.quit()
    return res.send({
      errMsg: 1
    })
  }
}