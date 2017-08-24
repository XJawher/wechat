let config = require('./config')

let Wechat = require('./wechat/wechat')

let wechatApi = new Wechat(config.wechat)


exports.reply = function *(next) {
let message = this.weixin
console.log('message：' + message)

if(message.MsgType === 'event') {
    if(message.Event === 'subscribe') {
        if(message.EventKey) {
            console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
        }
        this.body = '哈哈，你订阅了这个号\r\n'
    } else if(message.Event === 'unsubscribe') {
        console.log('取关')
        this.body = ''
    } else if(message.Event === 'LOCATION') {
        this.body = '您的地理位置是: ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
    } else if(message.Event === 'CLICK') {
        this.body = '您点击了菜单' + message.EventKey
    } else if(message.Event === 'SCAN') {
        console.log('关注后扫二维码：' + message.EventKey + ' ' + message.ticket )
        this.body = '扫一下'
    } else if(message.Event === 'view') {
        this.body = '您单击了菜单中的链接：' + message.EventKey
    }
} else if(message.MsgType === 'text') {
    let content = message.Content
    let reply = '您说的 ' + message.Content + ' 太复杂'

    if(content === '1') {
        reply = '第一'
    } else if(content === '2') {
        reply = '第二'
    } else if(content === '3') {
        reply = '第三'
    } else if(content === '4') {
        reply = [{
            title: '技术改变世界',
            description: '简单描述',
            picUrl: 'https://github.com/fluidicon.png',
            url: 'https://github.com/xxxgitone'
        },{
            title: '技术改变世界222',
            description: '简单描述ss',
            picUrl: 'https://github.com/fluidicon.png',
            url: 'https://github.com'
        }]
    } else if(content === '5') {
        let data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg')

        reply = {
            type: 'image',
            mediaId: data.media_id
        }
    } else if(content === '6') {
        let data = yield wechatApi.uploadMaterial('video', __dirname + '/2.mp4')

        reply = {
            type: 'video',
            title: '回复视频内容',
            description: '瞎说',
            mediaId: data.media_id
        }
    } else if(content === '7') {
//音乐不用上传素材，但是需要封面
let data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg')

reply = {
    type: 'music',
    title: '回复音乐内容',
    description: '放松',
    musicUrl: 'http://play.baidu.com/?__m=mboxCtrl.playSong&__a=540175998&__o=song/540175998||playBtn&fr=-1||-1#',
    thumbMediaId: data.media_id
}
} else if(content === '8') {//永久素材
    let data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg', {type: 'image'})

    reply = {
        type: 'image',
        mediaId: data.media_id
    }
} else if(content === '9') {
    let data = yield wechatApi.uploadMaterial('video', __dirname + '/2.mp4', {type: 'video', description: '{"title": "nice", "introduction": "SO EASY"}'})

    reply = {
        type: 'video',
        title: '回复视频内容',
        description: '瞎说',
        mediaId: data.media_id
    }
}
else if(content === '10') {
  let counts = yield wechatApi.countMaterial()
  console.log(JSON.stringify(counts))
/*使用 yield 这个高级语法 可以支持高并发*/
  let result = yield [
    wechatApi.batchMaterial({
      type: 'image',
      offset:'0',
      count:10
  }),
    wechatApi.batchMaterial({
      type: 'video',
      offset:'0',
      count:10
  }),
    wechatApi.batchMaterial({
      type: 'voice',
      offset:'0',
      count:10
  }),
    wechatApi.batchMaterial({
      type: 'news',
      offset:'0',
      count:10
  })
  ]
  console.log(result)
  reply = '测试统计模板'
  // let lists1 = yield wechatApi.batchMaterial({
  //   type: 'image',
  //   offset:'0',
  //   count:10
  // })
  // let lists2 = yield wechatApi.batchMaterial({
  //   type: 'video',
  //   offset:'0',
  //   count:10
  // }) 
  // let lists3 = yield wechatApi.batchMaterial({
  //   type: 'voice',
  //   offset:'0',
  //   count:10
  // })
  // let lists4 = yield wechatApi.batchMaterial({
  //   type: 'news',
  //   offset:'0',
  //   count:10
  // })
}
else if(content === '11') {
  let group = yield wechatApi.createGroup('weixin')
  
  console.log('create a new group weixin')
  console.log(group)

  let groups = yield wechatApi.fetchGroups()
  console.log('the groups then add weixin')
  console.log(groups)

  reply = '测试分组功能'




}




this.body = reply
}

yield next
}

