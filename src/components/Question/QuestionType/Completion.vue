<template>
    <div class="question-order">
        <div v-for="(quesSubItem,quesSubIndex) in quesItem.sub_items">
            <question-title :questionId="quesItem.id" :questionIndex="quesIndex" :questionResult="currentQuestionResult" :quesSubItem="quesSubItem" :isSub="isSub">填空</question-title>
            <div class="answerexplain">
                <p v-if="configData.editable">填写答案</p>
                <p v-if="type==='mark'">学生答案</p>
            </div>
            <ul class="my-answer my-answer-emp">
                <li v-for="(optionItem,optionIndex) in mockOptions">
                    <i>{{optionItem.index}}</i>
                    <fa-input
                        :disabled="isDisabled"
                        v-model="optionItem.result"
                        :maxlength="maxlength"
                        :placeholder="placeholder"
                        @blur="saveAnswer(optionIndex)">
                    </fa-input>
                </li>
            </ul>
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
    mapGetters,
    mapActions
} from 'vuex';
import '../../../filters/filter';
import SectionsComponents from '../Sections';
import QuestionTitle from './QuestionTitle';

export default {
    name: 'Completion',
    mounted() {
        this.parseQuestionSubitem();
        this.$nextTick(()=>{
            this.$emit('randerVideo');
        });
    },
    data() {
        return {
            maxlength: 496,
            placeholder: '',
            mockOptions: []
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
    computed: {
        ...mapState(['configData','resultData','type']),
        ...mapState({
            questionShow: state => state.mark.questionShow
        }),
        ...mapGetters(['initPaperStatu']),
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
        ...mapActions(['saveAnswer']),
        createAnswerArray: function(len, index) {
            if (index === void 0) {
                index = 0;
            }
            var answers = [];
            for (var i = 0; i < len; i++) {
                answers.push({
                    type: 'sequence',
                    index: [i + 1 + index],
                    value: ['']
                });
            }
            return answers;
        },
        //替换提干中的【x】为下划线______
        convertBody: function(body) {
            return body.replace(/([\u3010][1-9]?[0-9]+[\u3011])/g, '$1\u005f\u005f\u005f\u005f\u005f\u005f\u005f\u005f');
        },
        saveAnswer: function(index) {
            if(this.isDisabled){
                return ;
            }
            if (this._answer[index].value[0] !== this.mockOptions[index].result) {
                this._answer[index].value[0] = this.mockOptions[index].result;
            }
            if (!this.isSub) {
                let answerData = {
                    ss: [JSON.stringify(this._answer)]
                };
                this.timeSaveAnswer(answerData);
            } else {
                this.$emit('complex', JSON.stringify(this._answer), this.quesIndex);
            }
        },
        getResultAnswerByType() {
            return this.questionResult && this.questionResult.subs && this.questionResult.subs[this.isSub ? this.quesIndex : 0];
        },
        parseQuestionSubitem(){
            this.quesItem && this.quesItem.sub_items.forEach(item => {
                let answer = this.currentQuestionResult.answer;
                // 解析body设置选项
                item.convert_body = this.convertBody(item.convert_body);
                item.length = item.convert_body.match(/[\u3010][1-9]?[0-9]+[\u3011]/g).length;
                // 用于html模版
                answer = answer?JSON.parse(answer) : this.createAnswerArray(item.length);
                this._answer = answer;
                if (answer.length < item.length) {
                    answer = answer.concat(this.createAnswerArray(item.length - answer.length, answer.length));
                }
                for (let i = 0; i < item.length; i++) {
                    this.mockOptions.push({
                        index: '\u3010' + (i + 1) + '\u3011',
                        result: answer[i].value[0] || ''
                    });
                }
            });
        }
    }
};
</script>
<style lang="scss" scoped>
    .question-order .my-answer li i{
        width:38px;
    }
</style>
