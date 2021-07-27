'use strict'
// 全局声明插件代号
const pluginname = 'butterfly_footer_beautify'
// 全局声明依赖
const pug = require('pug')
const path = require('path')
const urlFor = require('hexo-util').url_for.bind(hexo)
const util = require('hexo-util')

hexo.extend.filter.register('after_generate', function (locals) {
  // 首先获取整体的配置项名称
  const config = hexo.config.footer_beautify ? hexo.config.footer_beautify : hexo.theme.config.footer_beautify
  // 如果计时器或徽标任意一个配置开启
  if (!(config && (config.enable.bdage || config.enable.timer))) return
  // 集体声明配置项
    const data = {
      timer_enable: config.enable.timer ? config.enable.timer : true,
      bdage_enable: config.enable.bdage ? config.enable.bdage : true,
      enable_page: config.enable_page ? config.enable_page : "all",
      exclude: config.exclude,
      layout_type: config.layout.type,
      layout_name: config.layout.name,
      layout_index: config.layout.index ? config.layout.index : 0,
      runtime_js: config.runtime_js ? urlFor(config.runtime_js) : "https://cdn.jsdelivr.net/npm/hexo-butterfly-footer-beautify/lib/runtime.min.js",
      runtime_css: config.runtime_css ? urlFor(config.runtime_css) : "https://cdn.jsdelivr.net/npm/hexo-butterfly-footer-beautify/lib/runtime.min.css",
      bdageitem: config.bdageitem ? config.bdageitem : [{"link": "https://hexo.io/","shields": "https://img.shields.io/badge/Frame-Hexo-blue?style=flat&logo=hexo","message": "博客框架为Hexo"},{"link": "https://butterfly.js.org/","shields": "https://img.shields.io/badge/Theme-Butterfly-6513df?style=flat&logo=bitdefender","message": "主题使用Butterfly"}]
    }
  // 渲染页面
  const temple_html_text = config.temple_html ? config.temple_html : pug.renderFile(path.join(__dirname, './lib/html.pug'),data)
  //cdn资源声明
    //样式资源
  const css_text = `<link rel="stylesheet" href="${data.runtime_css}" media="defer" onload="this.media='all'">`
    //脚本资源
  const js_text = `<script async src="${data.runtime_js}"></script>`
  //注入容器声明
  var get_layout
  //若指定为class类型的容器
  if (data.layout_type === 'class') {
    //则根据class类名及序列获取容器
    get_layout = `document.getElementsByClassName('${data.layout_name}')[${data.layout_index}]`
  }
  // 若指定为id类型的容器
  else if (data.layout_type === 'id') {
    // 直接根据id获取容器
    get_layout = `document.getElementById('${data.layout_name}')`
  }
  // 若未指定容器类型，默认使用id查询
  else {
    get_layout = `document.getElementById('${data.layout_name}')`
  }

  //挂载容器脚本
  var user_info_js = `<script data-pjax>
  function ${pluginname}_injector_config(){
    var parent_div_git = ${get_layout};
    var item_html = '${temple_html_text}';
    console.log('已挂载${pluginname}')
    parent_div_git.insertAdjacentHTML("afterbegin",item_html)
    }
  var elist = '${data.exclude}'.split(',');
  var cpage = location.pathname;
  var epage = '${data.enable_page}';
  var flag = 0;

  for (var i=0;i<elist.length;i++){
    if (cpage.includes(elist[i])){
      flag++;
    }
  }

  if ((epage ==='all')&&(flag == 0)){
    ${pluginname}_injector_config();
  }
  else if (epage === cpage){
    ${pluginname}_injector_config();
  }
  </script>`
  // 注入用户脚本
  // 此处利用挂载容器实现了二级注入
  hexo.extend.injector.register('body_end', user_info_js, "default");
  // 注入样式资源
  hexo.extend.injector.register('body_end', js_text, "default");
  // 注入脚本资源
  hexo.extend.injector.register('head_end', css_text, "default");
},
hexo.extend.helper.register('priority', function(){
  // 过滤器优先级，priority 值越低，过滤器会越早执行，默认priority是10
  const pre_priority = hexo.config.footer_beautify.priority ?  hexo.config.footer_beautify.priority : hexo.theme.config.footer_beautify.priority
  const priority = pre_priority ? pre_priority : 10
  return priority
})
)
