<template>
    <a v-show="show" class="btn-font" 
    @click="isShow=!isShow"
    :class="[
        {
            'active': isShow
        }
    ]"
     >
        <span>字号</span>
        <ul class="font-list" v-show="isShow">
            <li class="font-list-s" v-for="item in size_data" 
                @click="changeRootFontSize(item.size)"
                >{{item.name}}</li>
        </ul>
    </a>
</template>
<script>
    import {mapMutations} from 'vuex';
    import {on,off} from '../../../utils/dom';
    export default {
        name: 'fontsize',
        props: {
            show: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                isShow: false,
                size_data:[
                    {name: '大', size: 1.2},
                    {name: '中', size: 1},
                    {name: '小', size: 0.8}
                ]
            }
        },
        methods:{
            ...mapMutations(['changeFontSize']),
            changeRootFontSize(size){
                this.changeFontSize(size);
            },
            handleDocumentClick(evt){
                const isContains = this.$el.contains(evt.target);
                if(!isContains){
                    this.isShow = false;
                }
            }
        },
        watch: {
            isShow(val){
                if(val){
                    setTimeout(()=>{
                        on(document, 'click', this.handleDocumentClick);
                    },100)
                    
                }else{
                    off(document, 'click', this.handleDocumentClick);
                }
            }
        }
    }
</script>