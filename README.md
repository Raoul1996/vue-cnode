# Vue-CNode

## 介绍

- 用 Vue 做的 [CNode](https://cnodejs.org/) 官网，一个单页面应用， 实现了所有的API功能。
- [Material Design](https://getmdl.io/index.html)风格，参考了[mdbootstrap](https://github.com/mdbootstrap/bootstrap-material-design)
- [预览地址](https://jiananle.github.io/vue-cnode/index.html#/)
- 项目结构由[Vue的脚手架](http://vue-loader.vuejs.org/en/start/setup.html)生成

## 注意

- 对于登录功能，由于没有相应的API，所以这里就简单粗暴直接使用[accessToken](https://cnodejs.org/api)进行登录了 ╮(╯_╰)╭
- 使用现代浏览器进行浏览(最好是chrome)

## 开始

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## 技术栈

- [Vue2.0](https://cn.vuejs.org/)
- [Vue-Router](https://router.vuejs.org/zh-cn/)
- [Vue-loader](http://vue-loader.vuejs.org/en/features/es2015.html)
- [Vue-resource](https://github.com/pagekit/vue-resource)
- [animate.css](https://daneden.github.io/animate.css/)
- [Snap](http://snapsvg.io/)

## 参考的项目

- [bootstrap](https://github.com/twbs/bootstrap) 
-  [mdbootstrap](https://github.com/mdbootstrap/bootstrap-material-design)
- [element UI Toolkit for web](https://github.com/ElemeFE/element)
- [Page Loading Effects](http://tympanus.net/codrops/2014/04/23/page-loading-effects/)

## 坑

- 页面设计真是个技术活（我爱 [dribbble](https://dribbble.com/), [codrops](http://tympanus.net/codrops/) ）
- svg也是个技术活，但是带来的效果是真给力
- 要在项目使用Snap，也各种操蛋 （[解决](https://github.com/negomi/react-burger-menu/commit/1b4a99906601c04d13c8ae27f13e77eaa1cc559a)）

## 后续

- 持续优化
- [Vuex](https://vuex.vuejs.org/zh-cn/)
- 适配移动端
- 合理有效的应用svg
