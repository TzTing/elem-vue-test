import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import Vuex from 'vuex'


Vue.config.productionTip = false

// axios.defaults.baseURL = 'http://127.0.0.1:9999/'

axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'


//请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config;
})

//响应拦截器
axios.interceptors.response.use(function (res) 
{
  // 对响应数据做点什么
   if (res && res.data) 
   {
      return  res.data
   }
   else if(res.data.meta.status == 400)
   {
    window.$toast(res.data.msg);
      uni.switchTab({
      url: '/login'
    })
   }
   /* else
   {
    if(res.config.showError)
    {
      //如何请求失败，开启了错误提示；进行提示
      window.$toast(res.data.msg)
                  
    }
    return Promise.reject(res.data)
  } */
}
// ,function (error)
//   {
//       // 对响应错误做点什么;没有权限401，去登录界面
//     if(error.response.status === 401) 
//     {
//       window.$toast('登录超时')
//       setTimeout(() => {
//           uni.switchTab({
//               url: '/pages/home/home'
//           })
//       },1000)
//     }
//     else if(error.response.status === 403) 
//     {
//         window.$toast('暂无权限')
//     }
//     else 
//     {
//         window.$toast('网络错误')
//     }

//   /* console.log("=====>")
//   console.log(res)
//   console.log("=====>") */
//   return res.data;
//   // return Promise.reject(error);
//  }
);

Vue.use(Vuex)
Vue.prototype.$http = axios;

const store = new Vuex.Store({
  state: {
    count: 0,
    token: ''
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})

new Vue({
  router,
  store: store,
  render: h => h(App) 
}).$mount('#app')
