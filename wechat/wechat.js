'use strict' 
let promise = require('bluebird')
let request = promise.promisify(require('request'))
let util = require('./util')
let fs = require('fs')
let _ = require('lodash')
let prefix = 'https://api.weixin.qq.com/cgi-bin/' 
let api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {/*临时的素材*/
        upload: prefix + 'media/upload?'
    },
    permanent: {/*永久的素材 uploadNews 图文消息 uploadNewsPic 图文消息封面图*/
        upload: prefix + 'material/add_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?'
    }
}



function Wechat(opts) {
   let that = this
   this.appID = opts.appID
   this.appSecret = opts.appSecret
   this.getAccessToken = opts.getAccessToken
   this.saveAccessToken = opts.saveAccessToken

   this.fetchAccessToken() 
   
}
Wechat.prototype.fetchAccessToken = function (type,fliepath) {
  let that = this 

  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return promise.resolve(this)
    }
  }

  this.getAccessToken() 
   .then(function (data) {
     try{
      data = JSON.parse()//拿到票据的信息，由于拿到的票据的内容都是字符串，现在把字符串 JSON 化
     }
     catch(e){//捕获异常，文件不存在或者不合法的时候，我们要更新一下票据
      return that.updataAccessToken(data)
     }
     if (that.isVaildAccessToken(data)) {//判断票据是不是在合法时期内，
      return promise.resolve(data)//如果是合法的就继续向下传递
     }
     else{//如果不合法我们要更新一下
      return that.updataAccessToken()
     }
   })//这里拿到的就是一个最终的处理结果，然后回调函数传下来这个 data 就是合法的 data
   .then(function (data) {
    that.access_token = data.access_token //把这个 access_token 挂到实例上
    that.expires_in = data.expires_in //票据的过期字段
    
    that.saveAccessToken(data)//调用 save 方法，把票据存起来

    return promise.resolve(data)
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
      let now = (new Date().getTime())
      let expires_in = now + (data.expires_in -20)*1000


      data.expires_in = expires_in

      resolve(data)
    })    
  })
}


//上传临时素材
// Wechat.prototype.uploadMaterial = function (type,fliepath) {
//     let that = this
//     console.log('let that = this Wechat.js 107 => form')
//     console.log(that)
//     let form = {
//       media: fs.createReadStream(fliepath)/*创建一个可读的流，然后传入文件*/
//     }/**/
//     let appID = this.appID
//     let appSecret = this.appSecret

//     /*同样的用 promise 包装，不过要在里面传递全局票据*/
//   return new promise(function (resolve,reject) {
//     that
//       .fetchAccessToken()/*拿到全局票据*/
//       .then(function (data) {/*在这里面构建请求的 URL */
//         let url = api.upload + 'access_token=' + data.access_token + '&type=' + type

//         /*request 向某个服务器发起 get 或者 post 请求*/
//         request({method:'POST', url:url,formData:form, json:true}).then(function (response) {
//           let _data = response.body
//           if (_data) {
//             resolve(_data)
//           }
//           else {
//             throw new Error('upload material mirror')
//           }
//         })
//         .catch(function (err) {
//           reject(err) 
//         })  
//       })   
//   }) 
// }
// 上传永久素材
Wechat.prototype.uploadMaterial = function (type, material, permanent) {
    const that = this
    let form = {}
    //默认为零时素材
    let uploadUrl = api.temporary.upload

    // 如果传入了参数
    if(permanent) {
        uploadUrl = api.permanent.upload

        _.extend(form, permanent)
    }

    if(type === 'pic') {/*若是 pic 那么我们认为他就是图片*/
        uploadUrl = api.permanent.uploadNewsPic
    }

    if(type === 'news') {/*如果是 news 那么就是新闻推送 是个数组*/
        uploadUrl = api.permanent.uploadNews

        //如果传入了一个数组
        form = material /*这里把素材给 form */
    } else {
        // 如果传入了一个路径
        form.media = fs.createReadStream(material)
    }

    // const appID = this.appID
    // const appSecret = this.appSecret

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                let url = uploadUrl + 'access_token=' + data.access_token

                if(!permanent) {
                    url += '&type=' + type
                } else {
                    form.access_token = data.access_token
                }

                /*上传的参数 */
                let options = {  
                    method: 'POST',
                    url: url,
                    json: true
                }

                if(type === 'news') {
                    options.body = form
                } else {
                    options.formData = form
                }


                request({method: 'POST', url: url, formData: form, json: true}).then(function(response) {
                    console.log('response' + JSON.stringify(response))
                    let _data = response.body
                    console.log('_data' + JSON.stringify(_data))

                    if(_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Upload material fails')
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
            })
    })
}


Wechat.prototype.reply = function () {
  let content = this.body
  let message = this.weixin
  let xml = util.tpl(content,message)
  this.status = 200
  this.type = 'application/xml'
  this.body = xml 
}
module.exports = Wechat