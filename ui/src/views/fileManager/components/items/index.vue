<template lang="pug">
a-tree(:treeData="treeData" show-icon v-model:selectedKeys="selectedKeys" v-model:expandedKeys="selectedKeys")
  template(#folder="{ selected }")
    FolderOpenTwoTone(v-if="selected")
    FolderTwoTone(v-else)
  template(#file)
    FileTwoTone
</template>
<script lang="ts">
import { defineComponent, ref, PropType } from "vue";
import { TreeDataItem } from "ant-design-vue/es/tree/Tree";
import { FolderOpenTwoTone, FolderTwoTone, FileTwoTone } from "@ant-design/icons-vue";
import { Item,ITEM_TYPE } from "@/interface/item";

function getTreeData(item:Item): TreeDataItem{
    if(item.type === ITEM_TYPE.file){
      return {
          title: item.name,
          key: item.path,
          slots: { icon: "file" }
        }
    }
    const children = (item.children || []).map(child => getTreeData(child))
    return {
      title: item.name,
      key: item.path,
      slots: { icon: "folder" },
      children
    }
}

export default defineComponent({
  components: { FolderOpenTwoTone, FolderTwoTone, FileTwoTone },
  props:{
    items:{
      type: Object as PropType<Item[]>,
      default: ()=>[]
    }
  },
  setup(props) {
    console.log((props.items || []).map(item => getTreeData(item)));
    return {
      selectedKeys: ref(['0-0-0']),
      treeData: (props.items || []).map(item => getTreeData(item))
    };
  },
});
</script>
