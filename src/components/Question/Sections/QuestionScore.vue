<!-- 题目分值
    <question-score :score="quesSubItem.score"></question-score>
 -->
<template>
    <span v-if="showScore" v-text="questionScore"></span>
</template>
<script>
import { mapState,mapGetters } from 'vuex';
export default {
    name: 'QuestionScore',
    props: ['score'],
    computed: {
        ...mapState(['configData']),
        ...mapGetters(['initPaperStatu']),
        showScore(){
            return this.initPaperStatu.showQuestionScore;
        },
        questionScore(){
            return `（${this.score}分）`;
        }
    }
};
</script>
<style lang="scss" scoped>
</style>