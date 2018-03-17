<template>
    <div class="question-order">
        <div v-for="(quesSubItem,quesSubIndex) in quesItem.sub_items">
            <question-title :questionId="quesItem.id" :questionIndex="quesIndex" :questionResult="currentQuestionResult" :quesSubItem="quesSubItem" :isSub="isSub">简答</question-title>
            <div class="writeanswer">
                <p v-if="configData.editable">填写答案</p>
                <p v-if="type==='mark'">学生答案</p>
                <fa-textarea
                    :disabled="isDisabled"
                    v-model="currentAnswer" 
                    @blur="saveAnswer"
                    :maxlength="maxlength"
                    :rows="rows"
                    :placeholder="placeholder">
                </fa-textarea>
            </div>
            <question-answer-score :score="currentQuestionResult && currentQuestionResult.score"></question-answer-score>
            <question-answer :questionItem="quesSubItem" :questionResult="currentQuestionResult"></question-answer>
            <question-standard :standards="quesSubItem.items"></question-standard>
            <slot name="question-img"></slot>
        </div>
    </div>
</template>
<script>
import {
    mapState,
    mapGetters
} from 'vuex';
import SectionsComponents from '../Sections';
import QuestionTitle from './QuestionTitle';

export default {
    name: 'Subjective',
    data() {
        return {
            maxlength:5000,
            rows:5,
            currentAnswer:''
        };
    },
    props: {
        quesItem: {
            type: Object,
            required: true
        },
        quesIndex: {
            type: Number,
            required: true
        },
        isSub: { // 是否为套题的子题，用于区分样式
            type: Boolean
        },
        timeSaveAnswer:{
            type: Function
        },
        isDisabled: Boolean,
        randerVideo:Function
    },
    mounted(){
        this.$nextTick(()=>{
            this.$emit('randerVideo');
        });
        this.getCurrentAnswer();
    },
    computed:{
        ...mapState(['configData','resultData','type']),
        ...mapState({
            questionShow: state => state.mark.questionShow
        }),
        ...mapGetters(['initPaperStatu']),
        placeholder(){
            return this.configData.editable?'请在此输入您的答案':'';
        },
        currentQuestionResult(){
            return this.getResultAnswerByType() || {};
        },
        questionResult(){
            return this.resultData[this.quesItem.id];
        }
    },
    components: {
        ...SectionsComponents,
        QuestionTitle
    },
    methods: {
        getCurrentAnswer(){
            this.currentAnswer = this.currentQuestionResult.answer || '';

        },
        saveAnswer:function(){
            if(this.isDisabled){
                return ;
            }
            if(!this.isSub){
                let answerData = {
                    ss: [this.currentAnswer]
                };
                this.timeSaveAnswer(answerData);
            } else {
                this.$emit('complex',this.currentAnswer, this.quesIndex);
            }
        },
        getResultAnswerByType(){
            return this.questionResult && this.questionResult.subs && this.questionResult.subs[this.isSub?this.quesIndex:0];
        }
    }
};
</script>
<style lang="scss" scoped>
</style>
