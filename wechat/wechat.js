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
        upload: prefix + 'media/upload?',
        fetch: prefix + 'media/get?'  /*获取临时素材*/  


    },
    permanent: {/*永久的素材 uploadNews 图文消息 uploadNewsPic 图文消息封面图*/
        upload: prefix + 'material/add_material?',
        fetch: prefix + 'material/get_material?',/*获取永久素材*/
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?',
        del: prefix + 'media/del_material?',
        update: prefix + 'media/update_news?', 
        count: prefix + 'media/get_materialcount?', 
        batch: prefix + 'media/batchget_material?'

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


                request(options).then(function(response) {
                    console.log('response' + JSON.stringify(response))
                    let _data = response.body

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


/*获取素材函数部分 三个参数的含义是 根据素材 ID 获取资源
所以第一个就是素材 ID 然后要告诉获取的是什么类型的，所以要写入 type
最后是 permanent 来告诉获取的是临时的还是永久的
*/
// Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
//     const that = this
//     // let form = {}
//     //默认为零时素材
//     let fetchUrl = api.temporary.fetch

//     // 如果传入了参数
//     if(permanent) {
//         fetchUrl = api.permanent.fetch
//     }

//     return new Promise(function(resolve, reject) {
//         that
//             .fetchAccessToken()
//             .then(function(data) {
//                 let url = fetchUrl + 'access_token=' + data.access_token 
//                 let form = {}
//                 let options = {method: 'POST', url: url, json: true}
//                 if (permanent) {
//                   form.media_id = mediaId
//                   form.access_token = data.access_token
//                   options.body = form
//                 }
//                 else {
//                   if (type === 'video') {
//                     url = url.replace('https://','http://')
//                   }
//                   url += '&media_id' + mediaId
//                 }
//                 if (type === 'news' || type === 'video') {
                  
//                   /*request 向某个服务器发起 get 或者 post 请求*/
//                   request(options).then(function(response) {
//                     let _data = response.body
//                     if(_data) {
//                         resolve(_data)
//                     } else {
//                         throw new Error('fetch Material material fails')
//                     }
//                   })
//                   .catch(function(err) {
//                       reject(err)
//                   })                  
//                 }
//                 else {
//                   resolve(url)
//                 }
//             })
//     })
// }

//-------------------scott 源码

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
  let that = this
  let fetchUrl = api.temporary.fetch

  if (permanent) {
    fetchUrl = api.permanent.fetch
  }

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = fetchUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId
        let options = {method: 'POST', url: url, json: true}
        let form = {}
        if (permanent) {
          form.media_id = mediaId
          form.access_token = data.access_token
          options.body = form
        } else {
          if (type == 'video'){
            url = url.replace('https://', 'http://')
          }
          url += '&media_id=' + mediaId
        }

        if (type == 'news' || type == 'video') {
          request(options)
          .then(function(res) {
            let _data = res.body
            if (_data) {
              resolve(_data)
            } else {
              throw new Error('fetch material fails')
            }
          })
          .catch(function(err) {
            reject(err)
          })
        } else {
          resolve(url)
        }

      })
  })
}




//-------------------scott 源码








/*
删除素材接口
他只需要一个素材 ID 别的不需要
*/
Wechat.prototype.deleteMaterial = function (mediaId) {
    const that = this
    let form = {
      media_id:mediaId
    }

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                let url = api.permanent.del + 'access_token=' + data.access_token +'&media_id' + mediaId 
            /*request 向某个服务器发起 get 或者 post 请求*/
              request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
                  console.log('response' + JSON.stringify(response))
                  let _data = response.body
                  console.log('_data' + JSON.stringify(_data))

                  if(_data) {
                      resolve(_data)
                  } else {
                      throw new Error('deleteMaterial material fails')
                  }
              })
              .catch(function(err) {
                  reject(err)
              })
            })
    })
}
/*
新增一个永久素材
mediaId 要修改那个素材  放上该素材的 mediaId
news 永久素材那么这里就是 news 
_.extend(form,news)  让 form 继承传递进来的 news


*/  

Wechat.prototype.updateMaterial = function (mediaId,news) {
    const that = this
    let form = {
      media_id:mediaId
    }
    _.extend(form,news)
    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                let url = api.permanent.update + 'access_token=' + data.access_token +'&media_id' + mediaId 
            /*request 向某个服务器发起 get 或者 post 请求*/
              request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
                  console.log('response' + JSON.stringify(response))
                  let _data = response.body
                  console.log('_data' + JSON.stringify(_data))

                  if(_data) {
                      resolve(_data)
                  } else {
                      throw new Error('update material fails')
                  }
              })
              .catch(function(err) {
                  reject(err)
              })
            })
    })
}

/*获取素材总数


*/
Wechat.prototype.countMaterial = function () {
    const that = this
    _.extend(form,news)
    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                let url = api.permanent.count + 'access_token=' + data.access_token 
            /*request 向某个服务器发起 get 或者 post 请求*/
              request({method: 'GET', url: url, json: true}).then(function(response) {
                  console.log('response' + JSON.stringify(response))
                  let _data = response.body
                  console.log('_data' + JSON.stringify(_data))

                  if(_data) {
                      resolve(_data)
                  } else {
                      throw new Error('update material fails')
                  }
              })
              .catch(function(err) {
                  reject(err)
              })
            })
    })
}

/*
获取素材列表 传入三个参数
type  是 素材的类型，图片（image）、视频（video）、语音 （voice）、图文（news）
offset  是 从全部素材的该偏移位置开始返回，0表示从第一个素材 返回
count 是 返回素材的数量，取值在1到20之间
 */
Wechat.prototype.batchMaterial = function (options) {
    const that = this

    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 2

    return new Promise(function(resolve, reject) {
        that
            .fetchAccessToken()
            .then(function(data) {
                let url = api.permanent.batch + 'access_token=' + data.access_token +'&media_id' + mediaId 
            /*request 向某个服务器发起 get 或者 post 请求*/
              request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                  console.log('response' + JSON.stringify(response))
                  let _data = response.body
                  console.log('_data' + JSON.stringify(_data))

                  if(_data) {
                      resolve(_data)
                  } else {
                      throw new Error('update material fails')
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