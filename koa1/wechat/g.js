'use strict' 
let sha1 = require('sha1') 
let promise = require('bluebird')
let request = promise.promisify(require('request'))
let Wechat = require('./wechat')
let getRawBody = require('raw-body')  
let util = require('./util')

//新增一个构造函数，用它来生成实例，在这个实例生成的时候我们可以做一些初始化的工作
//现在假设服务器上有一个文件，存储的是老的旧的 AcessToken 文件和过期信息，首先我们要读一下
//这个文件，来判断这个票据是不是过期，如果过期，我们重新向微信服务器申请一次，然后再重新写入一次
//有两个点要考虑一下，就是读出和写入，由于 g.js 是一个中间件，这个中间件只应该负责和微信的交互过程
//而不应该干涉外面的业务逻辑，所以读取票据信息和写入票据信息的逻辑我们应该独立出来，再业务层里处理

/*这里关于 URL 我们希望地址是可以配置的，而不是写死在某个原型里
appid=APPID&secret=APPSECRET 这两个是动态的需要传递进来的
*/
// let prefix = 'https://api.weixin.qq.com/cgi-bin/' 
// let api = {
//   accessToken : prefix + 'token?grant_type=client_credential'
// }



// function Wechat(opts) {
//    let that = this
//    this.appID = opts.appID
//    this.appSecret = opts.appSecret
//    this.getAccessToken = opts.getAccessToken
//    this.saveAccessToken = opts.saveAccessToken

//    this.getAccessToken() 
//    .then(function (data) {
//      try{
//       data = JSON.parse()//拿到票据的信息，由于拿到的票据的内容都是字符串，现在把字符串 JSON 化
//      }
//      catch(e){//捕获异常，文件不存在或者不合法的时候，我们要更新一下票据
//       return that.updataAccessToken(data)
//      }
//      if (that.isVaildAccessToken(data)) {//判断票据是不是在合法时期内，
//       promise.resolve(data)//如果是合法的就继续向下传递
//      }
//      else{//如果不合法我们要更新一下
//       return that.updataAccessToken()
//      }
//    })//这里拿到的就是一个最终的处理结果，然后回调函数传下来这个 data 就是合法的 data
//    .then(function (data) {
//     that.access_token = data.access_token //把这个 access_token 挂到实例上
//     that.expires_in = data.expires_in //票据的过期字段
    
//     that.saveAccessToken(data)//调用 save 方法，把票据存起来

//    })
// }

// //在 Wechat 的原型链上增加一个 isValidAccessToken 合法性的检查
// Wechat.prototype.isValidAccessToken = function(data) {/*data 不存在|| data.access_token 不存在||expires_in 有效期不存在 这三个说明他是不合法的*/
//   if (!data || !data.access_token || !data.expires_in) {
//     return false
//   }
//   let access_token = data.access_token
//   let expires_in = data.expires_in
//   let now = (new Date().getTime())
//   if (now < expires_in) {/*当前时间如果小于过期时间，说明是没有过期*/
//     return true
//   }
//   else{
//     return false
//   }
// }
// /*更新票据的方法*/
// Wechat.prototype.updataAccessToken = function() {
//   let appID = this.appID
//   let appSecret = this.appSecret
//   let url = api.accessToken + '&appid='+appID + '&secret='+appSecret

//   return new promise(function (resolve,reject) {

//     /*request 向某个服务器发起 get 或者 post 请求*/
//     request({url:url,json:true}).then(function (response) {
//       let data = response.body
//       var now = (new Date().getTime())
//       let expires_in = now + (data.expires_in -20)*1000


//       data.expires_in = expires_in

//       resolve(data)
//     })
    
//   })
// }
module.exports = function (opts,handler) {
/*wechat 中间件调用，初始化实例  这个实例 wechat 是用来管理和微信的接口和一些票据的更新
，存储
*/

  let wechat = new Wechat(opts)
  return function* (next) {
    let that = this
    //实现验证逻辑   
    let token = opts.token
    let signature = this.query.signature
    let nonce = this.query.nonce
    let timestamp = this.query.timestamp
    let echostr = this.query.echostr
    let str = [token,timestamp,nonce].sort().join('')
    let sha = sha1(str)

    /*判断请求方式是不是 GET*/
    if (this.method === 'GET') {
      if (sha === signature) {
        this.body = echostr + ''
      }
      else {
        this.body = 'wrong'
      }
    }
    else if (this.method ==='POST') {
      if (sha !== signature) {
        this.body = 'wrong'
        return false
      }
      let data = yield getRawBody(this.req,{
        length:this.length,
        limit:'1mb',
        encoding:this.charset
      })

      let content = yield util.parseXMLAsync(data)
      console.log(content)
/*进一步的将 XML 格式化*/   
      let message = util.formatMessage(content.xml)
      console.log(message)

      this.weixin = message
      yield handler.call(this,next)
      wechat.reply.call(this)
    }
  }
}
