module.exports = {
    permissionCheck: async (req, res, next) => {
        if (req.session.user && req.session.user._id) {
            next()
        } else {
            return res.send({
                errMsg: 403,
                desc: 'Permission Denied'
            })
        }
    }
}