import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import router from '@/router/index';
import './index.css'


const app = createApp(App);
app.use(router)
app.use(Antd);

app.mount('#app')
