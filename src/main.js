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
import 'element-ui/lib/theme-chalk/index.css'
// 导入第三方树形库
import TreeTable from 'vue-table-with-tree-grid'
// 导入时间过滤器
import './filter/Filter'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false

window.vm = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
