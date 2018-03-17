<template>
    <div :class="{'examine-answer-body-left':type!=='mark'}">
        <transition name="question-fade">
            <div class="examine-body-left-title" v-show="questionShow" :class="{'auto-height':autoHeight,'false':showAnswerError}">
                <div class="question-order">
                    <h2>
                        <div class="question-title">
                            <span v-text="quesIndex+1"></span>
                            <span v-text="'.'"></span>
                            <em>[套题]</em>
                            <question-mark :questionId="quesItem.id"></question-mark>
                        </div>
                        <div v-html="selfQuesItem.convert_complex_body"></div>
                    </h2>
                </div>
            </div>
        </transition>
        <div class="examine-body-left-body" :class="{'auto-height':autoHeight}">
            <div v-for="(quesSubItem,quesSubIndex) in selfQuesItem.sub_items" :id="'complexSubQuestionType'+quesSubIndex">
                <component
                    :is="quesSubItem.question_type | questionTypeFilter"
                    v-if="!ishideQuestion(quesSubItem.question_type)"
                    :quesItem="quesSubItem"
                    :quesIndex="quesSubIndex"
                    :isSub="true"
                    :isDisabled="isDisabled"
                    @complex="saveAnswer"
                    @randerVideo="randerNestVideo">
                        <question-image
                            slot="question-img"
                            :questionResult="questionResult"
                            :timeSaveAnswer="timeSaveAnswer"
                            :for-complex="true"
                            :editable="configData.editable"
                            :sub-question-index="quesSubIndex+1">
                        </question-image>
                </component>
            </div>
            <slot v-if="needUploadPic" name="question-img"></slot>
        </div>
    </div>
</template>
<script>
import '../../../filters/filter';
import QuestionsComponents from './index';
import SectionsComponents from '../Sections';
import {
    mapState,
    mapGetters
} from 'vuex';
import {isSubjective} from '../../../utils/question';

export default {
    name: 'Complex',
    components: {
        ...QuestionsComponents,
        ...SectionsComponents
    },
    data() {
        return {
            needUploadPic:false
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
    },
    computed: {
        ...mapState(['configData','resultData','type']),
        ...mapState({
            questionShow: state => state.mark.questionShow,
            onlyMarkSubjective: state => state.mark.onlyMarkSubjective
        }),
        ...mapGetters(['initPaperStatu']),
        // 当前大题作答结果
        questionResult(){
            return this.resultData[this.selfQuesItem.id];
        },
        // 处理子题结构，方便直接调用题型组件
        selfQuesItem(){
            this.quesItem.sub_items = this.quesItem.sub_items.map((subQues) => {
                // 子题含主观题才显示图片上传
                if(subQues.question_type===20 || subQues.question_type===25){
                    this.needUploadPic = true;
                }
                subQues.id = this.quesItem.id;
                subQues.sub_items = [subQues];
                // subQues = {
                //     id:this.quesItem.id,
                //     question_type:subQues.question_type,
                //     body:subQues.body,
                //     sub_items:[subQues]
                // };
                return subQues;
            });
            return this.quesItem;
        },
        // 套题不限定最大高度
        autoHeight(){
            return true;
            //return this.type==='answer' && !this.configData.editable;
        },
        showAnswerError(){
            if(this.initPaperStatu.showAnswer && this.type==='answer' && this.questionResult && this.questionResult.question_answer_status !==5){
                return true;
            }
        }
    },
    methods: {
        saveAnswer: function(currentAnswer, currentIndex) {
            // 填充原有作答结果，再更新此次作答
            let storeSs = this.questionResult.ss || [];

            // 补全套题未填项
            this.selfQuesItem.sub_items.forEach((subItem, subIndex) => {
                storeSs[subIndex] = storeSs[subIndex] ? storeSs[subIndex] : '';
            });
            storeSs[currentIndex] = currentAnswer;

            let answerData = {
                ss: storeSs
            };
            this.timeSaveAnswer(answerData);
        },
        randerNestVideo(){
            this.$emit('randerVideo');
        },
        ishideQuestion(questionType){ // 批阅时不显示客观题
            return this.type==='mark' && this.onlyMarkSubjective  && !isSubjective(questionType);
        }
    }
};
</script>
<style lang="scss">
    .auto-height{
        max-height:none!important;
        overflow:hidden!important;
    }
    .examine-answer-body-left{
        .examine-body-left-title{
            border-top: 1px solid #e6e7e8;
            background-color: #f6f8fa;
            &.false{
                background-color: #ffefef;
            }
        }
        .examine-body-left-body{
            border-top: none;
            border-bottom: none;

        }
    }
</style>