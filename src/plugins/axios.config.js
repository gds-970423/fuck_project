import Vue from 'vue'
// 配置axios 全局请求 配置请求的根路径
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置相应拦截器
axios.interceptors.response.use(response => {
  // 解析服务器返回的数据
  const { data: res } = response
  // 获取 meta 对象
  const meta = res.meta
  // 判断服务器返回信息是否正确
  if (meta.status !== 200 && meta.status !== 201) {
    //   不正确提示用户
    //   必须保证两点:
    //   1. elemntUI 的 message 组件已经挂载到 vue 的原型中
    //   2. vue 的实例被赋值到全局 window 对象下的 vm 属性中
    window.vm.$message.error(meta.msg)
    return null
  }
  // 返回操作真正需要的数据
  return res.data
})
// 设置请求拦截器
axios.interceptors.request.use(config => {
  // 为所有的请求添加上 token 请求头
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios