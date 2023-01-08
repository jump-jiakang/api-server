# api-server

## 1. 初始化

### 1.1 创建项目

1、新建 `api-server` 文件夹作为项目的根目录，并在项目中运行如下命令，初始化包管理配置文件：

```bash
npm init -y
```

2、运行如下的命令，安装特点版本的 **express**:

```bash
npm i express@4.17.1
```

3、在项目根目录中新建 `app.js` 作为整个项目的入口文件，并初始化如下代码：

```js
// 导入 express 模块
const express = require('express')
// 创建 express 服务器实例
const app = express()

// write your code here...

// 调用 app.listen() 方法，指定端口号并启动Web服务器
app.listen(80,()=>{
    console.log('api server running at http://127.0.0.1')
})
```



### 1.2 配置 cors 跨域

1、运行如下的命令，安装 **cors** 中间件：

```bash
npm i cors@2.8.5
```

2、在 app.js 中导入并配置 **cors** 中间件：

```js
// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())
```



### 1.3 配置解析表单数据中间件

1、通过如下代码，配置解析 **application/x-www-form-urlencoded** 格式表单数据中间件：

```js
app.use(express.urlencoded({ extended: false }))
```



### 1.4 初始化路由相关文件夹

1、在项目根目录中，新建 `router` 文件夹，用来存放所有的 **路由** 模块

> 路由模块中，只存放客户端的请求与处理函数之间的映射关系

2、在项目根目录中，新建 `router_handler` 文件夹，用来存放所有的 **路由处理函数模块**

> 路由处理函数模块中，专门负责存放每个路由对应的处理函数



### 1.5 初始化用户路由模块

1、在 `router` 文件夹中，新建 `user.js` 文件，作为用户的路由模块，并初始化代码如下：

```js
const express = require('express')
// 创建路由对象
const router = express.Router()

// 注册新用户
router.post('/reguser',(req,res)=>{
    res.send('reguser ok')
})

// 登录
router.post('/login',(req,res)=>{
    res.send('login ok')
})

// 将路由对象共享出去
module.exports = router
```

2、在 `app.js` 文件中，导入并使用 **用户路由模块**

```js
// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api',userRouter)
```



### 1.6 抽离用户路由模块中的处理函数

> 目的：为了保证**路由模块**的纯粹性，所有的 **路由处理函数**，必须抽离对应的 **路由处理函数模块** 中

1、在 `/router_handler/user.js` 中，使用 **express** 对象，分别向外共享如下两个路由处理函数：

```js
// 注册用户的处理函数
exports.regUser = (req,res)=>{
    res.send('reguser ok')
}
// 登录的处理函数
exports.login = (req,res)=>{
    res.send('login ok')
}
```

2、将 `/router/user.js` 中的代码修改为如下结构：

```js
// 导入用户路由处理函数模块
const userHandler = require('../router_handler/user')

// 注册新用户
router.post('/reguser',userHandler.regUser)
// 登录
router.post('/login',userHandler.login)
```

3、测试结果：

![image-20230105191638685](C:\Users\家康\AppData\Roaming\Typora\typora-user-images\image-20230105191638685.png)



### 1.7 使用 GitHub 管理项目

1. 在项目目录中运行 `git init` 命令
2. 在项目目录中运行 `git add .` 命令
3. 在项目目录中运行 `git commit -m "完成项目初始化"` 命令
4. 新建 GitHub 仓库
5. 将本地仓库和 GitHub 仓库建立关联关系
6. 将本地仓库的代码推送到 GitHub 仓库中
7. 运行 `git checkout -b login` 命令，创建并切换到 `login` 分支



## 2. 数据库创建和配置

### 2.1 新建用户信息表

1、在 my_db_01 数据库中，新建 `ev_users` 表如下：

![image-20230105193604800](C:\Users\家康\AppData\Roaming\Typora\typora-user-images\image-20230105193604800.png)



### 2.2 安装并配置 mysql 模块

> 在 API 接口项目中，需要安装并配置 myql 这个第三方模块，来连接和操作 MySQL 数据库

1、运行如下命令，安装 **mysql** 模块：

```bash
npm i mysql@2.18.1
```

2、在根目录中新建 `/db/index.js` 文件夹，在此自定义模块中创建数据库的连接对象：

```js
// 导入 mysql 模块
const mysql = require('mysql')

// 创建数据库连接对象
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'my_db_01'
})

// 向外共享 db 数据库连接对象
module.exports = db
```





## 3. 注册

**实现步骤**

1. 检测表单数据是否合法
2. 检测用户名是否被占用
3. 对密码进行加密处理
4. 插入新用户



### 3.1 检测表单数据是否合法

1、判断用户名和密码是否为空：

```js
// 接收表单数据
const userinfo = req.body
// 判断数据是否合法
if (!userinfo.username || !userinfo.password) {
    return res.send({ status: 1, message: '用户名或密码不能为空!' })
}
```



### 3.2 检测用户名是否被占用

1、导入数据库操作模块：

```js
const db = require('../db/index')
```

2、定义 SQL 语句：

```js
const sql = `select * from ev_users where username=?`
```

3、执行 SQL 语句并根据结果判断用户名是否被占用：

```js
db.query(sql, [userinfo.username], (err,results)=>{
    // 执行 SQL 语句失败
    if(err) {
        return res.send({ status:1, message: err.message })
    }
    // 用户名被占用
    if(results.length>0) {
        return res.send({ status:1, message: '用户名被占用，请更换用户名！' })
    }
})
```



### 3.3 对密码进行加密处理

> 为了保证密码的安全性，不建议在数据库以 **明文** 的形式保存用户密码，推荐对密码进行 **加密存储**

当前项目中，使用 `bcrypt.js` 对用户密码进行加密，优点：

- 加密之后的密码，**无法被逆向破解**
- 同一明文密码多次加密，得到的**加密结果各不相同**，保证了安全性

1、运行如下命令，安装指定版本的 `bcrypt.js`：

```bash
npm i bcryptjs@2.4.3
```

2、在 `/router_handler/user.js` 中，导入 `bcryptjs`

```js
const bcrypt = require('bcryptjs')
```

 3、在注册用户的处理函数中，确认用户名可用之后，调用 `bcrypt.hashSync(明文密码,随机盐长度)` 方法，对用户密码进行加密处理：

```js
// 对用户的密码进行 bcrypt 加密，返回值是加密之后的密码字符串
userinfo.password = bcrypt.hashSync(userinfo.password, 10)
```



### 3.4 插入新用户

1、定义插入用户的 SQL 语句：

```js
const sql = `insert into ev_users set ?`     
```

2、调用 `db.query()` 执行 SQL 语句，插入新用户：

```js
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
```



### 3.5 优化 res.send() 代码

> 在处理函数中，需要多次调用 `res.send()` 向客户端响应 **处理失败的结果**，为了简化代码，可以手动封装一个 `res.cc()` 函数

1、在 `app.js` 中，所有路由之前，声明一个全局中间件，为 res 对象挂载一个 `res.cc()` 函数：

```js
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
```



### 3.6 优化表单数据验证

> 表单验证原则：前端验证为辅，后端验证为主，**永远不要相信**前端提交过来的**任何内容**

在实际开发中，前后端都需要对表单的数据进行合法性的验证，而且，**后端做为数据合法性验证的最后一个关口**，在拦截非法数据方面，起到了至关重要的作用。

单纯的使用 `if...else...` 的形式对数据合法性进行验证，效率低下、出错率高、维护性差。因此，推荐使用**第三方数据验证模块**，来降低出错率、提高验证的效率与可维护性，**让后端程序员把更多的精力放在核心业务逻辑的处理上**。

1、安装 `joi` 包，为表单携带的每个数据项，定义验证规则：

```bash
npm i joi
```

2、安装`@escook/express-joi` 中间件，来实现自动对表单数据进行验证的功能：

```bash
npm i @escook/express-joi
```

3、新建 `/schame/user.js` 用户信息验证规则模块，并初始化代码如下：

```js
// 用户信息验证模块
const joi = require('joi')

/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

// 用户名的验证规则
const username = joi.string().alphanum().min(1).max(10).required()
// 密码的验证规则
const password = joi.string().pattern(/^[\S]{6,12}$/).required()

// 注册和登录表单的验证规则对象
exports.reg_login_schema = {
    // 表示需要对 req.body 中的数据进行验证
    body: {
        username,
        password
    }
}
```

4、修改 `/router/user.js` 中的代码如下：

```js
const express = require('express')
const router = express.Router()

// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const { reg_login_schema } = require('../schame/user')

// 注册新用户
// 3. 在注册新用户的路由中，对当前请求中携带的数据进行验证
// 3.1 数据验证通过后，会把这次请求流转给后面的路由处理函数
// 3.2 数据验证失败后，终止后继代码的执行，并抛出一个全局 Error 错误，进入全局错误级别中间件进行处理
router.post('/reguser', expressJoi(reg_login_schema), userHandler.regUser)

// 登录
router.post('/login', userHandler.login)

module.exports = router
```

5、在 `app.js` 的全局错误级别中间件中，捕获验证失败的错误，并把验证失败的结果响应给客户端：

```js
const joi = require('@hapi/joi')

// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 未知错误
  res.cc(err)
})
```





## 4. 登录

**实现步骤**

1. 检测表单数据是否合法
2. 根据用户查询用户的数据
3. 判断用户输入的密码是否正确
4. 生成 JWT 的 Token 字符串

### 4.1 检测登录表单的数据是否合法

1、将 `/router/user.js` 中登录的路由代码修改如下：

```js
// 登录
router.post('/login', expressJoi(reg_login_schema), userHandler.login)
```



### 4.2 根据用户名查询用户数据

1、接收表单数据：

```js
const userinfo = req.body
```

2、定义查询的 SQL 语句：

```js
const sql = `select * from ev_users where username=?`
```

3、执行 SQL 语句，查询用户数据：

```js
db.query(sql, userinfo.username, (err,results)=>{
    // 执行 SQL 语句失败
    if(err) return res.cc(err)
    // 执行 SQL 语句成功，但查询到数据的条数不等于 1
    if(results.length !== 1) return res.cc('登录失败！')
    // TODO：判断用户输入的登录密码是否和数据库中的密码一致
})
```



### 4.3 判断用户输入密码是否正确

> 核心实现思路：调用 bcrypt.compareSync(用户提交的密码，数据库中的密码) 方法比较密码是否一致

> 返回值是布尔值 (true：一致、false：不一致)

具体实现代码如下：

```js
// 拿着用户输入的密码，和数据库中存储的密码进行对比
// console.log(results)
const compareResult = bcrypt.compareSync(userinfo.password,results[0].password)

// 如果对比的结果等于 false，则证明用户输入的密码错误
if(!compareResult) {
    return res.cc('登录失败！')
}

// TODO：登录成功，生成 Token 字符串
```



### 4.4 生成 JWT 的 Token 字符串

> 核心注意点：在生成 Token 字符串的时候，一定要剔除 **密码** 和 头**像** 的值

1、通过 ES6 的高级语法，快速剔除 **密码** 和 **头像** 的值：

```js
// 剔除完毕之后，user 中只保留用户的 id，username，nickname，email 这四个属性的值
const user = { ...results[0], password:'', user_pic:'' }
```

2、运行如下的命令，安装生成 Token 字符串包：

```bash
npm i jsonwebtoken@8.5.1
```

3、在 `/router_handler/user.js` 模块的头部区域，导入 `jsonwebtoken` 包：

```js
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
```

4、创建 `config.js` 文件，并向外共享 加密 和 还原 Token 的 `jwtSecretKey` 字符串：

```js
module.exports = {
    jwtSecretKey: 'jiakang No1. ^_^',
}
```

5、将用户信息对象加密成 Token 字符串：

```js
// 导入配置文件
const config = require('../config')
// 生成 Token 字符串
const tokenStr = jwt.sign(user, config.jwtSecretKey, {
    expiresIn: '10h',   // token 有效期为 10 个小时
})
```

6、将生成的 Token 字符串响应给客户端：

```js
res.send({
    status: 0,
    message: '登录成功！',
    // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
    token: 'Bearer ' + tokenStr,
})
```



### 4.5 配置解析 Token 的中间件

1、运行如下的命令，安装解析 Token 的中间件：

```bash
npm i express-jwt@5.3.3
```

2、在 `app.js` 中注册路由之前，配置解析 Token 的中间件：

```js
// 导入配置文件
const config = require('./config')

// 解析 token 中间件
const expressJWT = require('express-jwt')

// 使用 .unless({ path: [/^\api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\api\//] }))
```

3、在 `app.js` 中的错误级别中间件里面，捕获并处理 Token 认证失败后的错误：

```js
// 错误中间件
app.use(function (err, req, res, next) {
  // 省略其它代码...

  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')

  // 未知错误...
})
```



### 4.6 将登录模块上传GitHub

1. 运行 `git rm -r --cached node_modules` 命令
2. 运行 `git commit -m "完成了注册登录的功能"` 命令
3. 运行 `git push -u origin master` 命令
4. 运行 `git checkout -b user` 命令



## 5. 获取用户基本信息

**实现步骤：**

1. 初始化 **路由** 模块
2. 初始化 **路由处理函数** 模块

3. 获取用户基本信息

### 5.1 初始化路由模块

1、创建 `/router/userinfo.js` 路由模块

```js
// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 获取用户基本信息
router.get('/userinfo',(req,res)=>{
    res.send('ok')
})

// 向外共享路由对象
module.exports = router
```

2、在 `app.js` 中导入并使用个人中心的路由模块:

```js
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)
```



### 5.2 初始化路由处理函数模块

1、创建 `/router_handler/userinfo.js` 路由处理函数模块，并初始化如下结构：

```js
// 获取用户基本信息处理函数
exports.getUserInfo = (req,res) => {
    res.send('ok')
}
```

2、修改 `/router/userinfo.js` 中的代码如下：

```js
// 导入用户信息处理函数模块
const userinfo_handler = require('../router_handler/userinfo')
// 获取用户基本信息
router.get('/userinfo', userinfo_handler.getUserInfo)
```



### 5.3 获取用户的基本信息

1、在 `/router_handler/userinfo.js` 头部导入数据库操作模块：

```js
// 导入数据库操作模块
const db = require('../db/index')
```

2、定义 SQL 语句：

```js
// 注意：为了防止用户密码泄露，需要排除 password 字段
const sql = `select id, username, nickname, email, user_pic from ev_users where id=?`
```

3、调用 `db.query()` 执行 SQL 语句：

```js
// 注意：req 对象上的 user 属性，是Token解析成功，express-jwt 中间件帮我们挂载上去的
db.query(sql, req.user.id, (err,results)=>{
    // 1. 执行 SQL 语句失败
    if(err) return res.cc(err)
    // 2. 执行 SQL 语句成功，但是查询到的数据条数不等于 1
    if(results.length !== 1) return res.cc('获取用户信息失败！')
    // 3. 将用户信息响应给客户端
    res.send({
        status: 0,
        message: '获取用户信息成功！',
        data: results[0]
    })
})
```



## 6. 更新用户基本信息

**实现步骤：**

1. 定义路由和处理函数
2. 验证保单数据
3. 实现更新用户基本信息功能

### 6.1 定义路由和处理函数

1、在 `/router/userinfo.js` 模块中，新增 **更新用户信息** 路由：

```js
// 更新用户的基本信息
router.post('/userinfo',userinfo_handler.updateUserInfo)
```

2、在 `/router_handler/userinfo.js` 模块中，定义并向外共享 `更新用户基本信息` 的路由处理函数：

```js
// 更新用户基本信息的处理函数
exports.updateUserInfo = (req,res) => {
    res.send('ok')
}
```



### 6.2 验证表单数据

1、在 `/schema/user.js` 验证规则模块中，定义 id、nickname、Email 的验证规则如下：

```js
// 定义 id，nickname，email 的验证规则
const id = joi.number().integer().min(1).required()
const nickname = joi.string().required()
const email = joi.string().email().required()
```

2、并使用 exports 向外共享 **验证规则对象**：

```js
// 验证规则对象 - 更新用户基本信息
exports.update_userinfo_schema = {
    body: {
        id,
        nickname,
        email
    }
}
```

3、在 `/router/userinfo.js` 模块中，导入验证数据合法性中间件：

```js
// 导入验证数据合法性中间件
const expressJoi = require('joi')
```

4、在 `/router/userinfo.js` 模块中，导入需要的验证规则对象：

```js
// 导入需要的验证规则对象
const { update_userinfo_schema } = require('../schame/user')
```

5、在 `/router/userinfo.js` 模块中，修改 **更新用户基本信息** 的路由如下：

```js
// 更新用户的基本信息
router.post('/userinfo', expressJoi(update_userinfo_schema) ,userinfo_handler.updateUserInfo)
```



### 6.3 实现更新用户基本信息功能

1、定义待执行的 SQL 语句：

```js
const sql = `update ev_users set ? where id=?`
```

2、调用 `db.query()` 执行 SQL 语句并传参：

```js
db.query(sql, [req.body, req.body.id], (err,results)=>{
    // 执行 SQL 语句
    if(err) return res.cc(err)
    // 执行 SQL 语句成功，但影响的行数不为1
    if(results.affectedRows !== 1) return res.cc('修改用户基本信息失败！')
    // 修改用户基本信息成功
    return res.cc('修改用户基本信息成功！', 0)
})
```



## 7. 重置密码

 **实现步骤**

1. 定义路由和处理函数
2. 验证表单数据
3. 实现重置密码的功能

### 7.1 定义路由和处理函数

1、在 `/router/userinfo.js` 模块中，新增 **重置密码** 的路由：

```js
// 重置密码的路由
router.post('/updatepwd', userinfo_handler.updatePassword)
```

2、在 `/router_handler/userinfo,js` 模块中，定义并向外共享 **重置密码** 的路由处理函数：

```js
// 重置密码的处理函数
exports.updatePassword = (req,res) => {
    res.send('ok')
}
```



### 7.2 验证表单数据

> 核心验证思路：旧密码与新密码，必须符合密码的验证规则，并且新密码不能与旧密码一致！

1、在 `/schame/user.js` 模块中，使用 `express` 向外共享如下的 **验证规则对象**：

```js
// 验证规则对象 - 重置密码
exports.update_password_shema = {
    body: {
        // 使用 password 这个规则，验证 req.body.oldPwd 的值
        oldPwd: password,
        // 使用 joi.not(joi.ref('oldPwd')).concat(password) 规则，验证 req.body.newPwd 的值
        // 解读：
        // 1. joi.ref('oldPwd') 表示 newPwd 的值必须和 oldPwd 的值保持一致
        // 2. joi.not(joi.ref('oldPwd')) 表示 newPwd 的值不能等于 oldPwd 的值
        // 3. .concat() 用于合并 joi.not(joi.ref('oldPwd')) 和 password 这两条验证规则
        newPwd: joi.not(joi.ref('oldPwd')).concat(password)
    }
}
```

2、在 `/router/userinfo.js` 模块中，导入需要的验证规则对象：

```js
// 导入需要的验证规则对象
const { update_userinfo_schema, update_password_shema } = require('../schame/user')
```

3、并在**重置密码的路由**中，使用 `update_password_schame` 规则验证表单的数据，实例代码如下：

```js
router.post('/updatepwd', expressJoi(update_password_schema), userinfo_handler.updatePassword)
```



### 7.3 实现查询密码的功能

1、根据 `id` 查询用户是否存在：

```js
// 定义根据 id 查询用户数据的 SQL 语句
const sql = `select * from ev_users where id=?`

// 执行 SQL 语句查询用户是否存在
db.query(sql, req.user.id, (err,results)=>{
    // 执行 SQL 语句失败
    if(err) return res.cc(err)
    // 检查指定 id 用户是否存在
    if(results.length !== 1) return res.cc('用户不存在！')
    // 判断提交的旧密码是否正确
})
```

2、判断提交的 **旧密码** 是否正确：

```js
// 导入 bcryptjs 即可使用 bcrypt.compareSync(提交的密码, 数据库中的密码) 方法验证密码是否正确
// comparaSync() 函数的返回值为布尔值， true 表示密码正确， false 表示密码错误 
const bcrypt = require('bcryptjs')

// 判断提交的旧密码是否正确
const compareResult = bcrypt.compareSync(req.body.oldPwd,results[0].password)
if(!compareResult) return res.cc('原密码错误！')
```

3、对新密码进行 `bcrypt` 加密之后，更新到数据库中：

```js
// 定义更新用户密码的 SQL 语句
const sql = `update ev_users set password=? where id=?`

// 对新密码进行 bcrypt 加密处理
const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

// 执行 SQL 语句，根据 id 更新用户的密码
db.query(sql, [newPwd, req.user.id], (err, results) => {
  // SQL 语句执行失败
  if (err) return res.cc(err)

  // SQL 语句执行成功，但是影响行数不等于 1
  if (results.affectedRows !== 1) return res.cc('更新密码失败！')

  // 更新密码成功
  res.cc('更新密码成功！', 0)
})
```



### 8. 更新用户头像

**实现步骤：**

1. 定义路由和处理函数
2. 验证表单数据
3. 实现更新用户头像的功能

### 8.1 定义路由和处理函数

1、在 `/router/userinfo.js` 模块中，新增 **更新用户头像** 的路由：

```js
// 更新用户头像路由
router.post('/update/avatar', userinfo_handler.updateAvatar)
```

2、在 `/router_handler/userinfo.js` 模块中，定义向外共享 **更新用户头像** 的路由处理函数：

```js
// 更新用户头像处理函数
exports.updateAvatar = (req,res) => {
    res.send('ok')
}
```



### 8.2 验证数据表单

1、在 `/schema/user.js` 验证规则模块中，定义 `avatar` 的验证规则如下：

```js
// dataUrl() 指的是如下格式的字符串数据：
// data:image/png; base64, VE9PTUFOWVNFQ1JFVFM=
const avatar = joi.string().dataUri().required()
```

2、并使用 exports 向外共享如下的 `验证规则对象`：

```js
// 验证规则对象 - 更新头像
exports.update_avatar_schema = {
    body: {
        avatar,
    }
}
```

3、在 `/router/userinfo.js` 模块中，导入需要的验证规则对象：

```js
const { update_avatar_schema } = require('../schame/user')
```

4、在 `/router/userinfo.js` 模块中，修改 **更新用户头像** 的路由如下：

```js
router.post('/update/avatar', expressJoi(update_avatar_schema), userinfo_handler.updateAvatar)
```



### 8.3 实现更新用户头像功能

1、定义更新用户头像的 SQL 语句：

```js
const sql = `update ev_users set user_pic=? where id=?`
```

2、调用 `db.query()` 执行 SQL 语句，更新对应用户的头像：

```js
db.query(sql, [req.body.avatar, req.user.id], (err, results)=>{
    // 执行 SQL 语句失败
    if(err) return res.cc(err)
    // 执行 SQL 语句成功，但是影响行数不等于 1
    if(results.affectedRows !== 1) return res.cc('更新头像失败！')
    // 更新用户头像成功
    return res.cc('更新头像成功！', 0)
})
```



### 8.4 将用户功能上传到GitHub

1. 运行 `git rm -r --cached node_modules` 命令
2. 
