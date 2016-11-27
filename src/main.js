import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import Plugins from './plugins';
import routes from './js/routes';

require('./assets/css/font-awesome.min.css');
require('./assets/css/animate.css');
require('./scss/base.scss');

// vueRouter
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(Plugins);

const router = new VueRouter({ routes });

// jscs:disable
/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<router-view></router-view>',
  router
});
