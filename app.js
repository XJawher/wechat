'use strict' 
let koa = require('koa')
let sha1 = require('sha1')  
let config = {
  wechat : {
    appID :  '你的 appID',
    appSecret : '你的 appSecret',
    token : '你的 token' 
  }
}  
let app = new koa()
app.use(function *(next) {
  console.log(this.query)
//实现验证逻辑   
  let token = config.wechat.token
  let signature = this.query.signature
  let nonce = this.query.nonce
  let timestamp = this.query.timestamp
  let echostr = this.query.echostr
  let str = [token,timestamp,nonce].sort().join('')
  let sha = sha1(str)

      if (sha === signature) {
        this.body = echostr + ''
      }
      else {
        this.body = 'wrong'
      }

})
app.listen(8087)
console.log('listening 8087 ....')