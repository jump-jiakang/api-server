// 导入 express 模块
const express = require('express')
// 创建 express 服务器实例
const app = express()

// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())

// 配置解析 application/x-www-form-urlencoded 格式表单数据中间件
app.use(express.urlencoded({ extended: false }))

// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api',userRouter)


// 调用 app.listen() 方法，指定端口号并启动Web服务器
app.listen(80,()=>{
    console.log('api server running at http://127.0.0.1')
})