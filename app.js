'use strict' 
let koa = require('koa')
let sha1 = require('sha1')
let g = require('./wechat/g')
let config = {
  wechat : {
    appID :  'wxb529535807ed1405',
    appSecret : '99a54169f924330cbe5d3db83739eaf5',
    token : 'lipc_token' 
  }
}  
let app = new koa()
app.use(wechat(config.wechat))
app.listen(8087)
console.log('listening 8087 ....')