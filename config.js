'use strict' 
let path = require('path')
let util = require('./libs/util')
let wechat_file = path.join(__dirname ,'./config/wechat.txt')


let config = {
  wechat : {
    appID :  'wxb529535807ed1405',
    appSecret : '99a54169f924330cbe5d3db83739eaf5',
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