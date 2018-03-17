<template>
    <div class="fa-pop">
        <div class="popup-wrap">
            <div class="popup-mask" v-show="useMask"></div>
            <div class="popup-content">
                <div class="popup-headtitle">
                    <h2 class="fl">{{title ? title : '提示'}}</h2>
                    <a class="popup-btn-close fr" @click="handleAction($event,'cancel')"></a>
                </div>
                <div class="popup-body">
                    <i class="icon-warning"></i>
                    <p class="text">{{message}}</p>
                </div>
                <div class="popup-bottom">
                    <fa-button class="btn-common" :type="'primary'" :size="'small'" @click.native="handleAction($event,'confirm')" v-show="yesBtnShow">{{yesBtn}}</fa-button>
                    <fa-button class="btn-common" :size="'small'" @click.native="handleAction($event,'cancel')" v-show="noBtnShow">{{noBtn}}</fa-button>
                </div>
            </div>
        </div>
    </div>
    
</template>

<script>
    import FaButton from '../../button';

    export default {
        name: 'FaPop',
        methods: {
            handleAction(evt,type){
                this.action = type;
                this.doClose();
            },
            doOpen(){
                document.body.style.overflow = 'hidden';
            },
            doClose(){
                if(this.callback){
                    this.callback(this.action,this);
                }
                this.isOpen = false;
                document.body.setAttribute('style','');
            }
        },
        data(){
            return{
                isOpen: true,
                title: undefined,
                message: '',
                action: '',
                callback: null,
                yesBtn: '',
                noBtn: '',
                type: '',
                yesBtnShow: true,
                noBtnShow: true,
                useMask: true
            }
        },
        mounted(){
            this.isOpen = true;
        },
        components:{
            FaButton
        }
    }
</script>