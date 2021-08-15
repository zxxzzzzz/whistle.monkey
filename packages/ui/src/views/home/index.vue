<template lang="pug">
div(class="flex flex-col h-full pt-4")
  div(class="flex")
    a-input(addon-before="mock文件地址" v-model:value="root" placeholder="请输入地址" @pressEnter="handleClick")
    a-button(@click="handleClick") 确定
  div(class="overflow-auto mt-4")
    a-list(size="small" bordered :data-source="items")
      template(#renderItem="{ item }")
        a-list-item 
          a-list-item-meta
            template(#description)
              a-tag(color="pink") {{getReadableDate(item.date)}}
              a-tag(v-for="co in item.tagsComponents" :color="co.color" :key="co.tag") {{co.tag}}
                component(v-if="co.icon" :is="co.icon" #icon class="align-middle")
              span(v-html="item.message")
</template>
<script lang="ts">
import { setRoot,getRoot } from '@/api/request';
import { defineComponent,ref,reactive } from 'vue'
import {socket} from '@/api/log';
import { message } from 'ant-design-vue';
import {PlusOutlined, CheckCircleOutlined, RedoOutlined, PlayCircleOutlined} from '@ant-design/icons-vue';
interface Log {
  type:'error'|'warning'|'info'|'success',
  message:string,
  date: number,
  tags?:string[],
  tagsComponents?:any[]
}
 function getTagProp(tag:string){
  if(tag === '命中') return {color:'green', tag, icon:CheckCircleOutlined }
  if(tag === '添加') return {color:'cyan', icon:PlusOutlined, tag }
  if(tag === '更新') return {color:'blue', icon:RedoOutlined, tag }
  if(tag === '函数') return {color:'#2db7f5', icon:PlayCircleOutlined, tag }
  return {color:'', tag}
}
export default defineComponent({
  name: 'App',
  setup(){
    const root = ref('')
    getRoot().then((res) => {
        root.value = res.path
    })
    const items = reactive([] as Log[])
    socket.addEventListener('message',  (event) => {
      const log:Log = JSON.parse(event.data)
      log.tagsComponents = (log.tags || []).map(tag => getTagProp(tag)) 
      items.push(log) 
    });
    return {
      root,
      items
    }
  },
  methods:{
    handleClick(){
      if(!this.root){
        message.error('请输入地址');
        return
      }
      setRoot(this.root)
    },
    getReadableDate(val:number){
      return new Date(val).toLocaleString()
    }
  }
})
</script>
<style lang="stylus" module>

</style>