const config = require('../../../config')
const request = require('superagent')
const md5 = require('md5')
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
          errMsg: 'cannot get openid'
        })
      }
      if (info.openid) {
        //query user infomation from databases
        let queryData = await db.user.findOne({
          openid: info.openid
        }).lean()
        let isFirst = false
        if (!userInfo.nickName) {
          userInfo.nickName = '游客'.concat(md5(info.openid))
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
          isFirst = true
        } else if (queryData.nickName != userInfo.nickName || queryData.avatarUrl != userInfo.avatarUrl) {
          queryData = await db.user.update({
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
        let signStr = md5(info.openid)
        /* req.session._id = queryData._id
        req.session.signStr = signStr */
        req.session.user = Object.assign({}, queryData, {
          signStr: signStr,
          isFirst: isFirst,
        })
        req.session.user._id = queryData._id.toString()
        return res.send({
          errMsg: '1',
          isFirst: isFirst,
          _id: queryData._id.toString(),
          nickName: queryData.nickName,
          avatarUrl: queryData.avatarUrl,
          signStr: signStr,
          level: queryData.level,
          list: queryData.list
        })
      } else {
        return res.send({
          errMsg: 'cannot get openid'
        })
      }
    } else {
      return res.send({
        errMsg: 'no code'
      })
    }
  }
}