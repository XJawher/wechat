'use strict' 
let path = require('path')
let util = require('./libs/util')
let wechat_file = path.join(__dirname ,'./config/wechat.txt')


let config = {
  wechat : {
    appID :  'wx13a4a1b7ed19b100',
    appSecret : '22510a6b93d67cebc7a75cd99b23da1b',
    token : 'lipc_token',
    getAccessToken:function () {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken:function (data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file,data)
    } 
  }
}

module.exports = config