import Vue from 'vue'
import App from './App.vue'
import router from './router/touter.js'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 导入 字体图标
import './assets/fonts/iconfont.css'
// 引入 axios 配置
import './plugins/axios.config.js'
Vue.config.productionTip = false

window.vm = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
