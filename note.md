# Aquaponics-MQTT-Server 开发记录

## 模块开发

Arduino等其他开发记录文档参阅[项目网站 blog.SmartAq.cn](blog.SmartAq.cn)

### Mqtt服务器与Express.js整合测试

通过！

### 数据库设计

#### 用户表

1. 用户ID
2. 用户名
3. 密码
4. 身份等级(0：普通用户 1：专业用户 2：管理员)
   1. 专业用户权限：设备管理、普通用户管理、管理普通用户设备
   2. 管理员权限：管理所有用户和设备

```js
const mongoose = app.mongoose
const Schema = mongoose.Schema

const UserSchema = new Schema({
  _id: default,
  username: String,
  password: String,
  level: {
    type: Number,
    default: 0
  }
})
```

#### 设备表

1. 设备ID
2. 设备密码
3. 设备主体用户
4. 设备名
5. 设备标签
6. 设备说明
7. 设备添加人
8. 设备运行状态[见设备指令]
   - power
   - stopUploadAllData
   - collectInterval
9. 设备健康状态

```js
const DeviceSchema = new Schema({
  _id: default,
  password: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  name: String,
  tag: String,
  description: String,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  avatarUrl: String,
  date: Date,
  runStatus: Object,
  rateStatus: Object
})
```

#### 数据表

1. 数据ID
2. 各项数据指标
3. 采集时间
4. 所属设备ID
5. {++是否异常++}
6. {++问题备注id++}

```js
const DataSchema = new Schema({
  _id: default,
  date: Date,
  data: {
    index1: {
    val,min,max,fMax,fMin,
    stat: ，0最适范围内，1略高于最适，-1略低于最适，2大于最大值，-2小于最小值
  },
    index2,...
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device'
  },
  warning: Boolean,
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'issue'
  }
})
```

指标：
水中温度：`TH2O`
酸碱度：`PHH2O`
总溶解固体：`TDS`
氧化还原电位：`ORP`
水位线：`LEVEL`
空气温度：`TAIR`
光照强度：`LIGHT`
土壤湿度：`RHSUB`
空气湿度：`RHAIR`

#### 指标定义

1. ID
2. 所属设备`_id`
3. 各指标定义（最大、最小、最适最小、最适最大、说明）
4. 修改人
5. 更新时间
6. 是否失效

```js
const DefineSchema = new Schema({
  _id: default,
  date: Date,
  define: {
    index1: {
    min,max,fMax,fMin,description
  },
    index2,...
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device'
  },
  whoSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  expired: {
    type: Boolean,
    default: false
  }
})
```

#### {--预警记录表--}

1. 预警记录ID
2. 出现预警数据ID
3. 设备ID
4. 预警时间
5. 出现预警的异常指标
6. 备注

```js
const WarningSchema = new Schema({
  _id: default,
  date: Date,
  warning:{
    index1:{
      val,
      stat: 2大于最大值，-2小于最小值
    }
    ,index2,...
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device'
  },
  data: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'data'
  },
  note: String
})
```

#### 设备记录表

1. 记录ID
2. 记录人ID
3. 记录设备ID
4. 记录内容
5. 记录时间
6. {--所选的预警记录ID--}
7. 所选的数据ID

```js
const IssueSchema = new Schema({
  _id: default,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device'
  },
  note: String,
  date: Date,
  data: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'data'
  }
})
```

#### 指令记录表

```js
const instructionSchema=new Schema({
  _id: default,
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'device'
  }
  instruction: {

  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
  date: Date
})
```

#### 用户组表

1. 负责人ID
2. 组员列表
3. 组名

```js
const GroupSchema = new Schema({
  _id: default,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  list: Array,
  name: String
})
```

### 登陆模块

1. 微信小程序登陆/绑定
   - Api地址：`/api/wechatSPLogin`
   - 请求参数：
     - `code`
     - 微信获得的`userInfo`对象
   - 返回参数：
     - `errMsg`
     - `_id`
     - `signStr`，md5加密的`openid`，作为调用api的验证
     - 其他`userInfo`的属性

### 设备模块

#### 设备管理

1. 增加一套设备(管理员)
   - Api地址：`/api/addADevice`
   - `post`
   - 请求参数：
     - 当前用户`_id`:`user_id`
     - 当前用户`signStr`
     - `password`
     - `description`
     - `tag`
     - `name`
   - 返回参数：
     - `errMsg`
     - 设备ID
2. 获取已绑定设备列表（分用户等级获取、分页获取）
   1. 管理员
      - Api地址：`/api/fetchOwnedDevice`
      - `get`
      - 请求参数：
        - 当前用户`_id`:`user_id`
        - 当前用户`signStr`
        - 页码`page` (-1获取全部)
   2. 普通用户
   3. 高级用户
3. 绑定设备
   - Api：`/api/bindDevice`
   - 请求参数：
     - 设备id:`deviceId`
     - 用户id:`user_id`
     - 设备标签:`tag`
     - 设备名:`name`
   - 一个设备只能绑定一个用户，重复绑定会覆盖之前用户信息
4. 取消绑定设备
   - Api地址：`/api/unbindDevice`
   - 请求参数：
     - 设备id:`deviceId`
     - 设备密码:`password`
5. 删除设备(管理员)
   - Api：`/api/removeDevice`
   - 请求参数
     - 设备id:`deviceId`

#### 数据查询

1. 获取一段时间数据
   - Api:`/api/getDeviceData`
   - 请求参数
     - 设备id:`deviceId`
     - 起始时间:`start`(`Date`)
     - 截止时间:`stop`(`Date`)
     - 获取记录数:`count`
   - 根据需求上传不同参数：
     - 获取`start`至`stop`间`count`条靠近`stop`的逆序数据
     - 获取`start`开始`count`条正序数据
     - 获取`start`至`stop`间所有正序数据
     - 获取至今为止`count`条逆序数据
     - 获取至今为止全部正序数据

### Mqtt交互实现

分隔符：`/`
离线消息：`qos`大于`0`，`retain`为`true`

#### 用户端

1. 用户名：用户`user/_id`
2. 密码：用户`md5(openid)`
3. 订阅设备实时数据，订阅主题：`device/`+设备号+`/data`
4. 订阅服务器预警信息，订阅主题：`device/`+设备号+`/warning`
5. 发布设备控制指令，发布主题：`device/`+设备号+`/instruction`，离线消息

#### 服务器端

1. 订阅所有设备实时数据，订阅主题：`device/`+设备号+`/data`
   - 数据格式Json字符串：`"{"a":"123"}"`
   - 水温：T_H2O
   - 酸碱度：PH_H2O
   - 总溶解固体：TDS
   - 氧化还原电位：ORP
   - 水位线：Level
   - 空气温度：TAir
   - 光照强度：Light
   - 土壤湿度：RHSubstrate
   - 空气湿度：RHAir
2. 订阅用户的控制指令，订阅主题：`device/`+设备号+`/instruction`
3. 发布预警信息，发布主题：`device/`+设备号+`/warning`，离线消息
4. 发布参数调整信息，发布主题：`device/`+设备号+`/adjust`，离线消息
5. 发布设备控制指令（主动式），发布主题：`device/`+设备号+`/instruction`，离线消息

##### 发布预警信息

1. 定义设备数据
2. 发送http请求，交由http服务器处理数据，返回处理结果 || 直接处理
3. 转发处理结果，定义预警的用户将收到预警信息（离线消息）

##### 存储指令操作

1. `-1`：mqtt连接已断开（仅设备内指令）
2. `0`：mqtt已连接（用户指令：启动设备)
3. `|1|1|`：停止全部采集数据上传
4. `|1|2|`：开启上传全部数据
5. `|1|3|time|`：设置采集数据间隔时间（1~10min）

#### 设备端

1. 用户名：设备`device/_id`
2. 密码：设备密码`password`
3. 订阅所有控制指令，订阅主题：`device/`+设备号+`/instruction`
4. 发布实时数据，发布主题：`device/`+设备号+`/data`

##### 数据上传

1. 格式：json

```js
{
  date: Date,
  index1: {
    val: ,
  },
  ...
}
```

## 问题记录

### 微信小程序

#### Session问题

微信小程序每次请求session会发生变化，需要自己维持cookie，在每次请求头中添加cookie

```js
//在首次请求中保存返回对象的cookie
let header = {
  'cookie': res.header['set-cookie']
}
//在之后每次请求中添加该请求头
wx.request({
  header: header
})
```

#### uploadFile()问题

1. 使用本地https服务器调试会报错
2. 后台返回json数据此时需要手动解析

#### js深拷贝和浅拷贝问题

Js默认浅拷贝，深拷贝的两种方法：1.递归；2.JSON.stringfy和JSON.parse

### MQTT

1. `mqtt`的`topic`中的符号

> 主题层级分隔符  / :     用于分割主题层级，/分割后的主题，这是消息主题层级设计中很重要的符号。   比方说： aaa/bbb和  aaa/bbb/ccc 和aaa/bbb/ccc/ddd  ，这样的消息主题格式，是一个层层递进的关系，可通过多层通配符同时匹配两者，或者单层通配符只匹配一个。  这在现实场景中，可以应用到：公司的部门层级推送、国家城市层级推送等包含层级关系的场景。
> 单层通配符  +:      单层通配符只能匹配一层主题。比如：   aaa/+     可以匹配 aaa/bbb ，但是不能匹配aaa/bbb/ccc。   单独的+号可以匹配单层的所有推送
> 多层通配符  #：   多层通配符可以匹配于多层主题。比如: aaa/#   不但可以匹配aaa/bbb，还可以匹配aaa/bbb/ccc/ddd。  也就是说，多层通配符可以匹配符合通配符之前主题层级的所有子集主题。单独的#匹配所有的消息主题.
> 注:单层通配符和多层通配符只能用于订阅(subscribe)消息而不能用于发布(publish)消息，层级分隔符两种情况下均可使用。

### Mongoose/MongoDB

1. The MongoDB server has deprecated the `count()` function in favor of two separate functions, `countDocuments()` and `estimatedDocumentCount()`.

## 测试

### Mqtt交互测试

#### 设备端模拟

使用`MQTT.js`模拟设备mqtt客户端

1. 数据上传
   1. 时间间隔：1s
   2. 数据内容：所有指标
2. 指令接收