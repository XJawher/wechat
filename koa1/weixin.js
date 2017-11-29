
let menu = require('./menu')
let path = require('path')


let config = require('./config')

let Wechat = require('./wechat/wechat')

let wechatApi = new Wechat(config.wechat)
/*为了保险起见，先把删除一个重新初始化*/
wechatApi.deleteMenu().then(function(){
    return wechatApi.createMenu(menu);
}).then(function(msg){
    console.log(msg);
});

exports.reply = function *(next) {
let message = this.weixin
console.log('message：' + message)

if(message.MsgType === 'event') {
    if(message.Event === 'subscribe') {
        if(message.EventKey) {
            console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
        }
        this.body = '小傻逼 ，么么哒 \r\n'
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
    } else if(message.Event === 'VIEW') {
        this.body = '宝和金融' + message.EventKey
    }else if(message.Event === 'scancode_push') {
        this.body = 'scancode_push：扫码推事件的事件推送' + message.EventKey
        console.log(message.ScanCodeInfo.ScanType)
        console.log(message.ScanCodeInfo.ScanResult)
    }else if(message.Event === 'location_select') {/*
        
        console.log(message.SendLocationInfo.Location_X)
        console.log(message.SendLocationInfo.Location_Y)
        console.log(message.SendLocationInfo.Scale)
        console.log(message.SendLocationInfo.Label)
        console.log(message.SendLocationInfo.Poiname)*/
        this.body = '位置信息' + message.EventKey
    }else if(message.Event === 'pic_sysphoto_or_album') {
        this.body = 'pic_photo_or_album：弹出拍照或者相册发图的事件推送' + message.EventKey
        console.log(message.ScanCodeInfo.Count)
        console.log(message.ScanCodeInfo.PicList)
    }else if(message.Event === 'pic_sysphoto') {
        this.body = 'pic_sysphoto：弹出系统拍照发图的事件推送' + message.EventKey
        console.log(message.ScanCodeInfo.Count)
        console.log(message.ScanCodeInfo.PicList)
    }else if(message.Event === 'pic_weixin') {
        this.body = 'pic_weixin：弹出微信相册发图器的事件推送' + message.EventKey
        console.log(message.ScanCodeInfo.Count)
        console.log(message.ScanCodeInfo.PicList)
    }else if(message.Event === 'scancode_waitmsg') {
        this.body = 'scancode_waitmsg：扫码推事件且弹出“消息接收中”提示框的事件推送' + message.EventKey
        console.log(message.ScanCodeInfo.ScanType)
        console.log(message.ScanCodeInfo.ScanResult)
    }
} else if(message.MsgType === 'text') {
    let content = message.Content
    let reply =   message.Content + ' 太复杂等机器人来了给你解释，我还没升级'

    if(content === '1') {
        reply = '爱我'
    } else if(content === '2') {
        reply = '爱我还是吃屎'
    } else if(content === '3') {
        reply = '我爱你啊 亲亲 木啊'
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
            title: '小可爱胡巴',
            description: '胡巴胡巴',
            mediaId: data.media_id
        }
    } else if(content === '7') {
//音乐不用上传素材，但是需要封面
let data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg')

reply = {
    type: 'music',
    title: '回复音乐内容',
    description: '随便找的',
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
            title: '小可爱胡巴',
            description: '胡巴胡巴',
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

else if(content === '12') {
  let user = yield wechatApi.fetchUsers(message.FromUserName,'en')
  
  console.log('fetch user')
  console.log(user)
  let openIds = [
    {
      openId:message.FromUserName,
      lang:'en'
    }
  ]
  let users = yield wechatApi.fetchUsers(openIds)

  console.log('fetch usersssssssss')
  console.log(users)

  reply = JSON.stringify(user)
}
else if(content === '13') {
  let userlist = yield wechatApi.listUsers()
  console.log(userlist)

  reply = userlist.total
}

else if(content === '14') {
  let mpnews= {
    media_id:'dkCmC6gOdnSs-qUok5Md3DqCqG-YkNz7H50bqMG064tnKVLuMeyvfmSjJp_XLXHd'
  }
  let text ={
    'content' : '测试群发文本'
  }
  let msgData = yield wechatApi.sendByGroup('text',text,0)
  console.log(msgData)
  reply = '群发测试'
}

else if(content === '15') {
  let text ={
    'content' : '测试 previewMass 预览  这里是预览文本'
  }
  let mpnews= {
    media_id:'dkCmC6gOdnSs-qUok5Md3DqCqG-YkNz7H50bqMG064tnKVLuMeyvfmSjJp_XLXHd'
  }

  let msgData = yield wechatApi.previewMass('text',text,0)
  console.log(msgData)
  reply = '测试 previewMass 预览'
}

this.body = reply
}

yield next
}

