import FileManager from '@/views/fileManager/index.vue';
import {createRouter,createWebHistory} from 'vue-router';

const routes = [
  {path: '/', component:FileManager}
]
export default createRouter({routes, history:createWebHistory()})