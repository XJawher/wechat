'use strict' 
let koa = require('koa')
let sha1 = require('sha1')
let path = require('path')
let config = require('./config')
let g = require('./wechat/g')
let util = require('./libs/util')
let wechat_file = path.join(__dirname ,'./config/wechat.txt')
let weixin = require('./weixin')


let app = new koa()
app.use(g(config.wechat,weixin.reply))
app.listen(1399)
console.log('listening 1399 ....')