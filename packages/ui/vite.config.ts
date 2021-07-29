import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteComponents, {AntDesignVueResolver} from 'vite-plugin-components';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    outDir:'../whistle.monkey/public'
  },
  plugins: [
    vue(),
    ViteComponents({
      customComponentResolvers: [
        AntDesignVueResolver(),
      ]
    })
  ],
  resolve:{
    alias:[
      {find:'@/', replacement:path.resolve(__dirname, './src/') + '/'}
    ]
  }
})

