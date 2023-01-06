// 用户路由处理函数

// 导入数据库操作模块
const db = require('../db/index')

// 导入 bcryptjs 为密码进行加密
const bcrypt = require('bcryptjs')

// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')

// 导入配置文件
const config = require('../config')

// 注册用户的处理函数
exports.regUser = (req,res)=>{
    // 接收表单数据
    const userinfo = req.body
    // 判断数据是否合法
    if (!userinfo.username || !userinfo.password) {
        return res.send({ status: 1, message: '用户名或密码不能为空!' })
    }
    // 定义 SQL 语句
    const sql = `select * from ev_users where username=?`
    // 执行 SQL 语句并根据结果判断用户名是否被占用
    db.query(sql, [userinfo.username], (err,results)=>{
        // 执行 SQL 语句失败
        if(err) {
            return res.send({ status:1, message: err.message })
        }
        // 用户名被占用
        if(results.length>0) {
            return res.send({ status:1, message: '用户名被占用，请更换用户名！' })
        }
        // 对用户的密码进行 bcrypt 加密，返回值是加密之后的密码字符串
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)

        // 插入新用户
        // 1. 定义插入用户的 SQL 语句
        const sql = `insert into ev_users set ?`
        // 2. 调用 db.query() 执行 SQL 语句，插入新用户
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err,results)=>{
            // 执行 SQL 语句失败
            if(err) {
                return res.send({ status: 1, message: err.message })
            }
            // SQL 语句执行成功，但影响行数不为 1
            if(results.affectedRows !== 1) {
                return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
            }
            // 注册成功
            res.send({ status: 0, message: '注册成功！' })
        })
    })
    
}

// 登录的处理函数
exports.login = (req,res)=>{
    // 根据用户名查询用户数据
    // 1. 接收表单数据
    const userinfo = req.body
    // 2. 定义查询的 SQL 语句
    const sql = `select * from ev_users where username=?`
    // 3. 执行 SQL 语句，查询用户数据
    db.query(sql, userinfo.username, (err,results)=>{
        // 执行 SQL 语句失败
        if(err) return res.cc(err)
        // 执行 SQL 语句成功，但查询到数据的条数不等于 1
        if(results.length !== 1) return res.cc('登录失败！')
        // 拿着用户输入的密码，和数据库中存储的密码进行对比
        // console.log(results)
        const compareResult = bcrypt.compareSync(userinfo.password,results[0].password)
        // 如果对比的结果等于 false，则证明用户输入的密码错误
        if(!compareResult) {
            return res.cc('登录失败！')
        }
        // 剔除完毕之后，user 中只保留用户的 id，username，nickname，email 这四个属性的值
        const user = { ...results[0], password:'', user_pic:'' }
        // 生成 Token 字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {
            expiresIn: '10h',   // token 有效期为 10 个小时
        })
        // 将生成 token 字符串响应给客户端
        res.send({
            status: 0,
            message: '登录成功！',
            // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
            token: 'Bearer ' + tokenStr,
        })
    })
}