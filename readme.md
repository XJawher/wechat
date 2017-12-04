## 微信公众号
分别由 koa1 和 koa2 开发,这里的内容主要是折腾 koa2 的,从第一步内网穿透开始做.    
## 内网穿透    
这里用的工具是 localtunnel.在安装的时候首先是 `npm install -g localtunnel` 全局安装 localtunnel 模块,然后指定端口 `lt --port 3010` 这时候控制台就会把你用的地址打出来了,我们用 node 启动 3010 端口的服务,然后用控制台打出的地址访问.或者也可以按[https://natapp.cn/](https://natapp.cn/) 中所指示的教程完成内网穿透.
## 项目初始化
确保本地是通过 `npm install vue-cli -g ` 然后 `vue init nuxt/koa cat`,这一步完成以后再用 `git init` 初始化项目,初始化完成之后开始在码云上建一个仓库.    
## 码云仓库   
[koa2wechat](https://gitee.com/lovehaer/koa2wechat) 这是在码云上的仓库,新建完成以后,把项目的地址指向到私有仓库的地址上 `git remote add origin git@gitee.com:lovehaer/koa2wechat.git`     
## pm2 设置    
新建一个 **ecosystem.json** 文件,这个就是最终发不上线的时候的脚本.   
## 测试项目
在新建的目录中执行 `npm install`,然后执行 `npm run dev` 这时候访问 **127.0.0.1:3000** 会正常显示页面.
## 验证微信公众号
微信公众号在开发的时候第一步就是验证你的微信公众号和你的服务器还有域名是否能够正常通信,这个通信的方式是要按照人家微信的规矩来完成,