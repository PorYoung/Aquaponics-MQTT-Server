# Aquaponics-MQTT-Server

A HTTP &amp; MQTT Server based on NodeJS, express and mosca.

see [development notes](https://github.com/PorYoung/Aquaponics-MQTT-Server/blob/master/note.md)

## 开发记录

### redis配置

```js
const redis = require("redis")
const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    db: '1'
})
const asyncRedisClient = require('async-redis').createClient({
    host: '127.0.0.1',
    port: 6379,
    db: '1'
})
const session = require('express-session')
let RedisStore = require('connect-redis')(session)
global.redisClient = redisClient
// session配置
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'PorYoung',
  cookie: {
    maxAge: 60 * 1000 * 30
  },
  resave: false,
  saveUninitialized: true,
}))

```

> redis操作完成后释放连接

### 用户管理模块

#### 数据库设计

| 字段         |                    |                                          |
| ------------ | ------------------ | ---------------------------------------- |
| 用户ID       | _id                | 唯一                                     |
| 用户名       | nickName           | 微信用户名                               |
| 头像         | avatarUrl          | 微信头像                                 |
| 密码         | password           |                                          |
| 身份级别     | level              | 0-待确认，1-超级管理员，2-管理员，3-用户 |
| 用户管理权限 | userManageEnable   | 布尔                                     |
| 添加设备权限 | addDeviceEnable    | 布尔，默认true                           |
| 删除设备权限 | deleteDeviceEnable | 布尔，默认false                          |
| 其他功能权限 | 待定               | 待定                                     |

```js
const mongoose = app.mongoose
const Schema = mongoose.Schema

const UserSchema = new Schema({
    //wechat openid
    openid: {
        type: String,
        required: true,
        unique: true
    },
    nickName: String,
    avatarUrl: String,
    password: String,
    level: {
        type: Number,
        default: 0
    },
    userManageEnable: {
        type: Boolean,
        default: false
    },
    addDeviceEnable: {
        type: Boolean,
        default: true
    },
    deleteDeviceEnable: {
        type: Boolean,
        default: false
    }
})
```

#### 功能实现

##### 登陆功能

| errMsg | 含义              |
| ------ | ----------------- |
| 2      | 首次登陆          |
| 1      | 登陆成功          |
| -1     | 登陆成功但等级为0 |
| -2     | 无法获取openid    |
| -3     | 获取用户code失败  |

| 绑定用户api返回值errMsg | 含义       |
| ----------------------- | ---------- |
| 1                       | 成功       |
| -1                      | 用户不存在 |
| -2                      | 非法代码   |

##### 用户管理功能

**用户名首字母分类**

- 使用`pinyin`模块进行分类
- 分类结果存储在redis中
- 新增或删减用户更新redis
- userListCategorize方法:`server/common/init

**获取用户列表**

- 返回值定义
| errMsg |          |
| ------ | -------- |
| -1     | 权限不足 |

- 实现getUserListCategorized方法:`server/controller/user`

**权限修改**

- 上传参数

| params             |                                   |
| ------------------ | --------------------------------- |
| _id                | 被修改用户id                      |
| letter             | 用户名首字母（供redis使用）       |
| index              | 用户在分类中的索引（供redis使用） |
| level              | 用户级别                          |
| userManageEnable   |                                   |
| addDeviceEnable    |                                   |
| deleteDeviceEnable |                                   |

- 返回值

| errMsg |                |
| ------ | -------------- |
| 1      | 成功           |
| -1     | 未获得上传参数 |
| -2     | 更新失败       |

**删除用户**