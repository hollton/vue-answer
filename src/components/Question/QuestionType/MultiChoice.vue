<template>
    <div class="question-order">
        <div v-for="(quesSubItem,quesSubIndex) in quesItem.sub_items">
            <question-title :questionId="quesItem.id" :questionIndex="quesIndex" :questionResult="currentQuestionResult" :quesSubItem="quesSubItem" :isSub="isSub">多选</question-title>
            <fa-checkbox-group v-model="currentAnswer" @change="saveAnswer">
                <div class="my-answer my-answer-mul" v-for="(optionItem,optionIndex) in quesSubItem.options">
                    <fa-checkbox
                        :isCorrect="isCorrect(quesSubItem.answer, optionIndex)"
                        :isWrong="isWrong(quesSubItem.answer, optionIndex, currentAnswer)"
                        :disabled="isDisabled"
                        :label="optionIndex | indexToLetterFilter"
                        :checkboxText="optionIndex | indexToLetterFilter">
                            <span class="option" v-html="optionItem"></span>
                    </fa-checkbox>
                </div>
            </fa-checkbox-group>
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
    name: 'MultiChoice',
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
    data() {
        return {
            currentAnswer:[]
        };
    },
    mounted(){
        this.$nextTick(()=>{
            this.$emit('randerVideo');
        });
        this.getCurrentAnswer();
    },
    computed: {
        ...mapState(['resultData','type']),
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
            this.currentAnswer = this.currentQuestionResult.answer && this.currentQuestionResult.answer.split('') || [];
        },
        saveAnswer: function() {
            if (!this.isSub) {
                let answerData = {
                    ss: [this.currentAnswer.join('')]
                };
                this.timeSaveAnswer(answerData);
            } else {
                this.$emit('complex', this.currentAnswer.join(''), this.quesIndex);
            }
        },
        getResultAnswerByType() {
            return this.questionResult && this.questionResult.subs && this.questionResult.subs[this.isSub ? this.quesIndex : 0];
        },
        isCorrect: function(answer, index) {
            if (!this.initPaperStatu.showAnswer) {
                return;
            }
            let letter = this.$options.filters.indexToLetterFilter(index);
            return answer.indexOf(letter) !== -1;
        },
        isWrong: function(answer, index, resultArray) {
            if (!this.initPaperStatu.showAnswer) {
                return;
            }
            let letter = this.$options.filters.indexToLetterFilter(index);
            let resultString = resultArray.join('');
            return resultString.indexOf(letter) !== -1 && answer.indexOf(letter) === -1;
        }
    }
};
</script>
