<template>
    <div class="question-order">
        <div v-for="(quesSubItem,quesSubIndex) in quesItem.sub_items">
            <question-title :questionId="quesItem.id" :questionIndex="quesIndex" :questionResult="currentQuestionResult" :quesSubItem="quesSubItem" :isSub="isSub">判断</question-title>
            <div class="my-answer" v-for="(optionItem,optionIndex) in mockOptions">
                <fa-radio
                    :isCorrect="isCorrect(quesSubItem.answer,optionItem)"
                    :isWrong="isWrong(quesSubItem.answer,optionItem,currentAnswer)"
                    :disabled="isDisabled"
                    :label="optionItem"
                    :radioText="optionIndex | indexToLetterFilter"
                    v-model="currentAnswer"
                    @change="saveAnswer">
                        <span class="option" v-text="optionItem"></span>
                </fa-radio>
            </div>
            <question-answer-score :score="currentQuestionResult && currentQuestionResult.score"></question-answer-score>
            <question-answer :questionItem="quesSubItem" :questionResult="currentQuestionResult"></question-answer>
            <question-standard :standards="quesSubItem.items"></question-standard>
        </div>
    </div>
</template>
<script>
import {
    mapState,
    mapGetters
} from 'vuex';
import '../../../filters/filter';
import SectionsComponents from '../Sections';
import QuestionTitle from './QuestionTitle';

export default {
    name: 'Judgement',
    data() {
        return {
            mockOptions: ['对', '错'],
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
        timeSaveAnswer: {
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
    computed: {
        ...mapState(['configData','resultData','type']),
        ...mapState({
            questionShow: state => state.mark.questionShow
        }),
        ...mapGetters(['initPaperStatu']),
        currentQuestionResult() {
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
            this.currentAnswer = this.currentQuestionResult.answer;
        },
        saveAnswer: function() {
            if (!this.isSub) {
                let answerData = {
                    ss: [this.currentAnswer]
                };
                this.timeSaveAnswer(answerData);
            } else {
                this.$emit('complex', this.currentAnswer,this.quesIndex);
            }
        },
        getResultAnswerByType() {
            return this.questionResult && this.questionResult.subs && this.questionResult.subs[this.isSub ? this.quesIndex : 0];
        },
        isCorrect: function(answer, labelValue) {
            if (!this.initPaperStatu.showAnswer) {
                return;
            }
            return answer === labelValue;
        },
        isWrong: function(answer, labelValue, result) {
            if (!this.initPaperStatu.showAnswer) {
                return;
            }
            return result === labelValue && answer !== result;
        }
    }
};
</script>
