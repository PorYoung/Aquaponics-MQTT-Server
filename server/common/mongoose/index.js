//连接数据库
const dbConnetion = require('./connection')

const Modules = require('./modules')

const findByPagination = async (model, criterion, limit, page) => {
    const total = await model.countDocuments(criterion);
    const totalPageNum = parseInt(total / limit);
    if (page > totalPageNum) {
        return null;
    }
    const start = limit * page;
    const queryArr = await model
        .where(criterion)
        .sort({
            date: -1
        })
        .limit(limit)
        .skip(start)
        .lean()
    return queryArr
}

const db = {
    ObjectId: Modules.ObjectId,
    user: Modules.user,
    device: Modules.device,
    data: Modules.data,
    warning: Modules.warning,
    issue: Modules.issue,
    group: Modules.group,
    define: Modules.define,
    instruction: Modules.instruction,
    findByPagination
}
module.exports = db