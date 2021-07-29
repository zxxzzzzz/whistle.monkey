import Home from '@/views/home/index.vue';
import {createRouter,createWebHashHistory} from 'vue-router';

const routes = [
  {path:'/',redirect:'/home'},
  {path: '/home', component:Home}
]
export default createRouter({routes, history:createWebHashHistory()})