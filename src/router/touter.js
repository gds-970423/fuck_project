import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login.vue'
import Home from '../views/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/user.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/Goods/Cate.vue'
import List from '../components/Goods/List.vue'
import Params from '../components/Goods/Params.vue'
import Add from '../components/Goods/Add.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/goods', component: List },
        { path: '/params', component: Params },
        { path: '/goods/add', component: Add }
      ]
    }
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
