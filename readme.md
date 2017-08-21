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
	  <ToUserName><![CDATA[<% toUserName %>]]></ToUserName>
	  <FromUserName><![CDATA[<% fromUserName %>]]></FromUserName>
	  <CreateTime><% createTime %></CreateTime>
	  <MsgType><![CDATA[<% msgType %>]]></MsgType>
	  <% if (msgType === 'text') { %>
	  <Content><![CDATA[<% content %>]]></Content>
	  <% } else if (msgType === 'image') { %>
	    <Image>
	      <MediaId><![CDATA[<% content.media_id %>]]></MediaId>
	    </Image> 
	  <% } else if (msgType === 'voice') { %>
	    <Voice>
	      <MediaId><![CDATA[<% content.media_id %>]]></MediaId>
	    </Voice>
	  <% } else if (msgType === 'voice') { %>
	    <Video>
	      <MediaId><![CDATA[<% content.media_id %>]]></MediaId>
	      <Title><![CDATA[<% content.title %>]]></Title>
	      <Description><![CDATA[<% content.description %>]]></Description>
	    </Video> 
	  <% } else if (msgType === 'music') { %>
	    <Music>
	      <Title><![CDATA[TITLE]]></Title>
	      <Description><![CDATA[<% content.description %>]]></Description>
	      <MusicUrl><![CDATA[<% content.musicUrl %>]]></MusicUrl>
	      <HQMusicUrl><![CDATA[<% content.hqMusicUrl %>]]></HQMusicUrl>
	      <ThumbMediaId><![CDATA[<% content.thumbMediaId %>]]></ThumbMediaId>
	    </Music>
	  <% } else if (msgType === 'news') { %>
	    <ArticleCount><% content.length %></ArticleCount>
	    <Articles>
	    <% content.forEach(function(item){ %>
	      <item>
	      <Title><![CDATA[<% item.title %>]]></Title> 
	      <Description><![CDATA[<% item.description %>]]></Description>
	      <PicUrl><![CDATA[<% item.picUrl %>]]></PicUrl>
	      <Url><![CDATA[<% item.url %>]]></Url>
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






















