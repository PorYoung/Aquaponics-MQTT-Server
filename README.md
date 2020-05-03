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

##### 用户表

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
    // 文档名 user
    //wechat openid
    openid: {
        type: String,
        required: true,
        unique: true
    },
    // 用户名
    nickName: String,
    // 用户头像URL
    avatarUrl: String,
    // 用户级别
    level: {
        type: Number,
        default: 0
    },
    // 用户管理权限
    userManageEnable: {
        type: Boolean,
        default: false
    },
    // 添加设备权限
    addDeviceEnable: {
        type: Boolean,
        default: true
    },
    // 删除设备权限
    deleteDeviceEnable: {
        type: Boolean,
        default: false
    }
})
```

##### 设备表

| 字段     |             |                |
| -------- | ----------- | -------------- |
| 设备名   | name        |                |
| 设备标签 | tag         |                |
| 设备描述 | description |                |
| 设备头像 | avatarUrl   |                |
| 创建人   | creater     | ref:User       |
| 绑定用户 | users       | Array ref:User |
| 创建时间 | date        |                |
| 密码     | password    |                |
| 运行状态 | runState    | Object         |

```js
{
    // 文档名 device
    //设备密码
    password: String,
    // 设备名
    name: String,
    // 设备标签
    tag: String,
    // 设备描述
    description: String,
    // 创建人
    creater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    // 绑定用户列表
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    // 设备头像
    avatarUrl: String,
    // 创建时间
    date: Date,
    // 运行状态
    runState: Object,
    // 设备图片
    images: Array
}
```

##### 数据定义

**数据定义**

| 字段       |        |
| ---------- | ------ |
| 参数id     | id     |
| 参数名     | name   |
| 单位       | unit   |
| 参数最大值 | max    |
| 参数最小值 | min    |
| 预警最大值 | wmax   |
| 预警最小值 | wmin   |
| 参数描述   | desc   |
| 手动       | manual |

**默认数据定义**

| 字段     |           |          |
| -------- | --------- | -------- |
| 设置人   | whoSet    | ref:User |
| 数据定义 | define    | Array    |
| 日期     | date      |          |
| 使用计数 | usedCount |          |

```js
{
    // 文档名 dfdefine
    // 设置人
    whoSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    // 数据定义
    define: Array,
    // 日期
    date: Date,
    // 使用计数
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    }
}
```

**设备数据定义**

| 字段     |           |              |
| -------- | --------- | ------------ |
| 设备     | device    | ref:Device   |
| 数据定义 | define    |              |
| 参考定义 | refDefine | ref:Dfdefine |
| 设置人   | whoSet    | ref:User     |
| 日期     | date      |              |
| 过期     | expired   | Boolen       |

```js
{
    // 文档名 define
    // 设备
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device'
    },
    // 
    define: Array,
    refDefine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dfdefine'
    },
    date: Date,
    whoSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    expired: {
        type: Boolean,
        default: false
    }
}
```

##### 数据表

| 字段           |            |            |
| -------------- | ---------- | ---------- |
| ID             | _id        |            |
| 设备           | device     | ref:Device |
| 数据           | data       | Object     |
| 日期           | date       |            |
| 记录           | issue      | ref:Issue  |
| 预警           | warning    | Boolen     |
| 使用的数据定义 | usedDefine | ref:Define |

**数据对象**

| 字段 |        |                                                                     |
| ---- | ------ | ------------------------------------------------------------------- |
| 参数 | 参数id | {val:参数值,stat:参数状态(0:正常，-1:预警，-2:越界，-3:无数据)} |

```js
{
    // 文档名: data
    // 日期
    date: Date,
    // 所属设备
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device'
    },
    // 数据对象
    data: Object,
    // 预警信息
    warning: {
        type: Boolean,
        default: false
    },
    // 记录
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'issue'
    }
}
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

##### 设备管理

**添加设备**

**删除设备**

**获取默认参数设置**

- 返回值

| 字段   |                                       |           |
| ------ | ------------------------------------- | --------- |
| errMsg |                                       |           |
| data   | define表 {define: 数据定义数组, 其它} | 有上传_id |
| date   | {define: Config.indexDefaultDefine}   | 无上传_id |

**获取设备参数**

- 返回值

| 字段   |                                      |
| ------ | ------------------------------------ |
| errMsg |                                      |
| data   | {define: 数据定义数组, whoSet, date} |

##### 设备参数设计

##### 小工具

###### 计算模型

### MongoDB/Mongoose操作

**查询数组内对象字段**

```js
db.c.find({array:{$eleMatch:{arrt:val}}})
db.c.find({'array.arrt':val})
```