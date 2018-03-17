<template>
  <div class="fa-dialog" v-show="visible">
      <div class="fa-dialog__wrap">
          <div class="fa-dialog__header">
              <div class="fa-dialog__title">{{title}}</div>
              <i class="fa-dialog__close" @click="handleClose">X</i>
          </div>
          <div class="fa-dialog__body">
              <slot></slot>
          </div>
          <div class="fa-dialog__footer">
              <slot name="footer"></slot>
          </div>
      </div>
  </div>
</template>

<script>
    export default {
        name: 'FaDialog',
        props: {
            title: {
                type: String,
                default: '提示'
            },
            value:{
                type: Boolean,
                default: false
            },
            beforeClose: Function
        },
        watch: {
            value(val) {
                this.visible = val;
            },
            visible(val){
                this.$emit('input', val);
                if(!val && this.beforeClose){
                    this.beforeClose();
                }

                if(val){
                    document.body.style.overflow = 'hidden';
                }else{
                    document.body.removeAttribute('style');
                }
            }
        },
        methods: {
            handleClose(){
                this.visible = false;
                this.$emit('input', false);
            }
        },
        data(){
            return {
                visible: false
            }
        },
        mounted(){
            if(this.value){
                this.visible = this.value;
            }
        }
    }
</script>