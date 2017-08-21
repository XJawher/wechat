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






















