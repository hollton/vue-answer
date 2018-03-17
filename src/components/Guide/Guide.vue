<template>
    <div>
        <div class="slp-ui-guide" v-show="guideIsShow">
            <div class="slp-ui-guide__wrapper">
                <div class="slp-ui-guide__step slp-active" :class="guideClass" :style="{'right':markWidthPx}">
                    <!-- 激活slp-active -->
                    <div class="slp-ui-guide__steppic"></div>
                    <a :class="{'slp-ui-guide__stepfinish':isLastGuide,'slp-ui-guide__stepbtn':!isLastGuide}" @click="nextStep(isLastGuide)"></a>
                </div>

            </div>
        </div>
        <a class="slp-ui-btn slp-ui-btn--lightghost slp-ui-btn--l slp-mod-guidebtn"
             v-show="guideIsShow"
            @click="completeStep(isLastGuide)"
            v-text="isLastGuide?'再看一遍':'跳过提示'"></a>
        <a class="slp-ui-help slp-mod-help" v-show="!guideIsShow" @click="guideShowInit(true)">
            <!-- sl-disabled 禁用 -->
            <span class="slp-ui-help__txt">帮助</span>
        </a>
    </div>
</template>
<script>
import {mapState} from 'vuex';
export default {
    name: 'guide',
    data(){
        return  {
            lastGuideIndex:6,
            currentGuideIndex:0,
            guideIsShow:false
        };
    },
    computed: {
        ...mapState({
            markWidth: state => state.mark.markWidth
        }),
        guideClass(){
            if(this.guideIsShow){
                let guideIndex = this.currentGuideIndex;
                this.$store.commit('setGuideIndex',guideIndex);
                return 'slp-ui-guide__step'+guideIndex;
            } else {
                this.$store.commit('setGuideIndex',0);
            }
        },
        isLastGuide(){
            return this.currentGuideIndex === this.lastGuideIndex;
        },
        // 步骤1、2遮罩依赖评分区宽度做调整
        markWidthPx(){
            let _markWidthPx;
            switch (this.currentGuideIndex){
                case 1:
                    _markWidthPx = this.markWidth+20+'px';
                    break;
                case 2:
                    _markWidthPx = this.markWidth+40+'px';
                    break;
                default:
                    _markWidthPx = '';
                    break;
            }
            return _markWidthPx;
        }
    },
    methods: {
        // 下一引导步骤，最后一步完成引导，关闭遮罩
        nextStep(isLastGuide){
            if(isLastGuide){
                this.guideShowInit(false);
                window.localStorage.setItem('guideIsView',true);
            } else {
                this.currentGuideIndex++;
            }
        },
        // 跳过\重看引导
        completeStep(isLastGuide){
            window.localStorage.setItem('guideIsView',true);
            this.guideShowInit(isLastGuide);
        },
        guideShowInit(isShow){
            this.guideIsShow = isShow;
            this.currentGuideIndex = 1;
            this.$store.commit('setDisableKeyBoard', isShow);
        }
    },
    mounted(){
        this.guideIsShow = !window.localStorage.getItem('guideIsView');
        if(this.guideIsShow){
            this.guideShowInit(true);
        }
    }
};
</script>