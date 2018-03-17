<template>
    <div class="question-order">
        <div v-for="(quesSubItem,quesSubIndex) in quesItem.sub_items">
            <question-title :questionId="quesItem.id" :questionIndex="quesIndex" :questionResult="currentQuestionResult" :quesSubItem="quesSubItem" :isSub="isSub">单选</question-title>
            <div class="my-answer" v-for="(optionItem,optionIndex) in quesSubItem.options">
                <fa-radio
                    :isCorrect="isCorrect(quesSubItem.answer,optionIndex)"
                    :isWrong="isWrong(quesSubItem.answer,optionIndex,currentAnswer)"
                    :disabled="isDisabled"
                    :label="optionIndex | indexToLetterFilter"
                    :radioText="optionIndex | indexToLetterFilter"
                    v-model="currentAnswer"
                    @change="saveAnswer">
                        <span class="option" v-html="optionItem"></span>
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
    name: 'SingleChoice',
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
    data(){
        return {
            currentAnswer:''
        };
    },
    computed: {
        ...mapState(['resultData','type']),
        ...mapState({
            questionShow: state => state.mark.questionShow
        }),
        ...mapGetters(['initPaperStatu']),
        // 当前大题或套题子题作答结果
        currentQuestionResult() {
            return this.getResultAnswerByType() || {};
        },
        //当前大题作答结果
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
        // 获取作答数据
        getResultAnswerByType() {
            // isSub区分单题、套题子题的题目序数。其他题型同。
            return this.questionResult && this.questionResult.subs && this.questionResult.subs[this.isSub ? this.quesIndex : 0];
        },
        isCorrect: function(answer, index) {
            if (!this.initPaperStatu.showAnswer) {
                return;
            }
            // js 中使用filters
            return answer === this.$options.filters.indexToLetterFilter(index);
        },
        isWrong: function(answer, index, result) {
            if (!this.initPaperStatu.showAnswer) {
                return;
            }
            return result === this.$options.filters.indexToLetterFilter(index) && answer !== result;
        }
    }
};
</script>