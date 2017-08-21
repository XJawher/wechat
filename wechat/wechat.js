'use strict' 
let promise = require('bluebird')
let request = promise.promisify(require('request'))

let prefix = 'https://api.weixin.qq.com/cgi-bin/' 
let api = {
  accessToken : prefix + 'token?grant_type=client_credential'
}



function Wechat(opts) {
   let that = this
   this.appID = opts.appID
   this.appSecret = opts.appSecret
   this.getAccessToken = opts.getAccessToken
   this.saveAccessToken = opts.saveAccessToken

   this.getAccessToken() 
   .then(function (data) {
     try{
      data = JSON.parse()//拿到票据的信息，由于拿到的票据的内容都是字符串，现在把字符串 JSON 化
     }
     catch(e){//捕获异常，文件不存在或者不合法的时候，我们要更新一下票据
      return that.updataAccessToken(data)
     }
     if (that.isVaildAccessToken(data)) {//判断票据是不是在合法时期内，
      promise.resolve(data)//如果是合法的就继续向下传递
     }
     else{//如果不合法我们要更新一下
      return that.updataAccessToken()
     }
   })//这里拿到的就是一个最终的处理结果，然后回调函数传下来这个 data 就是合法的 data
   .then(function (data) {
    that.access_token = data.access_token //把这个 access_token 挂到实例上
    that.expires_in = data.expires_in //票据的过期字段
    
    that.saveAccessToken(data)//调用 save 方法，把票据存起来

   })
}

//在 Wechat 的原型链上增加一个 isValidAccessToken 合法性的检查
Wechat.prototype.isValidAccessToken = function(data) {/*data 不存在|| data.access_token 不存在||expires_in 有效期不存在 这三个说明他是不合法的*/
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  let access_token = data.access_token
  let expires_in = data.expires_in
  let now = (new Date().getTime())
  if (now < expires_in) {/*当前时间如果小于过期时间，说明是没有过期*/
    return true
  }
  else{
    return false
  }
}
/*更新票据的方法*/
Wechat.prototype.updataAccessToken = function() {
  let appID = this.appID
  let appSecret = this.appSecret
  let url = api.accessToken + '&appid='+appID + '&secret='+appSecret

  return new promise(function (resolve,reject) {

    /*request 向某个服务器发起 get 或者 post 请求*/
    request({url:url,json:true}).then(function (response) {
      let data = response.body
      var now = (new Date().getTime())
      let expires_in = now + (data.expires_in -20)*1000


      data.expires_in = expires_in

      resolve(data)
    })
    
  })
}

module.exports = Wechat