<!-- 题目对错状态
    <question-status :questionResult="quesResult"></question-status>
    question_answer_status:"int",//作答状态[0: Undo 未做, 1: Done 有做题（未评分）, 5: Correct 完全正确, 7: Wrong 错误，非全部正确, 9: Invalid 无效的答案]
 -->
<template>
    <!-- <i v-show="showStatus" class="fa-status" :class="statusClass"></i> -->
</template>
<script>
import { mapMutations } from 'vuex';
import {questionStatusToIsRight} from '../../../utils/question';
export default {
    name: 'QuestionStatus',
    props: ['questionResult'],
    data() {
        return {
            showStatus: true,
            statusClass: ''
        };
    },
    mounted() {
        this.getQuestionStatus(this.questionResult.question_answer_status);
    },
    methods: {
        ...mapMutations(['changeQuestionDoneStatus']),
        getQuestionStatus:function(status){
            let isRight = questionStatusToIsRight(status);
            if(isRight===undefined){
                this.showStatus = false;
            } else {
                this.statusClass = isRight? 'right':'wrong';
                this.setQuestionStatus(isRight);
            }
        },
        setQuestionStatus: function(isRight) {
            this.changeQuestionDoneStatus({
                id: this.questionResult.id,
                key: 'right',
                isTruth: isRight
            });
        }
    }
};
</script>
<style lang="scss" scoped>
i.fa-status{
    background: url('../../../assets/images/ico-spr.png') no-repeat;
    width:45px;
    height:42px;
    display:inline-block;
    position: absolute;
    left: 6px;
    margin-top: -8px;

    &.right{
        background-position:0px -27px;
    }
    &.wrong{
        background-position:-50px -27px;
    }
}
</style>