<template>
    <a v-show="initPaperStatu.showAnswer" class="btn-false" :class="{'active':isOnlyError}" @click="viewError"><span>只看错题</span></a>
</template>
<script>
import { mapState, mapMutations, mapGetters } from 'vuex';
export default {
    name: 'viewError',
    props: {
        show: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            isOnlyError: false
        };
    },
    computed:{
        ...mapGetters(['initPaperStatu']),
        ...mapState(['resultData']),
        hasErrorQuestion(){
            for(let i in this.resultData){
                if(this.resultData.hasOwnProperty(i)){
                    if(this.resultData[i].result.right===false){
                        return true;
                    }
                }
            }
        }
    },
    methods: {
        ...mapMutations(['changeConfig']),
        viewError(){
            if(!this.isOnlyError && !this.hasErrorQuestion){
                this.$confirm('恭喜您！当前无错题，所有题目都正确。','系统提示',{noBtnShow: false});
            } else {
                this.changeViewType();
            }
        },
        changeViewType() {
            this.isOnlyError = !this.isOnlyError;
            this.changeConfig({
                key: 'onlyError',
                isTruth: this.isOnlyError
            });
        }
    }
};
</script>
