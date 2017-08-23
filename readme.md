## 验证初步成功   
具体代码请看我 commit 的内容  
## 第二次 commit 实践中间件  
这一次实验一下 koa 的中间件    
**koa 和 express**     
这两个都是 node 中非常优秀的框架，在这俩框架中中间件可以看做是一个加工流水线，每一个中间件都是一道工序，每个工序都负责做自己的一件事，整个的流水线工艺就是通过不同的工序通过各自完成各自的工作，然后整合。 express 中间件内部都是通过 next 往下执行，一个又一个的中间件中的 next 包含一个回调函数   
这里的 koa 框架版本是 **1.x**，在 **2x** 版本中中间件不再使用 **yield next** 而是 **async+await**     
在这里用的是 **koa@1.2** 版本   
## 第三次 commit 掌握 access_token          
**access_token** 是公众号的全局唯一票据，是和微信交互的一把钥匙，和微信做任何的交互都需要 **access_token** 。    
**access_token** 每两个小时过期，也就是 **7200** ，所以系统最好是没两个小时刷新一次，这样保证不论何时我们调用，票据都是保证最新的。           
为了方便频繁的调用，我们要把这个 ，**access_token** 放在一个唯一的地方，这个唯一的地方可以随时被我们的子系统访问到。
新增一个构造函数，用它来生成实例，在这个实例生成的时候我们可以做一些初始化的工作
现在假设服务器上有一个文件，存储的是老的旧的 AcessToken 文件和过期信息，首先我们要读一下
这个文件，来判断这个票据是不是过期，如果过期，我们重新向微信服务器申请一次，然后再重新写入一次。有两个点要考虑一下，就是读出和写入，由于 g.js 是一个中间件，这个中间件只应该负责和微信的交互过程，而不应该干涉外面的业务逻辑，所以读取票据信息和写入票据信息的逻辑我们应该独立出来，再业务层里处理
## 第四次 commit 简单的回复功能   
由于微信服务器给我们推送的消息不是 JSON 而是 XML，推送的方式是 POST。   
大致的流程就是    
1. 处理 POST 类型的控制逻辑，接受这个 XML 的数据包     
2. 解析这个数据包（获得数据包的消息类型或者是事件类型）     
3. 拼装出我们定义好的消息   
4. 包装成 XML 的格式   
5. 在 5 秒内返回回去   
## 第五次 commit 封装消息模块
这次的 commit 的中心是封装消息模块，这里在 wechat 下创建了一个新的模板文件，tpl.js  
heredoc 和 ejs 这是两个很好用的模板库    
	    
	'use strict' 
	
	let ejs = require('ejs')
	let heredoc = require('heredoc')
	
	let tpl = heredoc(function () {
	 /*
		<xml> 
		  <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName> 
		  <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName> 
		  <CreateTime><%= createTime %></CreateTime>
		  <MsgType><![CDATA[<%= msgType %>]]></MsgType> 
		  <% if (msgType == 'text') {%>
		    <Content><![CDATA[<%- content %>]]></Content>
		  <% } else if (msgType == 'image') { %> 
		    <Image>
		      <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
		    </Image>
		  <% } else if (msgType == 'voice') { %> 
		    <Voice>
		      <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
		    </Voice>
		  <% } else if (msgType == 'video') { %> 
		    <Video>
		      <MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
		      <Title><![CDATA[<%= content.title %>]]></Title>
		      <Description><![CDATA[<%= content.description %>]]></Description>
		    </Video> 
		  <% } else if (msgType == 'music') { %> 
		    <Music>
		      <Title><![CDATA[<%= content.title %>]]></Title>
		      <Description><![CDATA[<%= content.description %>]]></Description>
		      <MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
		      <HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
		      <ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
		    </Music>
		  <% } else if (msgType == 'news') { %> 
		    <ArticleCount><%= content.length %></ArticleCount>
		    <Articles>
		      <% content.forEach(function(item) { %>
		        <item>
		        <Title><![CDATA[<%= item.title %>]]></Title> 
		        <Description><![CDATA[<%= item.description %>]]></Description>
		        <PicUrl><![CDATA[<%= item.picUrl %>]]></PicUrl>
		        <Url><![CDATA[<%= item.url %>]]></Url>
		        </item>
		      <% }) %> 
		    </Articles>
		  <% } %>
		</xml>
	 */
	})
	
	/*上面写好了模板，现在需要做个编译，把这个模板暴露出去,这里写了一个对象，防止以后有其他的模板
	通过写入对象中，不再写别的暴露的接口，尽量的使代码优雅，简单
	*/
	let compiled = ejs.compile(tpl)
	
	exports = module.exports = {
	  compiled : compiled
	}

## 第五次 commit 实现自动回复
在做这个的时候有很多莫名其妙的坑，特别是 XML 模板那块，要非常的仔细小心才行。
## 第六次 commit 实现临时素材的上传     
下面是腾讯官方的临时素材的要求，这个临时素材他们只保存三天
    
	新增临时素材
	公众号经常有需要用到一些临时性的多媒体素材的场景，例如在使用接口特别是发送消息时，
	对多媒体文件、多媒体消息的获取和调用等操作，是通过media_id来进行的。
	素材管理接口对所有认证的订阅号和服务号开放。通过本接口，公众号可以新增临时素材（即上传临时多媒体文件）。
	注意点：
	1、临时素材media_id是可复用的。
	2、媒体文件在微信后台保存时间为3天，即3天后media_id失效。
	3、上传临时素材的格式、大小限制与公众平台官网一致。
	    图片（image）: 2M，支持PNG\JPEG\JPG\GIF格式
	    语音（voice）：2M，播放长度不超过60s，支持AMR\MP3格式
	    视频（video）：10MB，支持MP4格式
	    缩略图（thumb）：64KB，支持JPG格式
	4、需使用https调用本接口。
	
	接口调用请求说明
	http请求方式：POST/FORM，使用https
	https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
	调用示例（使用curl命令，用FORM表单方式上传一个多媒体文件）：
	curl -F media=@test.jpg "https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE"
	参数说明
	参数	是否必须	说明
	access_token	是	调用接口凭证
	type	
	是
	媒体文件类型，分别有图片（image）、语音（voice）、视频（video）和缩略图（thumb）
	media	是	form-data中媒体文件标识，有filename、filelength、content-type等信息
	返回说明
	正确情况下的返回JSON数据包结果如下：
	{"type":"TYPE","media_id":"MEDIA_ID","created_at":123456789}
	参数	描述
	type	媒体文件类型，分别有图片（image）、语音（voice）、视频（video）和缩略图（thumb，主要用于视频与音乐格式的缩略图）
	media_id	媒体文件上传后，获取标识
	created_at	媒体文件上传时间戳
	错误情况下的返回JSON数据包示例如下（示例为无效媒体类型错误）：
	{"errcode":40004,"errmsg":"invalid media type"}

官方对临时素材的要求比较多，所以在开发的时候要非常细心      

在写上传文件的原型的时候遇到的一个坑，就是在已经有了 **that = this** 的时候不能再写一个，就算在 promise 内部也是不行的     
   
	  return new promise(function (resolve,reject) {
	    that
	      .fetchAccessToken()/*拿到全局票据*/
	      .then(function (data) {/*在这里面构建请求的 URL */
	        let url = api.upload + 'access_token=' + data.access_token + '&type=' + type
	
	        /*request 向某个服务器发起 get 或者 post 请求*/
	        request({method:'POST', url:url,formData:form, json:true}).then(function (response) {
	          let _data = response.body
	          if (_data) {
	            resolve(_data)
	          }
	          else {
	            throw new Error('upload material mirror')
	          }
	        })
	        .catch(function (err) {
	          reject(err) 
	        })  
	      })   
	  })

## 实现永久素材的上传   
下面是微信官方对于永久素材的一个定义 
  
	对于常用的素材，开发者可通过本接口上传到微信服务器，永久使用。
	新增的永久素材也可以在公众平台官网素材管理模块中查询管理。
	请注意：
	1、最近更新：永久图片素材新增后，将带有URL返回给开发者，
	  开发者可以在腾讯系域名内使用（腾讯系域名外使用，图片将被屏蔽）。
	2、公众号的素材库保存总数量有上限：图文消息素材、图片素材上限为5000，其他类型为1000。
	3、素材的格式大小等要求与公众平台官网一致：
	    图片（image）: 2M，支持bmp/png/jpeg/jpg/gif格式
	    语音（voice）：2M，播放长度不超过60s，mp3/wma/wav/amr格式
	    视频（video）：10MB，支持MP4格式
	    缩略图（thumb）：64KB，支持JPG格式
	4、图文消息的具体内容中，微信后台将过滤外部的图片链接，
	  图片url需通过"上传图文消息内的图片获取URL"接口上传图片获取。
	5、"上传图文消息内的图片获取URL"接口所上传的图片，不占用公众号的素材库中图片
	数量的5000个的限制，图片仅支持jpg/png格式，大小必须在1MB以下。
	6、图文消息支持正文中插入自己帐号和其他公众号已群发文章链接的能力。   

**图片素材上限为5000，其他类型为1000** 这个值得注意    
我这里在做永久素材上传的时候发生了 **48001** 这个错误的代码，说是个人的微信公众号不支持认证所以没有接口的权限，暂时把这个先放下













