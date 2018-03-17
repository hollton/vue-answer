/*
 * 遮罩
 * <fa-loading :visible="visible" :text=""></fa-loading>
 */
<template>
  <div class="fa-loading" v-show="visible">
      <div class="mask"></div>
      <div class="content">
          <ins></ins>
          <p v-text="text"></p>
      </div>
  </div>
</template>

<script>
    export default {
        name: 'FaLoading',
        props:{
            visible:Boolean,
            text: {
                type: String,
                default: '正在加载...'
            }
        }
    };
</script>