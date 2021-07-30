<template lang="pug">
div(class="flex")
  a-input(addon-before="mock文件地址" v-model:value="root" placeholder="请输入地址")
  a-button(@click="handleClick") 确定
div()
  a-alert(v-for="item in items" :message="item.message" :type="item.type")
</template>
<script lang="ts">
import { setRoot } from '@/api/request';
import { defineComponent,ref,reactive } from 'vue'
import {socket} from '@/api/log';
interface Log {
  type:'error'|'warning'|'info'|'success',
  name:string,
  action:'add'|'delete'|'update',
  message:string
}
export default defineComponent({
  name: 'App',
  setup(){
      const items = reactive([] as any[])
      // Listen for messages
      socket.addEventListener('message',  (event) => {
        const log:Log = JSON.parse(event.data)
        items.push(log) 
      });

    
    return {
      root: ref(''),
      items
    }
  },
  methods:{
    handleClick(){
      setRoot(this.root)
    }
  }
})
</script>
<style lang="stylus" module>

</style>