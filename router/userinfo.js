// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入验证数据合法性中间件
const expressJoi = require('@escook/express-joi')

// 导入需要的验证规则对象
const { update_userinfo_schema, update_password_shema, update_avatar_schema } = require('../schame/user')

// 导入用户信息处理函数模块
const userinfo_handler = require('../router_handler/userinfo')
// 获取用户基本信息
router.get('/userinfo', userinfo_handler.getUserInfo)

// 更新用户的基本信息
router.post('/userinfo', expressJoi(update_userinfo_schema) ,userinfo_handler.updateUserInfo)

// 重置密码的路由
router.post('/updatepwd', expressJoi(update_password_shema), userinfo_handler.updatePassword)

// 更新用户头像路由
router.post('/update/avatar', expressJoi(update_avatar_schema), userinfo_handler.updateAvatar)

// 向外共享路由对象
module.exports = router