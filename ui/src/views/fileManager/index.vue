<template lang="pug">
div.flex.p-3.h-full
  div.rounded-sm.border-black.border-2(class="w-1/4")
    ComItems(:items="items")
  div.rounded-sm.border-black.border-2(class="w-3/4")
    div#editor(class="h-full")
</template>
<script lang="ts">
import { defineComponent,onMounted } from "vue";
import ComItems from "./components/items/index.vue";
import { StepBackwardFilled } from "@ant-design/icons-vue";
import { ITEM_TYPE,Item } from "@/interface/item";
import {initYaml} from '@/utils/yaml-monaco';
export default defineComponent({
  components: { ComItems, StepBackwardFilled },
  setup() {
    onMounted(() => {
     initYaml('#editor')
    })
    return {
      items:[
      {
        name: "parent 13",
        path: 'd:/123',
        type:ITEM_TYPE.file
      },
      {
        name: "parent 13",
        path: 'd:/1234',
        type:ITEM_TYPE.file
      },
      {
        name: 'f11231231111111111',
        path: 'd:/12345',
        children:[{
          name: "parent 13",
          path: 'd:/1234gg',
          type:ITEM_TYPE.file
        }],
        type:ITEM_TYPE.folder
      },
      {
        name: 'f1123123',
        path: 'd:/321',
        children:[],
        type:ITEM_TYPE.folder
      }
    ] as Item[]
    }
  },
});
</script>
<style lang="stylus" module></style>
