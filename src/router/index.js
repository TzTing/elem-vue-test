import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Index from '../components/index.vue'
import Users from '../components/usermanager/user.vue'
import Role from '../components/securitymanager/role.vue'
import Rights from '../components/securitymanager/rights.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import AddGood from '../components/goods/AddGood.vue'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home
  // },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/index',
    children: [
      { path: '/index', component: Index }
      , { path: '/users', component: Users }
      , { path: '/roles', component: Role }
      , { path: '/rights', component: Rights }
      , { path: '/categories', component: Cate }
      , { path: '/Params', component: Params }
      , { path: '/goods', component: List }
      , { path: '/goods/add', component: AddGood }
    ]
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = new VueRouter({
  routes
})

export default router
