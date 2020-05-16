const pinyin = require('pinyin')
module.exports = {
    userListCategorize: async (force) => {
        const asyncRedisClient = asyncRedisClientConnect()
        let exists = await asyncRedisClient.exists('userListCategorized')
        if (!exists || !!force) {
            let userList = await db.user.find({}).lean()
            for (let i = 0; i < 26; ++i) {
                let k = String.fromCharCode(65 + i)
                await asyncRedisClient.del(k)
            }
            for (let i = 0; i < userList.length; ++i) {
                let user = userList[i]
                let fl = pinyin(user.nickName, { style: pinyin.STYLE_FIRST_LETTER })[0][0].toUpperCase()[0]
                await asyncRedisClient.rpush(fl, JSON.stringify(user))
            }
            await asyncRedisClient.set('userListCategorized', 1)
            console.info('Categorized UserList!')
        } else {
            console.info('UserList has been categorized!')
        }
        asyncRedisClient.quit()
    },
    addToUserList: async (user) => {
        const asyncRedisClient = asyncRedisClientConnect()
        let fl = pinyin(user.nickName, { style: pinyin.STYLE_FIRST_LETTER })[0][0].toUpperCase()[0]
        await asyncRedisClient.rpush(fl, JSON.stringify(user))
        asyncRedisClient.quit()
    }
}