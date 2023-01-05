# api-server

## 1. 项目前期的准备工作

### 1.1 初始化项目结构

1. 将 `素材` 目录下的 `assets` 和 `home` 文件夹，拷贝到 `code` 目录下
2. 在 `code` 目录下新建 `login.html` 和 `index.html` 页面

### 1.2 使用 GitHub 管理项目

1. 在项目目录中运行 `git init` 命令
2. 在项目目录中运行 `git add .` 命令
3. 在项目目录中运行 `git commit -m "init project"` 命令
4. 新建 GitHub 仓库
5. 将本地仓库和 GitHub 仓库建立关联关系
6. 将本地仓库的代码推送到 GitHub 仓库中
7. 运行 `git checkout -b login` 命令，创建并切换到 `login` 分支



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





## 2. 登录注册

### 2.1 新建用户信息表



