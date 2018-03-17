<!-- 除套题其他题型的题干部分 -->
<template>
    <transition name="question-fade">
        <h4 :class="{'false':showAnswerError}" v-show="questionShow || isSub">
            <div class="question-title">
                <question-mark v-if="!isSub" :questionId="questionId"></question-mark>
                <span v-text="questionIndex+1"></span>
                <span v-show="isSub" v-text="')'"></span>
                <span v-text="'.'"></span>
                <em class="icon-select"><slot></slot></em>
                <question-score :score="quesSubItem && quesSubItem.score"></question-score>
            </div>
            <span v-html="quesSubItem.convert_body"></span>
        </h4>
    </transition>
</template>
<script>
import { mapState,mapGetters } from 'vuex';
import SectionsComponents from '../Sections';
import {isSubjective} from '../../../utils/question';
export default {
    name: 'QuestionTitle',
    props: ['questionId', 'questionIndex', 'quesSubItem', 'questionResult', 'isSub'],
    computed: {
        ...mapState(['type']),
        ...mapState({
            questionShow: state => state.mark.questionShow
        }),
        ...mapGetters(['initPaperStatu']),
        showAnswerError(){  //作答错误且查看答案时设置答错样式
            if(this.initPaperStatu.showAnswer && this.type==='answer' && this.questionResult && this.questionResult.question_answer_status !==5){
                return true;
            }
        }
    },
    methods:{
        isSubjective:isSubjective
    },
    components: {
        ...SectionsComponents
    }
};
</script>

<style lang="scss" scoped>
</style>