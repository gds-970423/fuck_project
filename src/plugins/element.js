import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'
// 按需暴露所需要的 element 组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
