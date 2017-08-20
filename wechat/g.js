'use strict' 
let sha1 = require('sha1')  

module.exports = function (opts) {
  return function *(next) {
  console.log(this.query)
//实现验证逻辑   
  let token = opts.token
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
}
}
