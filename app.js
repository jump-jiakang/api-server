// 导入 express 模块
const express = require('express')
// 创建 express 服务器实例
const app = express()

const joi = require('joi')

// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())

// 配置解析 application/x-www-form-urlencoded 格式表单数据中间件
app.use(express.urlencoded({ extended: false }))

// 响应数据的中间件
app.use((req,res,next)=>{
    // status=0 为成功，status=1 为失败，默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function(err, status=1) {
        res.send({
            // 状态
            status,
            // 状态描述，判断 err 是 错误对象还是字符串
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 导入配置文件
const config = require('./config')

// 解析 token 中间件
const expressJWT = require('express-jwt')

// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))

// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api',userRouter)

// 错误级别中间件
app.use((err,req,res,next)=>{
    // 数据验证失败
    if(err instanceof joi.ValidationError) return res.cc(err)
    // 捕获身份认证失败的错误
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知错误
    res.cc(err)
})


// 调用 app.listen() 方法，指定端口号并启动Web服务器
app.listen(80,()=>{
    console.log('api server running at http://127.0.0.1')
})