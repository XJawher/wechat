'use strict' 
let path = require('path')
let util = require('./libs/util')
let wechat_file = path.join(__dirname ,'./config/wechat.txt')


let config = {
  wechat : {
    appID :  '你的',
    appSecret : '你的',
    token : '你的',
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