<!-- 题目标记：根据sessionId以及当前题题目id存储标记状态
    question_mark:{session_id+'_'question_id+:boolean},
    序列化存储于localStorage,
    <question-mark :questionId="quesItem.id"></question-mark>
 -->
<template>
    <div class="checkbox-common" @click="changeMarkStatus" v-if="isShow">
        <div class="radio-common-content" :class="{'active':isMark,'disabled':isDisabled}">
            <i class="checkbox"></i>
            <span>标记</span>
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
export default {
    name: 'QuestionMark',
    data() {
        return {
            isMark: false,
            questionMarkData: {}
        };
    },
    mounted() {
        this.getMarkStatus();
    },
    props: {
        questionId: {
            type: String,
            required: true
        }
    },
    computed:{
        ...mapState(['configData','sessionId']),
        ...mapGetters(['initPaperStatu']),
        isShow(){
            return this.initPaperStatu.isShowQuestionMark;
        },
        isDisabled(){
            return !this.configData.editable;
        },
        markKey(){
            return this.sessionId+'_'+this.questionId;
        }
    },
    methods: {
        ...mapMutations(['changeQuestionDoneStatus']),
        getMarkStorage(){
            let questionMarkData = localStorage.getItem('question_mark') || {};
            try {
                this.questionMarkData = JSON.parse(questionMarkData);
            } catch (e) {
                this.questionMarkData = questionMarkData;
            }
        },
        changeMarkStatus() {
            if(this.isDisabled){
                return ;
            }
            this.isMark = !this.isMark;
            this.getMarkStorage();
            this.questionMarkData[this.markKey] = this.isMark;
            localStorage.setItem('question_mark', JSON.stringify(this.questionMarkData));
            this.changeQuestionDoneStatus({
                id: this.questionId,
                key: 'marked',
                isTruth: this.isMark
            });
        },
        getMarkStatus() {
            this.getMarkStorage();
            this.isMark = !!(this.questionMarkData && this.questionMarkData[this.markKey]);
            this.changeQuestionDoneStatus({
                id: this.questionId,
                key: 'marked',
                isTruth: this.isMark
            });
        }
    }
};
</script>
<style lang="scss" scoped>
.checkbox-common .radio-common-content{
    width: 70px;
}
</style>