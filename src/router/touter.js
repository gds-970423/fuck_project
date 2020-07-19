import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login.vue'
import Home from '../views/home.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }

  ]
})
// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问登陆页面直接放行
  if (to.path === '/login') return next()
  // 保存登录时获取到的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token  强制跳转到登录页面
  if (!tokenStr) return next('/login')
  // 如果有 直接放行
  next()
})

export default router
