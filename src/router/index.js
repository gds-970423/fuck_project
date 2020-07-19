import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login.vue'
Vue.use(VueRouter)

const routes = [

]

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login }
  ]
})

export default router
