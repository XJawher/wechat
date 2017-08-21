'use strict'
let xml2js = require('xml2js')
let Promise = require('bluebird')
let tpl = require('./tpl')
exports.parseXMLAsync =function (xml) {
  return new Promise(function (resolve,reject) {
    xml2js.parseString(xml,{trim:true},function (err,content) {
      if (err) reject(err)
      else resolve(content)
    })
  })
}
/*有可能存在会出现要遍历的情况，这里新增一个 function*/
function formatMessage(result) {
  let message = {}
  if (typeof result === 'object') {/*如果变量类型是 object 那就遍历它的每一个项*/
    let keys = Object.keys(result)
    for (let i = 0;i < keys.length;i++) {
      let item = result[keys[i]]
      let key = keys[i]

      if (!item instanceof Array || item.length === 0 ) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]
        if (typeof val === 'object') {
          message[key] = formatMessage(val)

        }
        else {
          message[key] = (val || '').trim() 
        }
      }
      else {
        message[key] = []
        for (var j = 0, k = item.length;j < k;j++) {/*for (var j = 0; k = item.length;j < k;j++)*/
          message[key].push(formatMessage(item[j])) /*为何这样就报错了？？*/
        }
      }
    }
  }
  return message
}

exports.formatMessage = formatMessage
export.tpl = function(content,message) {
  let info = {} /*临时对象存储回复的内容*/
  let type = 'text'
  let fromUserName = message.fromUserName
  let toUserName = message.toUserName

  if (Array.isArray(content)) {
    type = 'news'
  }

  type = content.type || type
  info.content = content
  info.createTime = new Date().getTime
  info.msgType = type
  info.fromUserName = toUserName
  info.toUserName = fromUserName

  return tpl.compiled(info)
}

/*进一步格式化 XML 的方法*/
// exports.formatMessage =function (xml) {
//   return new Promise(function (resolve,reject) {
//     xml2js.parseString(xml,{trim:true},function (err,content) {
//       if (err) reject(err)
//       else resolve(content)
//     })
//   })
// }











