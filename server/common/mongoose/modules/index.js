const mongoose = require('../config')
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
    }
})
const DeviceSchema = new Schema({
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
    date: Date
})
const DataSchema = new Schema({
    date: Date,
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device'
    },
    data: Object
})
const WarningSchema = new Schema({
    date: Date,
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
const IssueSchema = new Schema({
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
    data: Array,
    warning: Array
})
const GroupSchema = new Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    list: Array,
    name: String
})
const DefineSchema = new Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device'
    },
    define: Object,
    date: Date
})
const InstructionSchema = new Schema({
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device'
    },
    instruction: Object,
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: Date
})

DataSchema.indexes({
    device: -1,
    date: -1
})
WarningSchema.indexes({
    date: -1,
    device: -1
})
IssueSchema.indexes({
    date: -1,
    device: -1
})

const user = mongoose.model('user', UserSchema)
const device = mongoose.model('device', DeviceSchema)
const data = mongoose.model('data', DataSchema)
const warning = mongoose.model('warning', WarningSchema)
const issue = mongoose.model('issue', IssueSchema)
const group = mongoose.model('group', GroupSchema)
const define = mongoose.model('define', DefineSchema)
const instruction = mongoose.model('instruction', InstructionSchema)

module.exports = {
    ObjectId: mongoose.Types.ObjectId,
    user,
    device,
    data,
    warning,
    issue,
    group,
    define,
    instruction
}