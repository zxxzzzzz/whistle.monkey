<template lang="pug">
div(class="flex")
  a-input(addon-before="mock文件地址" v-model:value="root" placeholder="请输入地址")
  a-button(@click="handleClick") 确定
</template>
<script lang="ts">
import { setRoot } from '@/api/request';
import { defineComponent,ref } from 'vue'
export default defineComponent({
  name: 'App',
  setup(){
    return {
      root: ref('')
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