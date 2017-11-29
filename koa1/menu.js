"ues strict"


/*暴露接口 存放 menu 的信息 比如一级菜单二级菜单 还有菜单的名字
"type": "click",  这是点击事件 view 点击跳转到指定的 URL  具体在微信的文档有很详细的说明
"name": "最热", 菜单的名字
"key": "movie_hot", 用户点击以后传到后台
"sub_button": [] 子 菜单 一个上拉的菜单
*/
module.exports = {
   "button":[
      {  
        "name": "排行榜",
        "sub_button":[
          {  
            "type": "click",
            "name": "热热热",
            "key": "movie_hot",
            "sub_button": []
          },
          {  
            "type": "click",
            "name": "最冷",
            "key": "movie_cold",
            "sub_button": []
          }
        ]
      },
      {  
        "name": "分类",
        "sub_button":[
          {  
            "type": "click",
            "name": "犯罪",
            "key": "movie_crime",
            "sub_button": []
          },
          {  
            "type": "click",
            "name": "动画",
            "key": "movie_cartoon",
            "sub_button": []
          },
          {
          "name":"地理位置的选择",
          "type" : "location_select",
          "key":"location_select"
        }
        ]
      },
      {  
        "type": "click",
        "name": "帮助",
        "key": "help",
        "sub_button":[
          {
          "type" : "scancode_push",
          "name":"扫码推送时空哦上搭建哦啊打击打击的",
          "key":"qr_scan"
        },{
          "type" : "view",
          "name":"跳转到H5网页",
          "url":"http://wechat.lipc.xin/"
        }
        ]
      }
    ]
}

// module.exports = {
//   "button" : [
//     {
//       "name":"宝和金融",
//       "type" : "click",
//       "key":"menu_click"
//     },
//     {
//       "name":"点出菜单",
//       "sub_button":[
//         {
//           "type" : "click",
//           "name":"跳转到H5网页",
//           "key":"http://wechat.lipc.xin/"
//         },
//         {
//           "type" : "scancode_push",
//           "name":"扫码推送时空哦上搭建哦啊打击打击的",
//           "key":"qr_scan"
//         },
//         {
//           "name":"弹出系统拍照",
//           "type" : "pic_sysphoto",
//           "key":"pic_sysphoto"
//         },
//         {
//           "name":"扫码推送",
//           "type" : "scancode_waitmsg",
//           "key":"waitmsg"
//         },
//         {
//           "name":"弹出拍照或者相册",
//           "type" : "pic_sysphoto_or_album",
//           "key":"pic_sysphoto_or_album"
//         }   
//       ]
//     },
//     {
//       "name":"点出菜单2",
//       "sub_button":[
//         {
//           "name":"点击事件",
//           "type" : "click",
//           "key":"menu_click"
//         },
//         {
//           "type" : "pic_weixin",
//           "name":"扫码推送时空哦上搭建哦啊打击打击的",
//           "key":"pic_weixin"
//         },
//         {
//           "name":"地理位置的选择",
//           "type" : "location_select",
//           "key":"location_select"
//         }
//       ]
//     }
//   ]
// }


























