import Vue from 'vue'
import App from './App.vue'
import router from './router/touter.js'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 导入 字体图标
import './assets/fonts/iconfont.css'
// 配置axios 全局请求 配置请求的根路径
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
