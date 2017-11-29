'use strict'
// let xml2js = require('xml2js')
// let Promise = require('bluebird')
// let tpl = require('./tpl')



// exports.parseXMLAsync =function (xml) {
//   return new Promise(function (resolve,reject) {
//     xml2js.parseString(xml,{trim:true},function (err,content) {
//       if (err) reject(err)
//       else resolve(content)
//     })
//   })
// }
// /*有可能存在会出现要遍历的情况，这里新增一个 function*/
// function formatMessage(result) {
//   let message = {}
//   if (typeof result === 'object') {/*如果变量类型是 object 那就遍历它的每一个项*/
//     let keys = Object.keys(result)
//     for (let i = 0i < keys.lengthi++) {
//       let item = result[keys[i]]
//       let key = keys[i]

//       if (!item instanceof Array || item.length === 0 ) {
//         continue
//       }

//       if (item.length === 1) {
//         let val = item[0]
//         if (typeof val === 'object') {
//           message[key] = formatMessage(val)

//         }
//         else {
//           message[key] = (val || '').trim() 
//         }
//       }
//       else {
//         message[key] = []
//         for (var j = 0, k = item.lengthj < kj++) {/*for (var j = 0 k = item.lengthj < kj++)*/
//           message[key].push(formatMessage(item[j])) /*为何这样就报错了？？*/
//         }
//       }
//     }
//   }
//   return message
// }

// exports.formatMessage = formatMessage


// exports.tpl = function (content,message) {
//   let info = {}
//   let type = 'text'
//   let fromUserName = message.fromUserName
//   let toUserName = message.toUserName

//   if (Array.isArray(content)) {
//     type = 'news'
//   }
//   // console.log(content)
//   type = content.type || type
//   info.content = content
//   info.createTime = new Date().getTime
//   info.msgType = type
//   info.toUserName = fromUserName
//   info.fromUserName = toUserName

//   return tpl.compiled(info)  
// }

/*Scott 源码*/

let xml2js = require('xml2js')
let Promise = require('bluebird')
let tpl = require('./tpl')

exports.parseXMLAsync = function(xml) {
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xml, {trim: true}, function(err, content) {
            if(err) reject(err)
            else resolve(content)
        })
    })
}


function formatMessage(result) {
    let message = {}

    if(typeof result === 'object') {
        let keys = Object.keys(result)
        console.log('keys: ' + keys)

        for(let i = 0; i < keys.length; i++) {
            let item = result[keys[i]]
            let key = keys[i]

            //如果不是数组，或者长度为0
            if(!(item instanceof Array) || item.lenght === 0) {
                continue
            }

            if(item.length === 1) {
                let val = item[0]

                if(typeof val === 'object') {
                    message[key] = formatMessage(val)
                } else {
                    message[key] = (val || '').trim();
                }
            } else { //最后可能为数组
                message[key] = []
                for(let j = 0, k = item.lenght; j < k; j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }

    return message
}

exports.formatMessage = formatMessage

exports.tpl = function(content, message) {
    let info = {}
    let type = 'text'
    let fromUserName = message.FromUserName
    let toUserName = message.ToUserName

    if(Array.isArray(content)) {
        type = 'news'
    }

    console.log('content： ' + content)

    type = content.type || type

    info.content = content
    info.createTime = Date.now()
    info.msgType = type
    info.toUserName = fromUserName
    info.fromUserName = toUserName

    return tpl.compiled(info)

}





