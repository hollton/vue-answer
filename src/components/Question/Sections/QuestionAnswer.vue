<!-- 题目答案
    <question-answer :questionItem="quesSubItem" :questionResult="answerResult"></question-answer>
 -->
<template>
    <div v-if="initPaperStatu.showAnswer">
        <!-- 非填空主观 -->
        <div v-if="!isSubjective" class="cor-answer">
            <p>正确答案：<span class="truecoli" v-text="questionItem.answer"></span></p>
            <p v-if="showStudentAnswer">我的答案：
                <span v-if="formatResultAnswer" :class="[answerRight?'truecolt':'falsecolt']" v-text="formatResultAnswer"></span>
                <span v-if="!formatResultAnswer" class="falsecolt">未作答</span>
            </p>
            <span v-if="showStudentAnswer" :class="[answerRight?'truecolt':'falsecolt']">{{answerRight?'答对了':'答错了'}}<i></i></span>
        </div>
        <!-- 填空主观 -->
        <div v-if="isSubjective" class="answerexplain">
            <p>参考答案</p>
            <!-- 主观 -->
            <p v-if="questionItem.question_type===25" v-html="questionItem.answer"></p>
            <!-- 填空 -->
            <div v-if="questionItem.question_type===20">
                <p v-for="item in parseResultAnswer">
                    <span v-text="'【'+item.index[0]+'】'"></span>
                    <span v-html="item.value[0]"></span>
                </p>
            </div>
            <div class="cor-answer" v-if="showStudentAnswer">
                <span :class="[answerRight?'truecolt':'falsecolt']">{{answerRight?'答对了':'答错了'}}<i></i></span>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import {questionStatusToIsRight} from '../../../utils/question';
export default {
    name: 'QuestionAnswer',
    props: ['questionItem','questionResult'],
    computed:{
        ...mapState(['type']),
        ...mapGetters(['initPaperStatu']),
        answerRight(){
            return questionStatusToIsRight(this.questionResult.question_answer_status);
        },
        isSubjective(){
            return this.questionItem.question_type===20 || this.questionItem.question_type===25;
        },
        showStudentAnswer(){
            return this.type==='answer';
        },
        parseResultAnswer(){
            let parseAnswer;
            try{
                parseAnswer = JSON.parse(this.questionItem.answer);
            } catch(e){
                parseAnswer = this.questionItem.answer;
            }
            return parseAnswer;
        },
        formatResultAnswer(){
            let formatAnswer;
            try{
                formatAnswer = this.questionResult && this.questionResult.answer.join('');
            } catch(e){
                formatAnswer = this.questionResult.answer;
            }
            return formatAnswer;
        }
    }
};
</script>
<style lang="scss" scoped>
</style>