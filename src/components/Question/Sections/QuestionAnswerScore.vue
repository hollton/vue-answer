<!-- 当题作答得分
    <question-answer-score :score="quesSubItem.score"></question-answer-score>
 -->
<template>
    <div class="cor-answer" v-if="showScore">
        <p>得分：<span v-text="score+'分'"></span></p>
    </div>
</template>
<script>
import { mapState,mapGetters } from 'vuex';
export default {
    name: 'QuestionAnswerScore',
    props: ['score'],
    computed: {
        ...mapState(['configData']),
        ...mapGetters(['initPaperStatu']),
        showScore(){
            return this.initPaperStatu.showAnswerScore;
        }
    }
};
</script>
<style lang="scss">
</style>