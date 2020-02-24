# Aquaponics-MQTT-Server
A HTTP &amp; MQTT Server based on NodeJS, express and mosca.

see [development notes](https://github.com/PorYoung/Aquaponics-MQTT-Server/blob/master/note.md)

## 开发记录

### 用户管理模块

#### 数据库设计

| 字段     |          |                                          |
| -------- | -------- |
| 用户ID   | _id      | 唯一                                     |
| 用户名   | username |                                          |
| 密码     | password |                                          |
| 身份级别 | level    | 1-超级管理员，2-管理员，3-用户，4-待确认 |

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