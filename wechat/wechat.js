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
    permanent: {
    upload: prefix + 'material/add_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    fetch: prefix + 'material/get_material?',
    del: prefix + 'material/del_material?',
    update: prefix + 'material/update_news?',
    count: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  },   
  group: {
    create: prefix + 'groups/create?',
    fetch: prefix + 'groups/get?',
    check: prefix + 'groups/getid?',
    update: prefix + 'groups/update?',
    move: prefix + 'groups/members/update?',
    batchUpdate: prefix + 'groups/members/batchupdate?',
    del: prefix + 'groups/delete?'
  },
  user: {/*用户的重命名*/
    remark: prefix + 'user/info/updateremark?',
    fetch: prefix + 'user/info?',/*单个用户的信息*/
    batchFetch: prefix + 'user/info/batchget?',/*多个用户的信息*/
    list: prefix + 'user/get?'
  },
  mass: {/*群发消息*/
    group: prefix + 'message/mass/sendall?',/*群发按照分组*/
    openId: prefix + 'message/mass/send?',
    del: prefix + 'message/mass/delete?',
    preview: prefix + 'message/mass/preview?',
    check: prefix + 'message/mass/get?'
  },
  menu: {
    create: prefix + 'menu/create?',
    get: prefix + 'menu/get?',
    del: prefix + 'menu/delete?',
    current: prefix + 'get_current_selfmenu_info?'
  },
  qrcode: {
    create: prefix + 'qrcode/create?',
    show: prefix + 'showqrcode?'
  },
  shortUrl: {
    create: prefix + 'shorturl?'
  },
  ticket: {
    get: prefix + 'ticket/getticket?'
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
// --------------------------  素材部分开始 ------------------------------------//

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

Wechat.prototype.countMaterial = function() {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.permanent.count + 'access_token=' + data.access_token

        request({method: 'GET', url: url, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('count material fails')
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
Wechat.prototype.batchMaterial = function(options) {
  let that = this
  options.type = options.type || 'image'
  options.offset = options.offset || 0
  options.count = options.count || 1

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.permanent.batch + 'access_token=' + data.access_token

        request({method: 'POST',url: url, body: options, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('batch material fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}
//------------------------------------素材部分结束--------------------//
//--------------------------------- group start---------------------//


/*创建分组*/
Wechat.prototype.createGroup = function(name) {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.group.create + 'access_token=' + data.access_token
        let form = {
          group: {
            name: name
          }
        }
        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('create group fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}


/*获取分组*/
Wechat.prototype.fetchGroups = function() {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.group.fetch + 'access_token=' + data.access_token

        request({method: 'GET',url: url, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('fetch group fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}

/*检查分组*/

Wechat.prototype.checkGroup = function(openId) {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.group.check + 'access_token=' + data.access_token
        let form = {
          openid: openId
        }

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('check group fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}

/*更新分组*/

Wechat.prototype.updateGroup = function(id, name) {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.group.update + 'access_token=' + data.access_token

        let form = {
          group: {
            id: id,
            name: name
          }
        }

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('update group fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}

/*
移动分组 openIds 用户唯一标识符 toGruopId 要移动到哪一个组中去
把批量移动用户和移动用户合在一起 如果 openID 是数组那么就是批量移动的
否则就是单独移动

 */

Wechat.prototype.MoveGroup = function(openIds, toGruopId) {
  let that = this


  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let form = {
          to_groupid: toGruopId
        }

        if (_.isArray(openIds)) {
          let url = api.group.batchUpdate + 'access_token=' + data.access_token
          form.openid_list = openIds
        } else {
          let url = api.group.move + 'access_token=' + data.access_token
          form.openid = openIds
        }

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('batch move group fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}


/*删除用户分组*/

Wechat.prototype.deleteGroup = function(id) {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.group.del + 'access_token=' + data.access_token

        let form = {
          group: {
            id: id
          }
        }

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('delete group fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}

//------------------------------- group over ---------------------//
//------------------------------- 设置用户备注名 开始 ---------------------//
Wechat.prototype.remarkUser = function(openid,remark) {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.user.remark + 'access_token=' + data.access_token

        let form = {
          openid:openId,
          remark:remark
        }

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('remark user name  fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}
/*获取用户的信息*/
Wechat.prototype.fetchUsers = function(openIds, lang) {
  let that = this
  lang = lang ? lang : 'zh_CN'
  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let options = {
          json: true
        }
        if (_.isArray(openIds)) {
          options.url = api.user.batchFetch + 'access_token=' + data.access_token
          options.body = {
            user_list: openIds
          }
          options.method = 'POST'
        } else {
          options.url = api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openIds + '&lang=' + lang
        }

        request(options)
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('batch fetch users fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}
/*索取用户列表  */
Wechat.prototype.listUsers = function(openId) {
  let that = this

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        let url = api.user.list + 'access_token=' + data.access_token

        if (openId) {
          url += '&next_openid=' + openId
        }

        request({method: 'GET',url: url, json: true})
        .then(function(res) {
          let _data = res.body
          if (_data) {
            resolve(_data)
          } else{
            throw new Error('list user fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
        
      })
  })
}




//------------------------------- 设置用户备注名 over ---------------------//
//------------------------------- 群发消息接口 开始 ---------------------//
Wechat.prototype.sendByGroup = function(type, message, groupId) {
  var that = this;

  var msg = {
    filter: {},
    msgtype: type
  };
  msg[type] = message;
  if (!groupId) {
    msg.filter.is_to_all = true;
  } else {
    msg.filter = {
      is_to_all:false,
      tag_id: groupId
    }
  };
  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.mass.group + 'access_token=' + data.access_token;

        request({method: 'POST',url: url, body: msg, json: true})
        .then(function(res) {
          var _data = res.body;
          if (_data) {
            resolve(_data);
          } else{
            throw new Error('send by group fails');
          }
        })
        .catch(function(err) {
          reject(err);
        })
        
      })
  })
}

Wechat.prototype.sendByOpenId = function(type, message, openIds) {
  var that = this;

  var msg = {
    msgtype: type,
    touser: openIds
  };
  msg[type] = message;

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.mass.openId + 'access_token=' + data.access_token;

        request({method: 'POST',url: url, body: msg, json: true})
        .then(function(res) {
          var _data = res.body;
          if (_data) {
            resolve(_data);
          } else{
            throw new Error('send by openId fails');
          }
        })
        .catch(function(err) {
          reject(err);
        })
        
      })
  })
}

Wechat.prototype.deleteMass = function(msgId) {
  var that = this;

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.mass.del + 'access_token=' + data.access_token;
        var form = {
          msg_id: msgId
        };

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          var _data = res.body;
          if (_data) {
            resolve(_data);
          } else{
            throw new Error('send by openId fails');
          }
        })
        .catch(function(err) {
          reject(err);
        })
        
      })
  })
}

Wechat.prototype.previewMass = function(type, message, openId) {
  var that = this;

  var msg = {
    msgtype: type,
    touser: openId
  };
  msg[type] = message;

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.mass.preview + 'access_token=' + data.access_token;

        request({method: 'POST',url: url, body: msg, json: true})
        .then(function(res) {
          var _data = res.body;
          if (_data) {
            resolve(_data);
          } else{
            throw new Error('preview mass fails');
          }
        })
        .catch(function(err) {
          reject(err);
        })
        
      })
  })
}

/*检查消息是否送达*/
Wechat.prototype.checkMass = function(msgId) {
  var that = this;

  return new promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.mass.check + 'access_token=' + data.access_token;
        var form = {
          msg_id: msgId
        }

        request({method: 'POST',url: url, body: form, json: true})
        .then(function(res) {
          var _data = res.body;
          if (_data) {
            resolve(_data);
          } else{
            throw new Error('check mass fails');
          }
        })
        .catch(function(err) {
          reject(err);
        })
        
      })
  })
}

//------------------------------- 群发接口 over ---------------------//





// Wechat.prototype.createMenu = function(menu) {
//   var that = this;

//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.menu.create + 'access_token=' + data.access_token;

//         request({method: 'POST',url: url, body: menu, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('create menu fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }

// Wechat.prototype.getMenu = function() {
//   var that = this;

//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.menu.get + 'access_token=' + data.access_token;

//         request({method: 'GET',url: url, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('get menu fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }

// Wechat.prototype.deleteMenu = function() {
//   var that = this;

//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.menu.del + 'access_token=' + data.access_token;

//         request({method: 'GET',url: url, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('delete menu fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }

// Wechat.prototype.getCurrentMneu = function() {
//   var that = this;

//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.menu.current + 'access_token=' + data.access_token;

//         request({method: 'GET',url: url, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('get current menu fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }

// Wechat.prototype.createQrCode = function(qr) {
//   var that = this;

//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.qrcode.create + 'access_token=' + data.access_token;

//         request({method: 'POST',url: url, body: qr, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('create qrcode fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }

// Wechat.prototype.showQrCode = function(ticket) {
//   return api.qrcode.show + 'ticket=' + encodeURI(ticket);
// }

// Wechat.prototype.createShortUrl = function(action, url) {
//   var that = this;
//   action = action || 'long2short';
//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.shortUrl.create + 'access_token=' + data.access_token;

//         var form = {
//           action: action,
//           long_url: url
//         }
//         request({method: 'POST',url: url, body: form, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('show qrcode fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }

// Wechat.prototype.showQrCode = function(ticket) {
//   return api.qrcode.show + 'ticket=' + encodeURI(ticket);
// }

// Wechat.prototype.semantic = function(semanticData) {
//   var that = this;
//   return new promise(function(resolve, reject) {
//     that
//       .fetchAccessToken()
//       .then(function(data) {
//         var url = api.semanticUrl + 'access_token=' + data.access_token;

//         semanticData.appid = data.appID;
//         request({method: 'POST',url: url, body: semanticData, json: true})
//         .then(function(res) {
//           var _data = res.body;
//           if (_data) {
//             resolve(_data);
//           } else{
//             throw new Error('semantic fails');
//           }
//         })
//         .catch(function(err) {
//           reject(err);
//         })
        
//       })
//   })
// }







Wechat.prototype.reply = function () {
  let content = this.body
  let message = this.weixin
  let xml = util.tpl(content,message)
  this.status = 200
  this.type = 'application/xml'
  this.body = xml 
}
module.exports = Wechat